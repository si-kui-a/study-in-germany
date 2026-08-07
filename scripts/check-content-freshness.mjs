import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dataRoot = join(root, 'src', 'data');
const strict = process.argv.includes('--strict');
const today = new Date();
const stale = [];
let datedEntries = 0;

async function sourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.(json|ts)$/.test(entry.name) ? [path] : [];
  }));
  return nested.flat();
}

for (const file of await sourceFiles(dataRoot)) {
  const text = await readFile(file, 'utf8');
  const matches = [...text.matchAll(/["']updated_at["']\s*:\s*["'](\d{4}-\d{2}(?:-\d{2})?)["']/g)];
  const maxAgeDays = file.includes(`${join('data', 'edu')}`) ? 90 : 180;
  for (const match of matches) {
    datedEntries += 1;
    const normalized = match[1].length === 7 ? `${match[1]}-01` : match[1];
    const ageDays = Math.floor((today - new Date(`${normalized}T00:00:00Z`)) / 86_400_000);
    if (ageDays > maxAgeDays) stale.push(`${relative(root, file)}：${match[1]}（${ageDays} 天，門檻 ${maxAgeDays} 天）`);
  }
}

if (!datedEntries) {
  console.error('找不到任何 updated_at，無法判斷內容新鮮度。');
  process.exit(1);
}
if (stale.length) {
  console.error(`發現 ${stale.length} 筆待複查內容：\n- ${stale.join('\n- ')}`);
  if (strict) process.exit(1);
} else {
  console.log(`內容新鮮度通過：已檢查 ${datedEntries} 筆更新日期。`);
}
