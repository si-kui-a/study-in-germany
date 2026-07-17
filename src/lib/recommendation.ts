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
  | 'general'
  | 'german_learning'
  | 'career';

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
  {
    key: 'german_learning',
    title: '德文學習',
    subtitle: '文法、詞彙、聽力、口說、檢定等 9 子板塊',
  },
  {
    key: 'career',
    title: 'DACH 實習/求職',
    subtitle: '德國、奧地利、瑞士的實習與求職資源',
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

  // Phase BD：找房分類篩選欄位（僅 category === 'housing' 使用，其餘分類留空）
  fee_status?: HousingFeeStatus;
  term?: HousingTerm[];
  target?: HousingTarget[];

  // Phase BE：德文學習分類篩選欄位（僅 category === 'german_learning' 使用）
  board?: GermanLearningBoard[];    // 子板塊，同一資源可能橫跨多個
  level_label?: string;            // 原文等級字串（如 "A1–B2"/"全等級"），逐字保留避免轉譯失真
  level?: GermanLearningLevel[];   // level_label 展開後的離散值，供篩選用
  resource_status?: GermanLearningStatus;
  audience?: GermanLearningAudience[];
  // Phase BJ：費用維度，僅原文明確提及費用性質者標註 free/paid，
  // 其餘一律 unknown（不得臆測），見 PAT-171
  fee?: GermanLearningFee;

  // Phase BG：DACH 實習/求職分類欄位（僅 category === 'career' 使用）。
  // 欄位名稱刻意與 housing/german_learning 已用過的 fee_status/target/
  // audience 區隔開來（career_fee/career_type/career_audience 等），避免
  // 同名欄位在不同分類間型別衝突（見 PAT-164 的 schema 擴充模式）。
  career_type?: CareerType[];       // 子板塊：實習/求職，同一資源可能橫跨兩者
  career_fee?: CareerFee[];         // 費用，同一資源可能同時標註兩種（如求職者免費+企業付費）
  career_mode?: CareerMode[];       // 工作模式：完全遠端/本地/混合
  career_country?: CareerCountry[]; // 涵蓋國家
  career_audience?: CareerAudience[]; // 適合族群，未特別標註者留空（代表不限特定族群）
}

/** 服務費/仲介費狀態 */
export type HousingFeeStatus = 'free' | 'partial' | 'paid' | 'unknown';
export const HOUSING_FEE_STATUS_LABEL: Record<HousingFeeStatus, string> = {
  free: '免費',
  partial: '部分收費',
  paid: '收費',
  unknown: '未知',
};

/** 長租／短租，同一平台可能兩者皆支援 */
export type HousingTerm = 'long' | 'short';
export const HOUSING_TERM_LABEL: Record<HousingTerm, string> = {
  long: '長租',
  short: '短租',
};

/** 適合族群，同一平台可能對應多個 */
export type HousingTarget = 'student' | 'general' | 'shared' | 'room';
export const HOUSING_TARGET_LABEL: Record<HousingTarget, string> = {
  student: '學生',
  general: '通用',
  shared: '合租',
  room: '套房',
};

/**
 * Phase BE：德文學習資源分類欄位。
 * 「子板塊」＝來源表格的「類別」欄，同一資源可橫跨多個子板塊
 * （例：Deutschlernerblog.de 同時屬於文法/詞彙/閱讀/聽力/寫作/檢定）。
 */
export type GermanLearningBoard =
  | 'grammar' | 'general' | 'vocabulary' | 'dictionary' | 'writing'
  | 'reading' | 'listening' | 'speaking' | 'exam';
export const GERMAN_LEARNING_BOARD_LABEL: Record<GermanLearningBoard, string> = {
  grammar: '文法',
  general: '綜合',
  vocabulary: '詞彙',
  dictionary: '字典',
  writing: '寫作',
  reading: '閱讀',
  listening: '聽力',
  speaking: '口說',
  exam: '檢定',
};
/** 子板塊顯示順序，對應來源文件「一、綜合入門」～「九、檢定考試」的章節順序 */
export const GERMAN_LEARNING_BOARD_ORDER: GermanLearningBoard[] = [
  'general', 'grammar', 'dictionary', 'listening', 'reading',
  'vocabulary', 'writing', 'speaking', 'exam',
];

export type GermanLearningLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export const GERMAN_LEARNING_LEVEL_ORDER: GermanLearningLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * 狀態非「正常運作」者必須在卡片視覺上明顯標示（見 PAT-165）——
 * 不可與正常項目同等呈現，讀完整段文字才發現狀態異常不符合零虛構原則。
 */
export type GermanLearningStatus = 'active' | 'changed' | 'outdated' | 'unconfirmed' | 'discontinued_usable';
export const GERMAN_LEARNING_STATUS_LABEL: Record<GermanLearningStatus, string> = {
  active: '正常運作',
  changed: '已變更',
  outdated: '內容老舊',
  unconfirmed: '需人工確認',
  discontinued_usable: '停更可用',
};

/**
 * Phase BJ：入門/中級/高級為新增的族群標籤（beginner 由「初學者」更名為
 * 「入門」，資料沿用既有人工標註不變動；intermediate/advanced 兩個新選項
 * 依既有 level 欄位（CEFR）機械推導，非人工重新判斷用途——見 PAT-171
 * 映射規則：level 含 A1/A2 → 入門（沿用既有 beginner 標註，未改推導方式）；
 * level 含 B1/B2 → 中級；level 含 C1/C2 → 高級。同一資源可能橫跨多個。
 */
export type GermanLearningAudience =
  | 'beginner' | 'intermediate' | 'advanced'
  | 'self_learner' | 'exam_prep' | 'academic' | 'new_immigrant' | 'teacher' | 'child';
export const GERMAN_LEARNING_AUDIENCE_LABEL: Record<GermanLearningAudience, string> = {
  beginner: '入門',
  intermediate: '中級',
  advanced: '高級',
  self_learner: '自學者',
  exam_prep: '考證備考',
  academic: '學術／研究',
  new_immigrant: '新移民',
  teacher: '教師',
  child: '兒童',
};

/** Phase BJ：費用維度，僅原文明確提及費用性質者標註，見 PAT-171 */
export type GermanLearningFee = 'free' | 'paid' | 'unknown';
export const GERMAN_LEARNING_FEE_LABEL: Record<GermanLearningFee, string> = {
  free: '免費',
  paid: '付費',
  unknown: '未標示',
};

/**
 * Phase BG：DACH 實習/求職分類欄位。子板塊僅 2 個（實習/求職），資料量
 * 遠小於德文學習的 9 子板塊，故不採用「全部」預設分頁（見 PAT-166 的
 * 那個決定是德文學習分類的專屬情境，本分類未收到相同指示，預設回歸
 * Phase BD 找房頁的主動篩選風格，不做狀態徽章／不做全部聯集分頁）。
 */
/**
 * Phase BM：新增第三個子板塊「資源」（resource）——Coursera/edX/Udemy
 * 三筆原歸類於德文學習分類，經查證其實質為大學/機構線上課程平台
 * （偏職涯/專業技能導向，非純語言學習資源），轉移至本分類，見 PAT-174。
 */
export type CareerType = 'intern' | 'job' | 'resource';
export const CAREER_TYPE_LABEL: Record<CareerType, string> = {
  intern: '實習',
  job: '求職',
  resource: '資源',
};
export const CAREER_TYPE_ORDER: CareerType[] = ['intern', 'job', 'resource'];

export type CareerFee = 'free' | 'partial' | 'paid';
export const CAREER_FEE_LABEL: Record<CareerFee, string> = {
  free: '免費',
  partial: '部分付費',
  paid: '付費',
};

export type CareerMode = 'remote' | 'local' | 'hybrid';
export const CAREER_MODE_LABEL: Record<CareerMode, string> = {
  remote: '完全遠端',
  local: '本地',
  hybrid: '混合',
};

export type CareerCountry = 'germany' | 'austria' | 'switzerland' | 'other';
export const CAREER_COUNTRY_LABEL: Record<CareerCountry, string> = {
  germany: '德國',
  austria: '奧地利',
  switzerland: '瑞士',
  other: '其他',
};

export type CareerAudience =
  | 'student' | 'graduate' | 'technical' | 'liberal_arts' | 'chinese_speaking' | 'international_student';
export const CAREER_AUDIENCE_LABEL: Record<CareerAudience, string> = {
  student: '學生',
  graduate: '應屆生',
  technical: '技術類',
  liberal_arts: '文組/行政',
  chinese_speaking: '華語圈',
  international_student: '留學生',
};
