export type CommunityAction = 'submission' | 'report';

interface Attempt {
  action: CommunityAction;
  signature: string;
  at: number;
}

const STORAGE_KEY = 'community_action_attempts_v1';
const DAY_MS = 24 * 60 * 60 * 1000;
const LIMITS: Record<CommunityAction, { cooldownMs: number; daily: number }> = {
  submission: { cooldownMs: 60_000, daily: 5 },
  report: { cooldownMs: 30_000, daily: 10 },
};

function readAttempts(now: number): Attempt[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter((item): item is Attempt =>
          item && ['submission', 'report'].includes(item.action) &&
          typeof item.signature === 'string' && typeof item.at === 'number' && now - item.at < DAY_MS)
      : [];
  } catch {
    return [];
  }
}

export function communityActionBlockReason(
  action: CommunityAction,
  signature: string,
  now = Date.now(),
): string | null {
  const attempts = readAttempts(now).filter((item) => item.action === action);
  const limit = LIMITS[action];
  if (attempts.some((item) => item.signature === signature)) return '相同內容已經送出，請勿重複提交。';
  if (attempts.some((item) => now - item.at < limit.cooldownMs)) return '送出速度太快，請稍候再試。';
  if (attempts.length >= limit.daily) return `今日已達${action === 'submission' ? '投稿' : '檢舉'}上限，請明天再試。`;
  return null;
}

export function recordCommunityAction(action: CommunityAction, signature: string, now = Date.now()): void {
  const attempts = readAttempts(now);
  attempts.push({ action, signature, at: now });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
}
