/**
 * 「資深懶散工程師複查」的機械化版本，移植自wordpress-builder-playbook
 * repo的repo-audit.js（跨repo方法論試點，2026-08-30）。
 *
 * 只做「找候選」，不做「判斷對錯」——印出來的每一項仍要人工/AI逐一確認
 * 才動手改。故意不加進 `npm run check` 的CI硬gate（跟`check:content`/
 * `check:links`一樣性質，但比那兩者更低急迫性——PAT編號缺口通常不是
 * 「內容過期需要立即複查」，多半是合併/重整PAT時的正常結果，不適合
 * 自動開GitHub issue，維持手動觸發：`npm run check:knowledge`）。
 */
import { readFile, readdir } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const EXCLUDE_DIRS = new Set(['node_modules', '.git', 'dist', 'release', '.claude']);

async function walk(dir, exts) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    if (EXCLUDE_DIRS.has(entry.name)) return [];
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path, exts);
    return exts.includes(extname(entry.name)) ? [path] : [];
  }));
  return nested.flat();
}

// PAT條目在這個repo有兩種真實格式並存：`## PAT-NN [TAG]: ...`(獨立
// 章節)跟`- PAT-NN [TAG]: ...`(密集條列在另一個PAT章節底下，PAT-06~13
// 就是這樣，一開始只抓`## `格式會誤判成缺號，見2026-08-30查證記錄)。
const PAT_HEADER_RE = /^(?:##|-)\s*PAT-(\d+)\b/gm;

async function checkPatContinuity() {
  console.log('== 1. Meta_Dev_Knowledge.md PAT編號連續性 ==');
  const text = await readFile(join(root, 'Meta_Dev_Knowledge.md'), 'utf8');
  const nums = [...text.matchAll(PAT_HEADER_RE)].map((m) => Number(m[1]));
  if (!nums.length) {
    console.log('  （找不到PAT條目，跳過）');
    return new Set();
  }
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  console.log(`  找到${nums.length}個PAT條目，編號範圍 ${min}~${max}`);
  const present = new Set(nums);
  const missing = [];
  for (let n = min; n <= max; n++) if (!present.has(n)) missing.push(n);
  const counts = {};
  nums.forEach((n) => { counts[n] = (counts[n] || 0) + 1; });
  const dup = Object.entries(counts).filter(([, c]) => c > 1).map(([n]) => n);
  if (missing.length) console.log(`  ⚠️ 跳號：${missing.join(', ')}`);
  if (dup.length) console.log(`  ⚠️ 重複編號：${dup.join(', ')}`);
  if (!missing.length && !dup.length) console.log('  （連續無跳號無重複）');
  return present;
}

async function checkPatCrossReferences(realNums) {
  console.log('\n== 2. 其他檔案引用的PAT編號是否還存在 ==');
  if (!realNums.size) { console.log('  （無PAT條目，跳過）'); return; }
  const files = (await walk(root, ['.md', '.ts', '.tsx', '.mjs'])).filter(
    (f) => f !== join(root, 'Meta_Dev_Knowledge.md'),
  );
  const refNums = new Set();
  const broken = [];
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    for (const m of text.matchAll(/PAT-(\d+)/g)) {
      const n = Number(m[1]);
      refNums.add(n);
      if (!realNums.has(n)) broken.push(`${relative(root, file)} 引用 PAT-${String(n).padStart(2, '0')}`);
    }
  }
  console.log(`  其他檔案引用了${refNums.size}個不重複的PAT編號`);
  if (broken.length) {
    console.log('  ⚠️ 引用了Meta_Dev_Knowledge.md目前不存在的編號：');
    broken.forEach((b) => console.log(`    ${b}（可能已被改號/合併/刪除）`));
  } else {
    console.log('  （全部引用的編號都找得到，無需更新）');
  }
}

async function checkSourceSizeOutliers() {
  console.log('\n== 3. 原始碼檔案篇幅（>600行標記，僅供參考）==');
  const files = await walk(join(root, 'src'), ['.ts', '.tsx']);
  const counts = await Promise.all(files.map(async (f) => {
    const text = await readFile(f, 'utf8');
    return [text.split('\n').length, relative(root, f)];
  }));
  counts.sort((a, b) => b[0] - a[0]);
  for (const [lines, name] of counts.slice(0, 8)) {
    console.log(`  ${lines}\t${name}${lines > 600 ? ' ⚠️' : ''}`);
  }
}

async function checkStaleKeywords() {
  console.log('\n== 4. 過時關鍵字候選（每個都要人工確認，不代表一定過時）==');
  const markers = ['尚未', '還沒動工', '未確認', '待確認', 'TODO', 'FIXME'];
  const files = await walk(root, ['.md']);
  let hits = 0;
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    text.split('\n').forEach((line, idx) => {
      for (const marker of markers) {
        if (line.includes(marker)) {
          hits += 1;
          console.log(`  ${relative(root, file)}:${idx + 1}  [${marker}]  ${line.trim().slice(0, 70)}`);
          break;
        }
      }
    });
  }
  if (!hits) console.log('  （沒有命中）');
  console.log(`  共${hits}處候選——逐一確認是否已被同檔案或其他檔案的較新內容取代`);
}

const realNums = await checkPatContinuity();
await checkPatCrossReferences(realNums);
await checkSourceSizeOutliers();
await checkStaleKeywords();
console.log('\n完成。以上都只是候選，不是結論——逐項人工/AI確認後才動手修。');
