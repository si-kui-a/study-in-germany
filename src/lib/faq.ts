/**
 * Phase AO：faq.json 部分題目改用結構化格式（summary/points/detail），
 * 與簡單題目（純 q/a）並存。`FaqItem`（src/lib/types.ts，受保護）仍是純
 * q/a 形狀，故另立此型別涵蓋兩種格式，避免動受保護檔案。
 */
export interface FaqEntry {
  q: string;
  a?: string;
  summary?: string;
  points?: string[];
  detail?: string;
}

/** 供搜尋索引/預覽使用的可搜尋文字，兩種格式皆適用 */
export function faqSearchableText(f: FaqEntry): string {
  if (f.a) return f.a;
  return [f.summary ?? '', ...(f.points ?? []), f.detail ?? ''].join(' ');
}

/** 供搜尋結果預覽用的簡短摘要，兩種格式皆適用 */
export function faqPreviewText(f: FaqEntry): string {
  return f.a ?? f.summary ?? f.detail ?? '';
}
