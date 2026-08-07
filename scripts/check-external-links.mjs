import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dataRoot = join(root, 'src', 'data');
const strict = process.argv.includes('--strict');
const timeoutMs = 12_000;

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path) : /\.(?:json|ts)$/.test(entry.name) ? [path] : [];
  }))).flat();
}

const sources = new Map();
for (const file of await files(dataRoot)) {
  const text = await readFile(file, 'utf8');
  for (const match of text.matchAll(/https?:\/\/[^\s"'`<>),\]]+/g)) {
    const url = match[0].replace(/[.;:]+$/, '');
    if (!sources.has(url)) sources.set(url, relative(root, file));
  }
}

async function request(url, method) {
  return fetch(url, {
    method,
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
    headers: { 'user-agent': 'StudyInGermanyContentHealth/1.0' },
  });
}

async function inspect(url) {
  try {
    let response = await request(url, 'HEAD');
    if ([403, 405].includes(response.status)) response = await request(url, 'GET');
    if ([404, 410].includes(response.status)) return { kind: 'broken', message: `HTTP ${response.status}` };
    if (response.status >= 500) return { kind: 'warning', message: `HTTP ${response.status}` };
    return { kind: 'ok', message: `HTTP ${response.status}` };
  } catch (error) {
    return { kind: 'warning', message: error instanceof Error ? error.message : String(error) };
  }
}

const queue = [...sources.keys()];
const results = [];
await Promise.all(Array.from({ length: Math.min(10, queue.length) }, async () => {
  while (queue.length) {
    const url = queue.shift();
    results.push({ url, source: sources.get(url), ...(await inspect(url)) });
  }
}));

const broken = results.filter(({ kind }) => kind === 'broken');
const warnings = results.filter(({ kind }) => kind === 'warning');
for (const item of [...broken, ...warnings]) console.log(`${item.kind === 'broken' ? '失效' : '待確認'} ${item.message} ${item.url}（${item.source}）`);
console.log(`外部連結檢查完成：${results.length} 個；確認失效 ${broken.length}；暫時無法確認 ${warnings.length}。`);
if (strict && broken.length) process.exit(1);
