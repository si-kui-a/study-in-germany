import { spawnSync } from 'node:child_process';

// 本站只使用 HashRouter SPA，沒有 React Router RSC、server action 或 action endpoint。
// 這一則 RSC-only 公告目前沒有不受影響的 7.x 版本；精確允許 advisory ID，
// 任何其他 high/critical 公告仍會讓品質檢查失敗。
const acceptedAdvisories = new Set([1124282]);
const isWindows = process.platform === 'win32';
const result = spawnSync(
  isWindows ? (process.env.ComSpec ?? 'cmd.exe') : 'npm',
  isWindows ? ['/d', '/s', '/c', 'npm audit --omit=dev --json'] : ['audit', '--omit=dev', '--json'],
  { encoding: 'utf8' },
);

let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  console.error(result.stderr || result.stdout || 'npm audit 無法執行');
  process.exit(1);
}

const unaccepted = [];
const accepted = [];
for (const vulnerability of Object.values(report.vulnerabilities ?? {})) {
  for (const item of vulnerability.via ?? []) {
    if (typeof item !== 'object' || !['high', 'critical'].includes(item.severity)) continue;
    const entry = `${item.source} ${item.name}：${item.title}`;
    (acceptedAdvisories.has(item.source) ? accepted : unaccepted).push(entry);
  }
}

if (accepted.length) console.warn(`已評估且限縮接受（HashRouter SPA 不使用 RSC）：\n- ${[...new Set(accepted)].join('\n- ')}`);
if (unaccepted.length) {
  console.error(`發現未接受的正式環境 high/critical 公告：\n- ${[...new Set(unaccepted)].join('\n- ')}`);
  process.exit(1);
}
console.log('正式環境相依套件稽核通過。');
