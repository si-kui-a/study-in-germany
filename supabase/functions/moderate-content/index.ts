// supabase/functions/moderate-content/index.ts
// 由 public.notify_ai_moderation() trigger 呼叫(見 0001_ai_moderation_flag.sql)。
// 收到新的 user_submissions/reports 資料 → 分類 → 用 service_role 寫回
// ai_flag/ai_flag_reason/ai_flagged_at → 發 Discord 通知(非「看似正常」才附
// 核准/駁回按鈕)。
//
// 設計原則:純參考標記,絕不自動核准/拒絕/刪除任何內容;Gemini 呼叫失敗一律
// 只記 log、回傳非 200 狀態碼供除錯,不影響原本已完成的 INSERT(這是非同步
// 後續處理,trigger 端是 fire-and-forget)。Discord 通知失敗同理,不影響
// ai_flag 已經寫回成功這件事。
//
// 降低AI依賴(2026-07-31):
// - reports 表的 reason 是檢舉人自選的固定分類,比AI從短文字猜測更可靠,
//   直接映射不呼叫Gemini
// - user_submissions 先跑關鍵字規則,命中明確廣告特徵才跳過Gemini
//
// 部署注意(實測踩過的坑):trigger呼叫時不帶Supabase JWT/apikey,只帶
// x-webhook-secret驗證身分,所以部署時必須加 --no-verify-jwt,否則
// Supabase平台會在請求進到這支function的程式碼之前就先擋下並回401,
// 此時這裡的console.error完全不會被觸發、log也是空的,只能從
// net._http_response表(status_code=401)才看得出來:
//   supabase functions deploy moderate-content --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_FLAGS = ["疑似廣告", "虛假資訊", "需人工複核", "看似正常"] as const;
const ALLOWED_TABLES = ["user_submissions", "reports"] as const;

const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") ?? "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const DISCORD_BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN") ?? "";
const DISCORD_CHANNEL_ID = Deno.env.get("DISCORD_CHANNEL_ID") ?? "";

interface Payload {
  table: string;
  id: number;
  content: string;
}

// ── reports.reason → ai_flag 直接映射(檢舉人自選分類,比AI猜測可靠,零AI呼叫) ──
const REASON_TO_FLAG: Record<string, string> = {
  spam: "疑似廣告",
  misinformation: "虛假資訊",
  inappropriate: "需人工複核",
  harassment: "需人工複核",
  other: "需人工複核",
};

// ── user_submissions 關鍵字前濾(命中才跳過Gemini,沒命中維持原本AI分類路徑) ──
const AD_PATTERNS: RegExp[] = [
  /https?:\/\//i,
  /www\.[a-z0-9-]+\.(com|net|tw|shop|xyz)/i,
  /line\s*id[:：]?\s*[\w.]+/i,
  /加(我)?\s*line/i,
  /\b09\d{2}[-\s]?\d{3}[-\s]?\d{3}\b/, // 台灣手機號碼格式
  /優惠碼|折扣碼|限時搶購|免費諮詢|私訊詳談|line@|一對一指導|加賴/,
];

function matchesAdPattern(content: string): boolean {
  return AD_PATTERNS.some((re) => re.test(content));
}

async function classifyWithGemini(content: string): Promise<{ flag: string; reason: string }> {
  const prompt =
    "以下是一個留學德國社群網站上的使用者投稿或檢舉內容。請判斷屬於下列四類中的哪一類," +
    "只能回傳這四個詞其中之一,不可自創其他分類:「疑似廣告」「虛假資訊」「需人工複核」「看似正常」。\n" +
    "同時給一句話(20字以內)的判斷理由。\n" +
    "只回傳JSON,格式:{\"flag\": \"...\", \"reason\": \"...\"}\n\n" +
    "內容:\n" + content;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
    }),
  });

  if (!resp.ok) {
    throw new Error(`gemini HTTP ${resp.status}: ${await resp.text()}`);
  }
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const parsed = JSON.parse(text);
  if (!ALLOWED_FLAGS.includes(parsed.flag)) {
    throw new Error(`gemini回傳不合法的flag: ${parsed.flag}`);
  }
  return { flag: parsed.flag, reason: String(parsed.reason ?? "").slice(0, 100) };
}

// deno-lint-ignore no-explicit-any
async function fetchTargetPreview(supabase: any, targetType: string, targetId: string): Promise<string> {
  // reports 通知要顯示「實際被檢舉的內容」,不能只給report自己的note,
  // 不然管理員得盲目點開Dashboard才知道在檢舉什麼
  try {
    if (targetType === "listing") {
      const { data } = await supabase.from("listings").select("title,description").eq("id", targetId).single();
      return data ? `【刊登】${data.title}\n${(data.description ?? "").slice(0, 200)}` : "(找不到對應刊登,可能已被刪除)";
    }
    if (targetType === "review") {
      const { data } = await supabase.from("school_reviews").select("comment_text").eq("id", targetId).single();
      return data ? `【評價】${(data.comment_text ?? "").slice(0, 200)}` : "(找不到對應評價,可能已被刪除)";
    }
    if (targetType === "submission") {
      const { data } = await supabase.from("user_submissions").select("title,content").eq("id", targetId).single();
      return data ? `【投稿】${data.title}\n${(data.content ?? "").slice(0, 200)}` : "(找不到對應投稿,可能已被刪除)";
    }
  } catch (e) {
    console.error("fetchTargetPreview失敗:", e);
  }
  return "(無法載入被檢舉內容預覽)";
}

const FLAG_COLOR: Record<string, number> = {
  "疑似廣告": 15105570,   // 橙
  "虛假資訊": 15158332,   // 紅
  "需人工複核": 15105570, // 橙
  "看似正常": 5793266,    // 藍紫(資訊性質,無需動作)
};

interface NotifyArgs {
  table: string;
  id: number;
  flag: string;
  reason: string;
  contentPreview: string;
}

async function sendDiscordNotification({ table, id, flag, reason, contentPreview }: NotifyArgs) {
  if (!DISCORD_BOT_TOKEN || !DISCORD_CHANNEL_ID) {
    console.error("Discord通知略過:DISCORD_BOT_TOKEN或DISCORD_CHANNEL_ID未設定");
    return;
  }

  const embed = {
    title: `${table === "reports" ? "檢舉" : "投稿"}審核提醒：${flag}`,
    description: `${contentPreview}\n\n**判斷理由**：${reason}`,
    color: FLAG_COLOR[flag] ?? 9807270,
    fields: [
      { name: "資料表", value: table, inline: true },
      { name: "ID", value: String(id), inline: true },
    ],
    timestamp: new Date().toISOString(),
  };

  // deno-lint-ignore no-explicit-any
  const components: any[] = [];
  if (flag !== "看似正常") {
    components.push({
      type: 1,
      components: [
        { type: 2, style: 3, label: "核准", custom_id: `approve:${table}:${id}` },
        { type: 2, style: 4, label: "駁回", custom_id: `reject:${table}:${id}` },
      ],
    });
  }

  const resp = await fetch(`https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ embeds: [embed], components }),
  });
  if (!resp.ok) {
    console.error(`Discord通知發送失敗 HTTP ${resp.status}:`, await resp.text());
  }
}

Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: "invalid webhook secret" }), { status: 401 });
  }

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid JSON body" }), { status: 400 });
  }

  if (!ALLOWED_TABLES.includes(payload.table as typeof ALLOWED_TABLES[number])) {
    return new Response(JSON.stringify({ error: `unexpected table: ${payload.table}` }), { status: 400 });
  }
  if (!payload.content || !payload.content.trim()) {
    // content為空(理論上不該發生,DB層已有CHECK約束)時直接標記需人工複核,不呼叫Gemini浪費額度
    payload = { ...payload, content: "" };
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  let flag = "需人工複核";
  let reason = "";
  let contentPreview = payload.content;

  if (payload.table === "reports") {
    // reason是檢舉人自選的固定分類,比AI從note短文字猜測更可靠,不呼叫Gemini
    const { data: reportRow, error: reportErr } = await supabase
      .from("reports")
      .select("reason,target_type,target_id,note")
      .eq("id", payload.id)
      .single();
    if (reportErr || !reportRow) {
      console.error(`讀取reports資料失敗 id=${payload.id}:`, reportErr);
      flag = "需人工複核";
      reason = "無法讀取檢舉資料,請人工複核";
    } else {
      flag = REASON_TO_FLAG[reportRow.reason] ?? "需人工複核";
      reason = `檢舉分類：${reportRow.reason}` + (reportRow.note ? `（備註：${reportRow.note.slice(0, 60)}）` : "");
      contentPreview = await fetchTargetPreview(supabase, reportRow.target_type, reportRow.target_id);
    }
  } else {
    // user_submissions:先跑關鍵字規則,命中就不呼叫AI
    if (payload.content.trim() && matchesAdPattern(payload.content)) {
      flag = "疑似廣告";
      reason = "命中廣告關鍵字規則(網址/聯絡方式/常見廣告用詞),未呼叫AI";
    } else {
      try {
        if (payload.content.trim()) {
          const result = await classifyWithGemini(payload.content);
          flag = result.flag;
          reason = result.reason;
        } else {
          reason = "內容為空,無法分類";
        }
      } catch (e) {
        console.error(`gemini分類失敗 table=${payload.table} id=${payload.id}:`, e);
        reason = "Gemini分類失敗,請人工複核";
      }
    }
  }

  const { error } = await supabase
    .from(payload.table)
    .update({ ai_flag: flag, ai_flag_reason: reason, ai_flagged_at: new Date().toISOString() })
    .eq("id", payload.id);

  if (error) {
    console.error(`寫回ai_flag失敗 table=${payload.table} id=${payload.id}:`, error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  try {
    await sendDiscordNotification({ table: payload.table, id: payload.id, flag, reason, contentPreview });
  } catch (e) {
    // Discord通知失敗不影響ai_flag已經寫回成功這件事,只記log
    console.error(`Discord通知失敗 table=${payload.table} id=${payload.id}:`, e);
  }

  return new Response(JSON.stringify({ table: payload.table, id: payload.id, flag, reason }), { status: 200 });
});
