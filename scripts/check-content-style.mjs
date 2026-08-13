// 掃 src/data 底下的內容資料檔，抓 docs/content-style-guide.md（PAT-38/40/162）
// 明文禁用、且幾乎沒有合法例外的詞彙/措辭，自動擋下違規內容。
//
// 刻意只做「零模糊空間」的規則，不做語意判斷（例如「使用者」是否用對
// 場合、感嘆號算不算濫用、文案結構是否結論先行）——那些需要 PAT-162
// 的判斷框架，交給人工/AI review，本腳本硬擋只會誤傷合法用法。
//
// 用法：node scripts/check-content-style.mjs [--strict]
// 預設：發現「警告類」項目只印出來，不失敗；--strict 時警告也會讓結束碼非 0。
// 「禁用類」項目無論有無 --strict 一律讓結束碼非 0（跟 check:data 同等級）。
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dataRoot = join(root, 'src', 'data');
const strict = process.argv.includes('--strict');

// 零合法例外 → 一律擋（PAT-38 用詞統一、PAT-40 簡體慣用詞、PAT-162 空泛連結文字）
// 注意：「網絡」「立即/馬上/趕快」originally 也列在這裡，2026-08-13 首次
// 對現有內容實測後移到下方警告類——見 WARN_WORDS 裡的說明，這是真的
// 從實際內容裡發現的合法例外，不是理論假設。
const BANNED = [
  ['封鎖帳戶', 'PAT-38：一律用「限制提領帳戶」'],
  ['用戶', 'PAT-40：台灣繁體用「使用者」（若是「使用者」本身當第二人稱代稱則屬另一條規則，見下方警告類）'],
  ['服務器', 'PAT-40：台灣繁體用「伺服器」'],
  ['賬戶', 'PAT-40：台灣繁體用「帳戶」'],
  ['界面', 'PAT-40：台灣繁體用「介面」'],
  ['點此', 'PAT-162：連結文字需可預期導向什麼，不用空泛措辭'],
  ['了解更多', 'PAT-162：連結文字需可預期導向什麼，不用空泛措辭'],
];

// 有合理例外、需要人工/AI判斷場合 → 只警告
const WARN_WORDS = [
  ['使用者', 'PAT-162：可能是對讀者說話卻用第三人稱（違規，應改「你」），也可能是內容標籤/第三方署名（合規，如「使用者提交」）——請人工核對語境'],
  ['網絡', 'PAT-40原則上應改「網路」，但2026-08-13實測發現本站既有內容有「語意網絡」「學術網絡」等抽象/社會網絡義的合法用法（有別於網際網路義的「網路」）——僅當指涉網際網路/電腦網路時才需要改'],
  ['立即', 'PAT-162原意是擋行銷催促語（如「立即註冊！」），但2026-08-13實測發現既有內容裡「立即」多用於描述真實法規/安全時效（如「搬家立即Anmeldung」「立即向外事局報失」），這類真實急迫性建議不算行銷腔——僅當是製造虛假急迫感催促讀者行動/消費時才需要改'],
  ['馬上', '同「立即」的判斷邏輯，見上'],
  ['趕快', '同「立即」的判斷邏輯，見上'],
  ['訪問', 'PAT-40：多數情境應改「造訪」，但「訪問學者」等固定詞組除外'],
  ['質量', 'PAT-40：多數情境應改「品質」，但物理量詞義除外'],
  ['郵件', 'PAT-40：多數情境應改「電子郵件」，但已有上下文限定時可省略'],
];

async function sourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.(json|ts)$/.test(entry.name) ? [path] : [];
  }));
  return nested.flat();
}

function findHits(text, wordlist) {
  const hits = [];
  for (const [word, reason] of wordlist) {
    const count = text.split(word).length - 1;
    if (count > 0) hits.push(`「${word}」×${count}（${reason}）`);
  }
  return hits;
}

let scannedFiles = 0;
const violations = [];
const warnings = [];

for (const file of await sourceFiles(dataRoot)) {
  scannedFiles += 1;
  const text = await readFile(file, 'utf8');
  const rel = relative(root, file);

  const bannedHits = findHits(text, BANNED);
  if (bannedHits.length) violations.push(`${rel}：\n    - ${bannedHits.join('\n    - ')}`);

  const warnHits = findHits(text, WARN_WORDS);
  if (warnHits.length) warnings.push(`${rel}：\n    - ${warnHits.join('\n    - ')}`);

  const exclaimHeavy = [...text.matchAll(/["'][^"'\n]*！[^"'\n]*["']/g)].filter((m) => (m[0].match(/！/g) ?? []).length >= 2);
  if (exclaimHeavy.length) warnings.push(`${rel}：單一字串內出現 2 個以上「！」共 ${exclaimHeavy.length} 處（PAT-162：不濫用驚嘆號）`);
}

if (!scannedFiles) {
  console.error(`找不到任何內容資料檔可掃描（${relative(root, dataRoot)}）。`);
  process.exit(1);
}

console.log(`已掃描 ${scannedFiles} 個內容資料檔（${relative(root, dataRoot)}），對照 docs/content-style-guide.md 禁用/警告詞表。`);

if (warnings.length) {
  console.warn(`\n${warnings.length} 項警告（需人工核對語境，見 docs/content-style-guide.md）：\n- ${warnings.join('\n- ')}`);
}

if (violations.length) {
  console.error(`\n${violations.length} 項禁用詞違規（零合法例外，直接修正）：\n- ${violations.join('\n- ')}`);
  process.exit(1);
}

if (strict && warnings.length) {
  console.error('\n--strict 模式：上方警告視同失敗，請逐項核對後再提交。');
  process.exit(1);
}

if (!warnings.length) console.log('文案風格檢查通過：無禁用詞、無需人工核對的警告項目。');
