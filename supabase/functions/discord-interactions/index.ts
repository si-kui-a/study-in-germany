// supabase/functions/discord-interactions/index.ts
// Discord Interactions Endpoint——接收管理員在Discord點擊「核准」「駁回」按鈕的
// callback,依 custom_id 執行對應的資料庫動作,並直接編輯原訊息(移除按鈕、顯示
// 處理結果),不需要另外呼叫Discord的訊息編輯API(用互動回應type 7 UPDATE_MESSAGE
// 一次做到)。
//
// custom_id 格式:"approve:{table}:{id}" / "reject:{table}:{id}"
// - table="user_submissions":直接改該筆的status
// - table="reports":這是「檢舉」,核准/駁回的對象是被檢舉的內容(target_type/
//   target_id),不是report本身——先查reports拿到target資訊,依target_type分派:
//     target_type="submission" -> 改user_submissions.status
//     target_type="listing"    -> reject時把expires_at設成現在(重用既有可視性
//                                  機制,listings沒有status欄位,不新增schema)
//                                  approve時不動listing,只把report標記已處理
//     target_type="review"     -> reject時把hidden_at設成現在(軟性下架,
//                                  RLS對他人隱藏、本人仍看得到,見migration
//                                  0007);滿1個月由pg_cron(purge_hidden_reviews)
//                                  自動清除,不是立即真的刪除
//   動作完成後一律把該筆report自己的status改成"reviewed"
//
// 部署:supabase functions deploy discord-interactions --no-verify-jwt
// (Discord呼叫不帶Supabase JWT,原理同moderate-content)
//
// 安全性注意:按鈕點擊本身沒有額外的「誰能點」限制,安全邊界是Discord頻道的
// 存取控制本身——這個頻道/DM只給管理員看得到,才能當作「只有管理員能核准」的
// 保證,這點在部署文件裡有明確提醒。

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nacl from "https://esm.sh/tweetnacl@1.0.3";

const DISCORD_PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function verifyDiscordSignature(signature: string, timestamp: string, body: string): boolean {
  try {
    return nacl.sign.detached.verify(
      new TextEncoder().encode(timestamp + body),
      hexToUint8Array(signature),
      hexToUint8Array(DISCORD_PUBLIC_KEY),
    );
  } catch {
    return false; // 簽章格式不對(如非hex字串)一律視為驗證失敗,不拋例外
  }
}

// deno-lint-ignore no-explicit-any
async function applyAction(supabase: any, action: "approve" | "reject", table: string, id: string): Promise<string> {
  if (table === "user_submissions") {
    const status = action === "approve" ? "approved" : "rejected";
    const { error } = await supabase.from("user_submissions").update({ status }).eq("id", id);
    if (error) throw error;
    return action === "approve" ? "✅ 已核准並上架" : "❌ 已駁回，不會顯示於網站";
  }

  if (table === "reports") {
    const { data: report, error: reportErr } = await supabase
      .from("reports").select("target_type,target_id").eq("id", id).single();
    if (reportErr || !report) throw reportErr ?? new Error("找不到對應的檢舉資料");

    let resultText: string;
    if (report.target_type === "submission") {
      const status = action === "approve" ? "approved" : "rejected";
      const { error } = await supabase.from("user_submissions").update({ status }).eq("id", report.target_id);
      if (error) throw error;
      resultText = action === "approve" ? "✅ 已核准，被檢舉的投稿維持上架" : "❌ 已駁回，被檢舉的投稿已下架";
    } else if (report.target_type === "listing") {
      if (action === "reject") {
        const { error } = await supabase.from("listings")
          .update({ expires_at: new Date().toISOString() }).eq("id", report.target_id);
        if (error) throw error;
        resultText = "❌ 已駁回，被檢舉的刊登已立即下架（設為已過期）";
      } else {
        resultText = "✅ 已核准，被檢舉的刊登維持上架";
      }
    } else if (report.target_type === "review") {
      // 軟性下架(2026-07-31,migration 0007)：設hidden_at,RLS層級對其他人
      // 隱藏,本人仍看得到。滿1個月由pg_cron(purge_hidden_reviews)自動清除,
      // 不是真的刪除，核准前都可以回Dashboard手動清掉hidden_at復原。
      if (action === "reject") {
        const { error } = await supabase.from("school_reviews")
          .update({ hidden_at: new Date().toISOString() }).eq("id", report.target_id);
        if (error) throw error;
        resultText = "❌ 已駁回，被檢舉的評價已下架（1個月後自動清除，期間可於Dashboard復原）";
      } else {
        resultText = "✅ 已核准，被檢舉的評價維持顯示";
      }
    } else {
      throw new Error(`未知的target_type: ${report.target_type}`);
    }

    const { error: reportUpdateErr } = await supabase.from("reports").update({ status: "reviewed" }).eq("id", id);
    if (reportUpdateErr) console.error("更新report狀態失敗:", reportUpdateErr);
    return resultText;
  }

  throw new Error(`未知的table: ${table}`);
}

Deno.serve(async (req) => {
  const signature = req.headers.get("X-Signature-Ed25519") ?? "";
  const timestamp = req.headers.get("X-Signature-Timestamp") ?? "";
  const body = await req.text();

  if (!verifyDiscordSignature(signature, timestamp, body)) {
    return new Response("invalid request signature", { status: 401 });
  }

  // deno-lint-ignore no-explicit-any
  const interaction: any = JSON.parse(body);

  // type 1 = PING,Discord設定Interactions Endpoint URL時的驗證握手
  if (interaction.type === 1) {
    return new Response(JSON.stringify({ type: 1 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // type 3 = MESSAGE_COMPONENT(按鈕點擊)
  if (interaction.type === 3) {
    const customId: string = interaction.data?.custom_id ?? "";
    const [action, table, id] = customId.split(":");
    if (!["approve", "reject"].includes(action) || !table || !id) {
      return new Response(JSON.stringify({
        type: 4,
        data: { content: "⚠️ 無法解析這個按鈕的動作，請至 Dashboard 手動處理", flags: 64 },
      }), { headers: { "Content-Type": "application/json" } });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    let resultText: string;
    try {
      resultText = await applyAction(supabase, action as "approve" | "reject", table, id);
    } catch (e) {
      console.error(`applyAction失敗 action=${action} table=${table} id=${id}:`, e);
      resultText = `⚠️ 處理失敗，請至 Dashboard 手動處理（${String(e)}）`;
    }

    // type 7 = UPDATE_MESSAGE:直接編輯原本帶按鈕的訊息,移除按鈕、顯示結果,
    // 不需要另外呼叫Discord訊息編輯API
    return new Response(JSON.stringify({
      type: 7,
      data: { content: resultText, embeds: interaction.message?.embeds ?? [], components: [] },
    }), { headers: { "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ error: `unhandled interaction type: ${interaction.type}` }), { status: 400 });
});
