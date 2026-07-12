export type BoardType =
  | 'secondhand'
  | 'rental_offer'
  | 'rental_seek'
  | 'discussion'
  | 'discussion_study'
  | 'discussion_longterm'
  | 'discussion_food'
  | 'discussion_taiwan_restaurant';

export const BOARD_TYPE_LABEL: Record<BoardType, string> = {
  secondhand: '二手交易',
  rental_offer: '出租',
  rental_seek: '求租',
  discussion: '一般討論',
  discussion_study: '學習討論',
  discussion_longterm: '長居討論',
  discussion_food: '美食',
  discussion_taiwan_restaurant: '台灣餐廳',
};

export const BOARD_TYPE_HINT: Record<BoardType, string> = {
  secondhand: '物品買賣',
  rental_offer: '有房出租',
  rental_seek: '找房需求',
  discussion: '一般話題交流',
  discussion_study: '學校、考試、學術等學習相關',
  discussion_longterm: '簽證、居留、工作、生活等長居相關',
  discussion_food: '德國美食、食譜、餐廳推薦',
  discussion_taiwan_restaurant: '德國境內台灣/中式餐廳分享',
};

/**
 * Phase V 遺留：DB listings.type CHECK 當時只允 3 類，
 * discussion 於 UI 端用 title 開頭「[討論]」作為標記、存 DB 時 type='secondhand'。
 * Phase J-3 起 listings.type CHECK 已擴展為 6 類（含 3 個 discussion 子類），
 * 新貼文直接存真實 type，不再需要 title prefix hack；
 * 此常量與 isDiscussion() 的 prefix 判斷僅保留供「舊資料」向下相容顯示。
 */
export const DISCUSSION_TITLE_PREFIX = '[討論] ';

/** hierarchical discussion 子類清單 */
export const DISCUSSION_TYPES: BoardType[] = [
  'discussion',
  'discussion_study',
  'discussion_longterm',
  'discussion_food',
  'discussion_taiwan_restaurant',
];

/** 商業類（有時效性，Phase R 起 90 天到期，發文時 client 端顯式設定 expires_at） */
export const EXPIRING_TYPES: BoardType[] = [
  'secondhand',
  'rental_offer',
  'rental_seek',
];

export const EXPIRY_DAYS = 90;

export function isDiscussionType(type: string): type is BoardType {
  return (DISCUSSION_TYPES as string[]).includes(type);
}

/** 判斷是否為討論類（含 Phase V 舊資料的 title prefix 與 Phase J-3 起的真實 type） */
export function isDiscussion(listing: { title: string; type: string }): boolean {
  return listing.title.startsWith(DISCUSSION_TITLE_PREFIX) || isDiscussionType(listing.type);
}

export function stripDiscussionPrefix(title: string): string {
  return title.replace(DISCUSSION_TITLE_PREFIX, '');
}

export function boardTypeOf(listing: { title: string; type: string }): BoardType {
  if (listing.title.startsWith(DISCUSSION_TITLE_PREFIX)) return 'discussion';
  return listing.type as BoardType;
}
