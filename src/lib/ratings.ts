/**
 * 6 維評分系統
 * DB stars JSONB 對應：{ overall, teaching, environment, material, admin, transport, price }
 * Overall = 其他 5 維平均（auto-calc · 不可手動）
 * 每維 1-5 星 · 支援半星（0.5 step）
 */

export type RatingDimension =
  | 'teaching'
  | 'environment'
  | 'material'
  | 'admin'
  | 'transport'
  | 'price';

export interface RatingDimensionMeta {
  key: RatingDimension;
  label: string;
  hint: string;
}

/** 5 個 user-selectable 維度（overall 從這 5 個計算得來） */
export const RATING_DIMENSIONS: RatingDimensionMeta[] = [
  {
    key: 'teaching',
    label: '教學品質',
    hint: '老師的教學能力、課程設計、教材是否貼近實際使用',
  },
  {
    key: 'environment',
    label: '學習環境',
    hint: '教室、圖書館、公共空間、氛圍',
  },
  {
    key: 'material',
    label: '教材',
    hint: '教科書、線上教材、練習題的品質與更新頻率',
  },
  {
    key: 'admin',
    label: '行政效率',
    hint: '註冊、繳費、Termin、諮詢、簽證支援等行政處理',
  },
  {
    key: 'transport',
    label: '交通便利性',
    hint: '離主要交通、市中心、超市、住宿的距離',
  },
  {
    key: 'price',
    label: '性價比',
    hint: '學費與所得之總體價值比',
  },
];

/**
 * 從 5 維計算 overall
 * 忽略 undefined/null 值 · 只算已填的維度
 * 若一個都沒填 → 回 0
 * 保留 1 位小數（Phase V：輸入改整星後不再 rounding 到 0.5）
 */
export function calculateOverall(stars: Partial<Record<RatingDimension, number>>): number {
  const values = RATING_DIMENSIONS.map((d) => stars[d.key])
    .filter((v): v is number => typeof v === 'number' && v > 0);
  if (values.length === 0) return 0;
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  return Math.round(avg * 10) / 10; // 保留 1 位小數 · 顯示如 4.3
}
