/**
 * 讀取查詢重試工具（Phase BC 建立，見 PAT-163）。
 *
 * 硬性邊界：僅供 SELECT 讀取查詢使用。寫入動作（INSERT/UPDATE/DELETE，
 * 含發文、按讚、提交表單、追蹤、檢舉等）一律不得用此工具包裹——重試寫入
 * 有造成重複寫入的風險（若第一次請求其實已成功、只是回應延遲，自動重試
 * 會產生兩筆重複資料）。此邊界為 Lily 明確指示，不得因「順手一致」擴大套用。
 *
 * 重要：@supabase/postgrest-js 2.x 對 GET/HEAD 請求已內建重試（網路層錯誤
 * 與 503/520 這兩種狀態碼，預設開啟，退避 1s/2s/4s，最多 3 次），若不關閉、
 * 會與本工具的重試疊加，最壞情況變成 9 次嘗試，超出「總共 3 次、5 秒內
 * 判定完成」的設計預算。故每個呼叫點的 query factory 鏈尾都必須加上
 * `.retry(false)` 關閉內建重試，把所有重試邏輯統一收斂於本工具一處控管。
 *
 * @example
 * const { data, error } = await fetchWithRetry(
 *   () => supabase.from('listings').select('*').order('created_at', { ascending: false }).retry(false),
 *   { table: 'listings' }
 * );
 */

export interface FetchWithRetryError {
  message: string;
  details?: string | null;
  hint?: string | null;
  code?: string;
}

export interface FetchWithRetryResult<T> {
  data: T | null;
  error: FetchWithRetryError | null;
  count?: number | null;
}

const MAX_ATTEMPTS = 3; // 首次嘗試 + 2 次重試
const RETRY_DELAYS_MS = [500, 1000]; // 第 1 次重試延遲 500ms，第 2 次延遲 1000ms

/**
 * status === 0：postgrest-js 把 fetch 本身失敗（離線/DNS 失敗/逾時等網路層
 * 錯誤）轉換為 status:0 的已處理錯誤（非拋出例外），故這裡用單純數值比較
 * 即可涵蓋網路層錯誤，不需要額外包 try/catch。
 * status >= 500：伺服器端暫時性錯誤（含 502/503/504 等，涵蓋範圍比
 * postgrest-js 內建重試僅認列的 503/520 更廣，依 Lily 指示的「5xx 皆重試」）。
 * 其餘（4xx，含 RLS 42501、PGRST301 登入過期、23505 重複鍵等）一律不重試
 * ——這些是確定性錯誤，重試無意義、徒增等待時間。
 */
function isRetryableStatus(status: number): boolean {
  return status === 0 || status >= 500;
}

export async function fetchWithRetry<T>(
  queryFactory: () => PromiseLike<{
    data: T | null;
    error: FetchWithRetryError | null;
    status: number;
    count?: number | null;
  }>,
  context: { table: string; source?: string },
): Promise<FetchWithRetryResult<T>> {
  const label = context.source ? `${context.table}(${context.source})` : context.table;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const { data, error, status, count } = await queryFactory();

    if (!error) {
      return { data, error: null, count };
    }

    const retryable = isRetryableStatus(status);
    const isFinalAttempt = attempt === MAX_ATTEMPTS || !retryable;

    // 刻意用 console.warn 而非 console.error：重試中途的失敗屬於已處理的
    // 暫時性狀態，非未攔截的錯誤，避免誤觸發測試工具的「console 有 error」偵測
    // eslint-disable-next-line no-console
    console.warn(
      `[fetchWithRetry] table=${label} attempt=${attempt}/${MAX_ATTEMPTS} `
      + `status=${status} retryable=${retryable} final=${isFinalAttempt} error=${error.message}`,
    );

    if (isFinalAttempt) {
      return { data: null, error, count: null };
    }

    await new Promise((resolve) => { setTimeout(resolve, RETRY_DELAYS_MS[attempt - 1]); });
  }

  // 迴圈必定在 MAX_ATTEMPTS 內 return，此處純為滿足 TS 窮盡性檢查
  return { data: null, error: { message: '未知錯誤' }, count: null };
}
