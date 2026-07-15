/**
 * PostgREST / Supabase 錯誤代碼→中文使用者訊息。
 * 未命中的 code/pattern 一律回通用訊息（不回傳原始 raw 文字），
 * 避免資料庫內部錯誤細節（表名、欄位名、SQL 約束名等）外洩給使用者；
 * 完整原始錯誤只透過 raw 欄位供呼叫端 console.error 除錯用（PAT-112）。
 */

const CODE_MAP: Record<string, string> = {
  'PGRST301': '登入已過期，請重新登入',
  '42501':    '權限不足，無法執行此操作',
  '23505':    '資料重複（此內容已存在）',
  '23514':    '資料不符合規則（欄位長度或格式錯）',
  '23503':    '關聯資料不存在',
  '22001':    '欄位長度超過上限',
  '42P01':    '資料表不存在——資料庫可能尚未遷移完成',
  '42703':    '欄位不存在——資料庫 schema 版本可能過舊',
  'PGRST116': '找不到資料',
  'PGRST204': '欄位不匹配——請檢查 payload',
};

const MESSAGE_PATTERNS: [RegExp, string][] = [
  [/row-level security/i, '資料庫拒絕此操作（可能未登入或身分不符）'],
  [/duplicate key/i,      '資料重複'],
  [/user_submissions_title_check/i, '標題長度需 2-100 字'],
  [/user_submissions_content_check/i, '內容長度需 5-2000 字'],
  [/user_submissions_submission_type_check/i, '提交類型錯誤'],
  [/listings_type_check/i, '討論區類型錯誤 · 請重新選擇'],
  [/violates check constraint/i, '資料不符合規則'],
  [/network|fetch/i,      '網路連線失敗，請確認網路狀態'],
  [/jwt/i,                '登入憑證異常，請重新登入'],
];

export interface FriendlyError {
  message: string;
  raw: string;
  code?: string;
}

export function translateError(error: unknown): FriendlyError {
  if (!error) return { message: '未知錯誤', raw: '' };
  const err = error as { message?: string; code?: string };
  const raw = err.message ?? String(error);
  const code = err.code;

  if (code && CODE_MAP[code]) {
    return { message: CODE_MAP[code], raw, code };
  }
  for (const [pattern, msg] of MESSAGE_PATTERNS) {
    if (pattern.test(raw)) {
      return { message: msg, raw, code };
    }
  }
  return { message: '發生未預期的錯誤，請稍後再試', raw, code };
}
