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
// 內容發布按鈕另以指定頻道及 Discord 使用者／角色白名單驗證；核准只會合併
// 帶 automated-content-update 標籤、base=main 且仍停在受審 commit 的 PR。

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nacl from "https://esm.sh/tweetnacl@1.0.3";

const DISCORD_PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const DISCORD_CHANNEL_ID = Deno.env.get("DISCORD_CHANNEL_ID") ?? "";
const CONTENT_REVIEWER_USER_IDS = new Set((Deno.env.get("DISCORD_CONTENT_REVIEWER_USER_IDS") ?? "").split(",").map((v) => v.trim()).filter(Boolean));
const CONTENT_REVIEWER_ROLE_IDS = new Set((Deno.env.get("DISCORD_CONTENT_REVIEWER_ROLE_IDS") ?? "").split(",").map((v) => v.trim()).filter(Boolean));
const GITHUB_CONTENT_TOKEN = Deno.env.get("GITHUB_CONTENT_TOKEN") ?? "";
const GITHUB_CONTENT_REPOSITORY = Deno.env.get("GITHUB_CONTENT_REPOSITORY") ?? "si-kui-a/study-in-germany";

// deno-lint-ignore no-explicit-any
function isContentReviewer(interaction: any): boolean {
  if (!DISCORD_CHANNEL_ID || interaction.channel_id !== DISCORD_CHANNEL_ID) return false;
  const userId = interaction.member?.user?.id ?? interaction.user?.id ?? "";
  const roles: string[] = interaction.member?.roles ?? [];
  if (!CONTENT_REVIEWER_USER_IDS.size && !CONTENT_REVIEWER_ROLE_IDS.size) return false;
  return CONTENT_REVIEWER_USER_IDS.has(userId) || roles.some((role) => CONTENT_REVIEWER_ROLE_IDS.has(role));
}

async function githubRequest(path: string, init: RequestInit = {}) {
  if (!GITHUB_CONTENT_TOKEN) throw new Error("GITHUB_CONTENT_TOKEN 尚未設定");
  const response = await fetch(`https://api.github.com/repos/${GITHUB_CONTENT_REPOSITORY}${path}`, {
    ...init,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${GITHUB_CONTENT_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(`GitHub HTTP ${response.status}: ${data?.message ?? "unknown error"}`);
  return data;
}

async function applyContentPrAction(action: "approve" | "reject", prNumber: number, reviewedSha: string, reviewer: string): Promise<string> {
  const pr = await githubRequest(`/pulls/${prNumber}`);
  const labels = (pr.labels ?? []).map((label: { name?: string }) => label.name);
  if (pr.state !== "open" || pr.base?.ref !== "main" || !labels.includes("automated-content-update")) {
    throw new Error("PR 已關閉、目標不是 main，或缺少自動內容更新標籤");
  }
  if (!pr.head?.sha?.startsWith(reviewedSha) || reviewedSha.length < 12) throw new Error("PR 已有新 commit，必須重新送審");

  if (action === "reject") {
    await githubRequest(`/issues/${prNumber}/comments`, { method: "POST", body: JSON.stringify({ body: `Discord 審核者 ${reviewer} 已駁回此候選更新。` }) });
    await githubRequest(`/pulls/${prNumber}`, { method: "PATCH", body: JSON.stringify({ state: "closed" }) });
    return `❌ ${reviewer} 已駁回並關閉內容更新 PR #${prNumber}`;
  }

  const result = await githubRequest(`/pulls/${prNumber}/merge`, {
    method: "PUT",
    body: JSON.stringify({ sha: pr.head.sha, merge_method: "rebase", commit_title: `Content update #${prNumber} approved by ${reviewer}` }),
  });
  if (!result?.merged) throw new Error(result?.message ?? "GitHub 未合併 PR；請確認必要 CI 已通過");
  return `✅ ${reviewer} 已核准 PR #${prNumber}；GitHub 已合併，完整 main CI 通過後會自動部署`;
}

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
    if (customId.startsWith("content:")) {
      const [, action, numberText, reviewedSha] = customId.split(":");
      const prNumber = Number(numberText);
      if (!["approve", "reject"].includes(action) || !Number.isSafeInteger(prNumber) || !reviewedSha) {
        return new Response(JSON.stringify({ type: 4, data: { content: "⚠️ 內容審核按鈕格式錯誤", flags: 64 } }), { headers: { "Content-Type": "application/json" } });
      }
      if (!isContentReviewer(interaction)) {
        return new Response(JSON.stringify({ type: 4, data: { content: "⛔ 你不在內容發布審核白名單，或不是在指定頻道操作", flags: 64 } }), { headers: { "Content-Type": "application/json" } });
      }
      const reviewer = interaction.member?.user?.username ?? interaction.user?.username ?? "unknown";
      let resultText: string;
      try { resultText = await applyContentPrAction(action as "approve" | "reject", prNumber, reviewedSha, reviewer); }
      catch (e) { resultText = `⚠️ 內容發布失敗，未變更正式網站（${String(e)}）`; }
      return new Response(JSON.stringify({ type: 7, data: { content: resultText, embeds: interaction.message?.embeds ?? [], components: [] } }), { headers: { "Content-Type": "application/json" } });
    }
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
