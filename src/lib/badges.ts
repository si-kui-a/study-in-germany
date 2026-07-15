import { supabase } from './supabase';
import type { ContributionCounts } from './useContributions';

export type BadgeId =
  | 'pioneer'       // 註冊 seq ≤ 100
  | 'review_expert' // 評價達人 · ≥ 5 則評價
  | 'post_expert'   // 貼文達人 · ≥ 10 則佈告欄
  | 'contribution_expert' // 貢獻達人 · ≥ 5 則使用者提交
  | 'discussion_expert'   // 討論家 · ≥ 5 則討論類貼文
  | 'school_expert'       // 語校達人 · 評價 ≥ 3 所不同語校
  | 'omni_expert';        // 全能達人 · 上述任 3 項達成

export type BadgeTier = 'gold' | 'silver' | 'general';

export interface BadgeMeta {
  id: BadgeId;
  label: string;
  description: string;
  tier: BadgeTier;
}

export const ALL_BADGES: BadgeMeta[] = [
  { id: 'pioneer', label: '先鋒', description: '註冊序號 100 以內', tier: 'gold' },
  { id: 'review_expert', label: '評價達人', description: '累計 5 則以上 6 維評價', tier: 'gold' },
  { id: 'post_expert', label: '貼文達人', description: '累計 10 則以上討論區貼文', tier: 'silver' },
  { id: 'contribution_expert', label: '貢獻達人', description: '累計 5 則以上使用者提交', tier: 'gold' },
  { id: 'discussion_expert', label: '討論家', description: '累計 5 則以上討論類貼文', tier: 'silver' },
  { id: 'school_expert', label: '語校達人', description: '評價 3 所以上不同語校', tier: 'silver' },
  { id: 'omni_expert', label: '全能達人', description: '同時擁有其他 3 個以上徽章', tier: 'gold' },
];

export function getBadgeById(id: BadgeId): BadgeMeta | undefined {
  return ALL_BADGES.find((b) => b.id === id);
}

/**
 * 判定使用者可獲得的徽章
 *
 * @param registrationSeq · 註冊序號
 * @param counts · 貢獻統計
 * @param uniqueSchoolCount · 評價的不同語校數
 * @param discussionCount · 討論類貼文數
 */
export function computeBadges(
  registrationSeq: number | null,
  counts: ContributionCounts,
  uniqueSchoolCount: number,
  discussionCount: number
): BadgeId[] {
  const earned: BadgeId[] = [];

  if (registrationSeq !== null && registrationSeq <= 100) {
    earned.push('pioneer');
  }
  if (counts.reviews >= 5) {
    earned.push('review_expert');
  }
  if (counts.listings >= 10) {
    earned.push('post_expert');
  }
  if (counts.submissions >= 5) {
    earned.push('contribution_expert');
  }
  if (discussionCount >= 5) {
    earned.push('discussion_expert');
  }
  if (uniqueSchoolCount >= 3) {
    earned.push('school_expert');
  }
  if (earned.length >= 3) {
    earned.push('omni_expert');
  }

  return earned;
}

/**
 * 頭框級別判定 · 依最高等級徽章
 */
export function computeFrameTier(badges: BadgeId[]): BadgeTier {
  const hasGold = badges.some((bid) => getBadgeById(bid)?.tier === 'gold');
  if (hasGold) return 'gold';

  const hasSilver = badges.some((bid) => getBadgeById(bid)?.tier === 'silver');
  if (hasSilver) return 'silver';

  return 'general';
}

/**
 * 頭框對應 CSS class
 */
export function frameTierClass(tier: BadgeTier): string {
  return {
    gold: 'ring-2 ring-brand-gold',
    silver: 'ring-2 ring-content-secondary',
    general: '',
  }[tier];
}

/**
 * 依 user_id 清單批次查詢 profiles.badges（Cross-cutting UI 用）。
 * profiles.id 與 school_reviews/listings/user_submissions 的 user_id 之間
 * 無 PostgREST 可 auto-embed 的 FK（三者外鍵皆指向 auth.users，非 public.profiles，
 * 見 PAT-02），故獨立於此另開一次查詢、client-side 合併，而非嵌入 select join。
 */
export async function fetchBadgesMap(userIds: string[]): Promise<Map<string, BadgeId[]>> {
  const uniqueIds = Array.from(new Set(userIds));
  if (uniqueIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, badges')
    .in('id', uniqueIds);

  const map = new Map<string, BadgeId[]>();
  if (error || !data) return map;
  for (const row of data as { id: string; badges: BadgeId[] | null }[]) {
    map.set(row.id, row.badges ?? []);
  }
  return map;
}
