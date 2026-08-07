// CI 通過後，將結構化內容更新候選推播到 Discord 私人審核頻道。
// 只接受 GitHub Actions 與 Supabase 共用的獨立 webhook secret；收到請求後仍會
// 向 GitHub 公開 API 重新確認 PR、標籤、base branch 與 head commit。

const WEBHOOK_SECRET = Deno.env.get("CONTENT_REVIEW_WEBHOOK_SECRET") ?? "";
const DISCORD_BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN") ?? "";
const DISCORD_CHANNEL_ID = Deno.env.get("DISCORD_CHANNEL_ID") ?? "";
const REPOSITORY = Deno.env.get("GITHUB_CONTENT_REPOSITORY") ?? "si-kui-a/study-in-germany";

interface NotifyPayload {
  repository: string;
  pr_number: number;
  head_sha: string;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (!WEBHOOK_SECRET || req.headers.get("x-content-review-secret") !== WEBHOOK_SECRET) return json({ error: "unauthorized" }, 401);
  if (!DISCORD_BOT_TOKEN || !DISCORD_CHANNEL_ID) return json({ error: "Discord secrets missing" }, 503);

  let payload: NotifyPayload;
  try { payload = await req.json(); }
  catch { return json({ error: "invalid JSON" }, 400); }
  if (payload.repository !== REPOSITORY || !Number.isSafeInteger(payload.pr_number) || !/^[0-9a-f]{40}$/.test(payload.head_sha ?? "")) {
    return json({ error: "invalid payload" }, 400);
  }

  const prResponse = await fetch(`https://api.github.com/repos/${REPOSITORY}/pulls/${payload.pr_number}`, {
    headers: { "Accept": "application/vnd.github+json", "User-Agent": "study-in-germany-content-review" },
  });
  if (!prResponse.ok) return json({ error: `GitHub HTTP ${prResponse.status}` }, 502);
  const pr = await prResponse.json();
  const labels = (pr.labels ?? []).map((label: { name?: string }) => label.name);
  if (pr.state !== "open" || pr.base?.ref !== "main" || pr.head?.sha !== payload.head_sha || !labels.includes("automated-content-update")) {
    return json({ error: "PR no longer qualifies for content review" }, 409);
  }

  const body = String(pr.body ?? "");
  const requiredSections = ["來源", "舊值", "新值", "原文上下文", "適用對象", "生效日期", "風險等級"];
  const missing = requiredSections.filter((section) => !body.includes(`## ${section}`));
  if (missing.length) return json({ error: `missing review sections: ${missing.join(", ")}` }, 422);

  const sha12 = payload.head_sha.slice(0, 12);
  const description = body.length > 3000 ? `${body.slice(0, 2997)}...` : body;
  const message = {
    content: `📋 **官方來源候選更新已通過 CI，等待人工審核**\n${pr.html_url}`,
    embeds: [{
      title: `#${pr.number} ${pr.title}`,
      url: pr.html_url,
      description,
      color: 3447003,
      fields: [
        { name: "受審 commit", value: `\`${sha12}\``, inline: true },
        { name: "CI", value: "✅ 已通過", inline: true },
      ],
      timestamp: new Date().toISOString(),
    }],
    components: [{
      type: 1,
      components: [
        { type: 2, style: 3, label: "核准並發布", custom_id: `content:approve:${pr.number}:${sha12}` },
        { type: 2, style: 4, label: "駁回並關閉", custom_id: `content:reject:${pr.number}:${sha12}` },
      ],
    }],
    allowed_mentions: { parse: [] },
  };

  const discordResponse = await fetch(`https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages`, {
    method: "POST",
    headers: { "Authorization": `Bot ${DISCORD_BOT_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
  if (!discordResponse.ok) return json({ error: `Discord HTTP ${discordResponse.status}`, detail: await discordResponse.text() }, 502);
  const discordMessage = await discordResponse.json();
  return json({ notified: true, message_id: discordMessage.id, pr_number: pr.number, head_sha: payload.head_sha });
});
