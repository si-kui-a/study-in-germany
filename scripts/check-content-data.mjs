import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dataRoot = join(root, 'src', 'data');
const errors = [];

async function jsonFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? jsonFiles(path) : entry.name.endsWith('.json') ? [path] : [];
  }));
  return nested.flat();
}

for (const file of await jsonFiles(dataRoot)) {
  try {
    JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    errors.push(`${relative(root, file)}：JSON 無法解析（${error.message}）`);
  }
}

const schools = JSON.parse(await readFile(join(dataRoot, 'schools.json'), 'utf8'));
const ids = new Set();
for (const [index, school] of schools.entries()) {
  const label = `schools.json[${index}]`;
  for (const field of ['id', 'name_zh', 'name_de', 'city', 'level', 'updated_at']) {
    if (typeof school[field] !== 'string' || !school[field].trim()) errors.push(`${label} 缺少 ${field}`);
  }
  if (ids.has(school.id)) errors.push(`${label} ID 重複：${school.id}`);
  ids.add(school.id);
  if (!/^\d{4}-\d{2}$/.test(school.updated_at ?? '')) errors.push(`${label} updated_at 必須為 YYYY-MM`);
  if (school.website) {
    try { new URL(school.website); } catch { errors.push(`${label} website 不是有效 URL`); }
  }
}

const announcements = JSON.parse(await readFile(join(dataRoot, 'announcements.json'), 'utf8'));
const announcementIds = new Set();
for (const [index, item] of announcements.entries()) {
  if (announcementIds.has(item.id)) errors.push(`announcements.json[${index}] ID 重複：${item.id}`);
  announcementIds.add(item.id);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date ?? '')) errors.push(`announcements.json[${index}] 日期格式錯誤`);
}

if (errors.length) {
  console.error(`內容資料檢查失敗（${errors.length} 項）：\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`內容資料檢查通過：${schools.length} 所語校、${announcements.length} 則公告。`);
