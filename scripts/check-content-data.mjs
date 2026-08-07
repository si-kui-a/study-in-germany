import { readFile, readdir } from 'node:fs/promises';
import { join, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dataRoot = join(root, 'src', 'data');
const errors = [];

async function jsonFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? jsonFiles(path) : entry.name.endsWith('.json') ? [path] : [];
  }))).flat();
}

function requiredString(value, label) {
  if (typeof value !== 'string' || !value.trim()) errors.push(`${label} 不可空白`);
}
function validUrl(value, label) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('protocol');
  } catch { errors.push(`${label} 必須是 http(s) URL`); }
}

const parsed = new Map();
for (const file of await jsonFiles(dataRoot)) {
  try { parsed.set(file, JSON.parse(await readFile(file, 'utf8'))); }
  catch (error) { errors.push(`${relative(root, file)}：JSON 無法解析（${error.message}）`); }
}

const schools = parsed.get(join(dataRoot, 'schools.json')) ?? [];
const schoolIds = new Set();
for (const [index, school] of schools.entries()) {
  const label = `schools.json[${index}]`;
  for (const field of ['id', 'name_zh', 'name_de', 'city', 'level', 'updated_at']) requiredString(school[field], `${label}.${field}`);
  if (schoolIds.has(school.id)) errors.push(`${label} ID 重複：${school.id}`);
  schoolIds.add(school.id);
  if (!/^\d{4}-\d{2}$/.test(school.updated_at ?? '')) errors.push(`${label}.updated_at 必須為 YYYY-MM`);
  if (school.website) validUrl(school.website, `${label}.website`);
}

const announcements = parsed.get(join(dataRoot, 'announcements.json')) ?? [];
const announcementIds = new Set();
for (const [index, item] of announcements.entries()) {
  requiredString(item.id, `announcements.json[${index}].id`);
  if (announcementIds.has(item.id)) errors.push(`announcements.json[${index}] ID 重複：${item.id}`);
  announcementIds.add(item.id);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date ?? '')) errors.push(`announcements.json[${index}].date 必須為 YYYY-MM-DD`);
}

const recommendationIds = new Set();
for (const [file, items] of parsed.entries()) {
  if (!file.includes(`${join('data', 'recommendations')}`)) continue;
  if (!Array.isArray(items)) { errors.push(`${relative(root, file)} 必須是陣列`); continue; }
  for (const [index, item] of items.entries()) {
    const label = `recommendations/${basename(file)}[${index}]`;
    for (const field of ['id', 'category', 'title', 'summary', 'updated_at']) requiredString(item[field], `${label}.${field}`);
    if (recommendationIds.has(item.id)) errors.push(`${label} ID 跨檔案重複：${item.id}`);
    recommendationIds.add(item.id);
    if (item.points !== undefined && (!Array.isArray(item.points) || item.points.some((point) => typeof point !== 'string' || !point.trim()))) errors.push(`${label}.points 若提供，必須是文字陣列`);
    if (!Array.isArray(item.tags) || item.tags.some((tag) => typeof tag !== 'string')) errors.push(`${label}.tags 必須是文字陣列`);
    validUrl(item.url, `${label}.url`);
    if (!/^\d{4}-\d{2}(?:-\d{2})?$/.test(item.updated_at ?? '')) errors.push(`${label}.updated_at 格式錯誤`);
  }
}

if (errors.length) {
  console.error(`內容資料檢查失敗（${errors.length} 項）：\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`內容資料檢查通過：${schools.length} 所語校、${announcements.length} 則公告、${recommendationIds.size} 筆推薦。`);
