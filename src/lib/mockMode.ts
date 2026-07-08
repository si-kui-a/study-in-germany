/**
 * Dev-only mock flag。啟用方式：
 *   .env.local 加入 VITE_MOCK_MODE=1
 * 生產 build 因無此變數自動 false。
 */
export const MOCK_MODE =
  typeof import.meta.env.VITE_MOCK_MODE === 'string' &&
  import.meta.env.VITE_MOCK_MODE === '1';

export function mockLog(source: string, message: string) {
  if (MOCK_MODE) {
    console.info(`[mock:${source}] ${message}`);
  }
}
