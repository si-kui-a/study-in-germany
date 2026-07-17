/**
 * 支持本站頁「開站天數」統計（Phase BK，見 PAT-172）。
 * 純前端日期計算，不需 DB 查詢；常數獨立定義，方便未來若需引用於其他頁面。
 */
export const SITE_LAUNCH_DATE = '2026-07-16';

export function daysSinceLaunch(now: Date = new Date()): number {
  const launch = new Date(`${SITE_LAUNCH_DATE}T00:00:00`);
  const diffMs = now.getTime() - launch.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}
