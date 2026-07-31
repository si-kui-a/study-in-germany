// supabase/functions/moderate-content/index.ts
// 由 public.notify_ai_moderation() trigger 呼叫(見 0001_ai_moderation_flag.sql)。
// 收到新的 user_submissions/reports 資料 → 分類 → 用 service_role 寫回
// ai_flag/ai_flag_reason/ai_flagged_at → 發 Discord 通知(非「看似正常」才附
// 核准/駁回按鈕)。
//
// 設計原則:純參考標記,絕不自動核准/拒絕/刪除任何內容。Discord 通知失敗不影響
// ai_flag 已經寫回成功這件事,只記log(這是非同步後續處理,trigger端是
// fire-and-forget)。
//
// 零AI依賴(2026-07-31):實際投稿量極低(每月頂多個位數),且無論分類結果為何都
// 會發Discord通知給管理員親自看過,AI能省下的只是「明顯正常內容不用按核准」這點
// 力氣,不值得為此維護一個外部API依賴(曾因GEMINI_API_KEY失效整條分類失敗)。
// 完全移除AI呼叫:
// - reports 表的 reason 是檢舉人自選的固定分類,直接映射
// - user_submissions 先跑關鍵字規則(廣告),沒命中一律直接標「需人工複核」
//
// 分類修正(2026-07-31):new_school/new_recommendation 這兩類投稿本來就該附
// 學校網站/地圖連結,純URL不能當廣告特徵(誤判案例:洪堡學院投稿附Google Maps
// 連結),只對這兩類跳過URL規則,聯絡方式/攬客用詞規則仍全類型套用
//
// 部署注意(實測踩過的坑):trigger呼叫時不帶Supabase JWT/apikey,只帶
// x-webhook-secret驗證身分,所以部署時必須加 --no-verify-jwt,否則
// Supabase平台會在請求進到這支function的程式碼之前就先擋下並回401,
// 此時這裡的console.error完全不會被觸發、log也是空的,只能從
// net._http_response表(status_code=401)才看得出來:
//   supabase functions deploy moderate-content --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_TABLES = ["user_submissions", "reports"] as const;

const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") ?? "";
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
// URL類規則:new_school/new_recommendation本來就會附學校網站/地圖連結,是建議
// 內容的正常組成部分,不能當廣告特徵,只對其餘類型(school_edit/general_feedback)套用
const URL_PATTERNS: RegExp[] = [
  /https?:\/\//i,
  /www\.[a-z0-9-]+\.(com|net|tw|shop|xyz)/i,
];
// 聯絡方式/攬客用詞:不管哪種投稿類型,出現這些都是明確廣告特徵,一律套用
const CONTACT_AD_PATTERNS: RegExp[] = [
  /line\s*id[:：]?\s*[\w.]+/i,
  /加(我)?\s*line/i,
  /\b09\d{2}[-\s]?\d{3}[-\s]?\d{3}\b/, // 台灣手機號碼格式
  /優惠碼|折扣碼|限時搶購|免費諮詢|私訊詳談|line@|一對一指導|加賴/,
];

function matchesAdPattern(content: string, submissionType: string): boolean {
  const patterns = ["new_school", "new_recommendation"].includes(submissionType)
    ? CONTACT_AD_PATTERNS
    : [...URL_PATTERNS, ...CONTACT_AD_PATTERNS];
  return patterns.some((re) => re.test(content));
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
    // user_submissions:先跑關鍵字規則,命中就不呼叫AI(new_school/new_recommendation
    // 排除純URL規則,因為那兩類本來就該附學校網站/地圖連結,不是廣告特徵)
    const { data: submissionRow } = await supabase
      .from("user_submissions")
      .select("submission_type")
      .eq("id", payload.id)
      .single();
    const submissionType = submissionRow?.submission_type ?? "";

    if (payload.content.trim() && matchesAdPattern(payload.content, submissionType)) {
      flag = "疑似廣告";
      reason = submissionType === "new_school" || submissionType === "new_recommendation"
        ? "命中廣告關鍵字規則(聯絡方式/常見廣告用詞),未呼叫AI"
        : "命中廣告關鍵字規則(網址/聯絡方式/常見廣告用詞),未呼叫AI";
    } else {
      // 沒命中關鍵字規則:量少(每月頂多個位數),不值得為此維護AI呼叫,
      // 直接標需人工複核讓管理員看過(反正這個flag無論如何都會發Discord通知)
      reason = payload.content.trim() ? "未命中規則,請人工複核" : "內容為空,請人工複核";
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
