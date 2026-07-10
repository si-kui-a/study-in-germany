/**
 * Phase H · 推薦專區資料契約
 *
 * 每項推薦 = 可長期查證的公開實體。
 * 不寫時效性資訊（價格、優惠碼、日期），使用者可自行至官網看最新。
 */

export type RecommendationCategory =
  | 'general'
  | 'visa'
  | 'arrival'
  | 'edu'
  | 'scholarship'
  | 'taiwan';

export interface RecommendationCategoryMeta {
  key: RecommendationCategory;
  title: string;
  subtitle: string;
  emoji: string;
}

export const RECOMMENDATION_CATEGORIES: RecommendationCategoryMeta[] = [
  {
    key: 'general',
    title: '通用推薦',
    subtitle: '日常生活實用工具與服務',
    emoji: '🌟',
  },
  {
    key: 'visa',
    title: '簽證相關',
    subtitle: '限制提領帳戶、保險、官方申請',
    emoji: '🛂',
  },
  {
    key: 'arrival',
    title: '落地相關',
    subtitle: '找房、開戶、SIM 卡、生活服務',
    emoji: '🏠',
  },
  {
    key: 'edu',
    title: '學程相關',
    subtitle: '學校申請、語言考試、學術資源',
    emoji: '🎓',
  },
  {
    key: 'scholarship',
    title: '獎學金',
    subtitle: '德國、歐盟、台灣獎學金資源',
    emoji: '💰',
  },
  {
    key: 'taiwan',
    title: '台灣海外方案',
    subtitle: '銀行、電信、辦事處聯絡',
    emoji: '🇹🇼',
  },
];

export interface Recommendation {
  id: string;
  category: RecommendationCategory;
  title: string;
  description: string;
  tags: string[];
  url: string;
  note?: string; // 額外註記，例如「需 GitHub 帳號」
}
