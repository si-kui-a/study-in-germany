import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const configPath = fileURLToPath(new URL('../config/source-monitoring.json', import.meta.url));
const config = JSON.parse(await readFile(configPath, 'utf8'));
const errors = [];
const allowedActions = new Set([
  'ignore_and_log',
  'propose_pull_request',
  'extract_candidate_for_review',
  'create_diff_report',
  'stop_and_require_research',
]);

if (config.mode !== 'review_required') errors.push('mode 必須為 review_required');
if (config.direct_publish !== false) errors.push('direct_publish 必須保持 false');
if (config.publishing_guards?.human_approval_required !== true) errors.push('所有正式更新必須人工核准');
if (config.publishing_guards?.ci_required !== true) errors.push('所有更新必須通過 CI');
if (config.discord_review?.required_base_branch !== 'main') errors.push('Discord 審核只可發布到 main');
if (config.discord_review?.required_label !== 'automated-content-update') errors.push('Discord 審核必須限定自動內容更新標籤');
if (config.discord_review?.lock_to_reviewed_commit !== true) errors.push('Discord 審核必須鎖定受審 commit');
if (config.discord_review?.require_named_reviewer !== true) errors.push('Discord 審核必須驗證審核者身分');
if (config.discord_review?.deployment_requires_main_ci !== true) errors.push('Discord 核准不得略過 main CI');
if (config.fetch_policy?.bypass_login_or_captcha !== false) errors.push('禁止繞過登入或驗證碼');
if (config.fetch_policy?.respect_robots_txt !== true) errors.push('必須遵守 robots.txt');
if ((config.fetch_policy?.request_interval_ms ?? 0) < 1000) errors.push('請求間隔不得短於 1000ms');
if ((config.fetch_policy?.consecutive_failures_before_issue ?? 0) < 2) errors.push('不得因單次連線失敗建立維護問題');

for (const level of ['L0', 'L1', 'L2', 'L3', 'L4']) {
  if (!allowedActions.has(config.automation_levels?.[level]?.action)) errors.push(`${level} 缺少合法處理方式`);
}

const included = new Set(config.scope?.included_topics ?? []);
const deferred = new Set(config.scope?.deferred_topics ?? []);
for (const topic of included) if (deferred.has(topic)) errors.push(`${topic} 不可同時列為納入及延後`);

const domains = new Set();
for (const [index, authority] of (config.authorities ?? []).entries()) {
  const label = `authorities[${index}]`;
  if (!/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(authority.domain ?? '')) errors.push(`${label}.domain 格式錯誤`);
  if (domains.has(authority.domain)) errors.push(`${label}.domain 重複`);
  domains.add(authority.domain);
  if (!['primary', 'regional_primary', 'supporting'].includes(authority.tier)) errors.push(`${label}.tier 無效`);
  if (!Array.isArray(authority.topics) || !authority.topics.length) errors.push(`${label}.topics 不可為空`);
  for (const topic of authority.topics ?? []) if (!included.has(topic)) errors.push(`${label} 使用未納入主題 ${topic}`);
}

if (errors.length) {
  console.error(`來源監測適用範圍檢查失敗（${errors.length} 項）：\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`來源監測適用範圍通過：${included.size} 個第一階段主題、${domains.size} 個權威網域、禁止直接發布。`);
