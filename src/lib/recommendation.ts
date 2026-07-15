/**
 * Phase H · 推薦專區資料契約
 *
 * 每項推薦 = 可長期查證的公開實體。
 * 不寫時效性資訊（價格、優惠碼、日期），使用者可自行至官網看最新。
 *
 * Phase AQ：分類徹底重組，舊 6 分類（general/visa/arrival/edu/scholarship/
 * taiwan）→ 新 8 分類（finance/transport/telecom/housing/lookup/scholarship/
 * expense/general），依實用主題而非留德階段分類，見 PAT-145。
 * Phase AR：新增第 9 分類 immigration（外事局），僅收錄已查證連結，見 PAT-146。
 * Phase AS：描述過長項目改用 summary/points/detail 三層結構（沿用 PAT-135
 * FAQ 已建立的格式），並全面補上 updated_at，見 PAT-147/148。
 */

export type RecommendationCategory =
  | 'finance'
  | 'transport'
  | 'telecom'
  | 'housing'
  | 'lookup'
  | 'scholarship'
  | 'expense'
  | 'immigration'
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
    key: 'immigration',
    title: '外事局',
    subtitle: '各城市 Ausländerbehörde 官方入口',
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
  description?: string; // 短描述；描述過長改用 summary/points/detail 時可省略
  summary?: string;    // 首句摘要，開門見山點出用途
  points?: string[];   // 條列重點，只含原文已有的具體事實，不虛構新數據
  detail?: string;     // 完整原文，收合顯示
  updated_at?: string; // 'YYYY-MM'，內容查證/建立月份
  tags: string[];
  url: string;
  note?: string; // 額外註記，例如「需 GitHub 帳號」
}
