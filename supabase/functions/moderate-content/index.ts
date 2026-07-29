// supabase/functions/moderate-content/index.ts
// 由 public.notify_ai_moderation() trigger 呼叫(見 0001_ai_moderation_flag.sql)。
// 收到新的 user_submissions/reports 資料 → 呼叫 Gemini 免費層分類 → 用
// service_role 寫回 ai_flag/ai_flag_reason/ai_flagged_at。
//
// 設計原則:純參考標記,絕不自動核准/拒絕/刪除任何內容;Gemini 呼叫失敗一律
// 只記 log、回傳非 200 狀態碼供除錯,不影響原本已完成的 INSERT(這是非同步
// 後續處理,trigger 端是 fire-and-forget)。
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

interface Payload {
  table: string;
  id: number;
  content: string;
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

  const { error } = await supabase
    .from(payload.table)
    .update({ ai_flag: flag, ai_flag_reason: reason, ai_flagged_at: new Date().toISOString() })
    .eq("id", payload.id);

  if (error) {
    console.error(`寫回ai_flag失敗 table=${payload.table} id=${payload.id}:`, error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ table: payload.table, id: payload.id, flag, reason }), { status: 200 });
});
