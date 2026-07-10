export type BoardType = 'secondhand' | 'rental_offer' | 'rental_seek' | 'discussion';

export const BOARD_TYPE_LABEL: Record<BoardType, string> = {
  secondhand: '二手交易',
  rental_offer: '出租',
  rental_seek: '求租',
  discussion: '討論區',
};

export const BOARD_TYPE_HINT: Record<BoardType, string> = {
  secondhand: '物品買賣',
  rental_offer: '有房出租',
  rental_seek: '找房需求',
  discussion: '話題交流、經驗分享、疑難雜症',
};

/**
 * 由於 DB listings.type CHECK 只允 3 類、
 * discussion 於 UI 端用 title 開頭「[討論]」作為標記，
 * 存 DB 時 type = 'secondhand'（未來 Phase W 再做 schema migration）
 */
export const DISCUSSION_TITLE_PREFIX = '[討論] ';

export function isDiscussion(listing: { title: string; type: string }): boolean {
  return listing.title.startsWith(DISCUSSION_TITLE_PREFIX);
}

export function stripDiscussionPrefix(title: string): string {
  return title.replace(DISCUSSION_TITLE_PREFIX, '');
}

export function boardTypeOf(listing: { title: string; type: string }): BoardType {
  if (isDiscussion(listing)) return 'discussion';
  return listing.type as BoardType;
}
