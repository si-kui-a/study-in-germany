/**
 * Phase H · 推薦專區資料契約
 *
 * 每項推薦 = 可長期查證的公開實體。
 * 不寫時效性資訊（價格、優惠碼、日期），使用者可自行至官網看最新。
 *
 * Phase AQ：分類徹底重組，舊 6 分類（general/visa/arrival/edu/scholarship/
 * taiwan）→ 新 8 分類（finance/transport/telecom/housing/lookup/scholarship/
 * expense/general），依實用主題而非留德階段分類，見 PAT-145。
 */

export type RecommendationCategory =
  | 'finance'
  | 'transport'
  | 'telecom'
  | 'housing'
  | 'lookup'
  | 'scholarship'
  | 'expense'
  | 'general';

export interface RecommendationCategoryMeta {
  key: RecommendationCategory;
  title: string;
  subtitle: string;
}

export const RECOMMENDATION_CATEGORIES: RecommendationCategoryMeta[] = [
  {
    key: 'finance',
    title: '金融',
    subtitle: '銀行開戶、財力證明、跨境匯款',
  },
  {
    key: 'transport',
    title: '交通',
    subtitle: '鐵路、大眾運輸',
  },
  {
    key: 'telecom',
    title: '電信',
    subtitle: 'SIM 卡、網路方案',
  },
  {
    key: 'housing',
    title: '找房',
    subtitle: '租屋、宿舍平台',
  },
  {
    key: 'lookup',
    title: '查詢',
    subtitle: '學歷認證、考試、課程資料庫',
  },
  {
    key: 'scholarship',
    title: '獎學金',
    subtitle: '德國、歐盟、台灣獎學金資源',
  },
  {
    key: 'expense',
    title: '支出',
    subtitle: '保險、貸款、稅費',
  },
  {
    key: 'general',
    title: '通用',
    subtitle: '其他實用工具與社群',
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
