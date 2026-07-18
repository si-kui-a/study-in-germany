/**
 * 選擇簽證 · 14 張簽證比較卡（Phase BP）。
 *
 * 型別刻意與 workflow.ts 的 WorkflowStep/WorkflowTopic 分離——14 張卡是
 * 「同等級並列比較」而非「步驟化流程」，欄位語意（適用對象/財力信心分級等）
 * 與既有 WorkflowStep 完全不同，強行共用會扭曲兩邊資料模型（見 BP.a 決策）。
 *
 * 內容為來源文件逐字轉錄（見指令書 BP.b「硬性要求，不可退讓」），
 * 不得改寫、摘要或省略任何一卡的「常見錯誤」欄位。
 */

export type Confidence = 'official' | 'alt-high' | 'alt-medium' | 'gap';

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  official: '官方',
  'alt-high': '替代驗證 · 信心：高',
  'alt-medium': '替代驗證 · 信心：中',
  gap: '官網未列出，需另洽詢',
};

/** Phase BQ：摘要層徽章精簡文字，供收合狀態的條列項使用，展開後詳細
 *  區塊仍用上方完整版 CONFIDENCE_LABEL（見 BQ.d：精簡但不得只留圖示）*/
export const CONFIDENCE_LABEL_SHORT: Record<Confidence, string> = {
  official: '官方',
  'alt-high': '替代·高信心',
  'alt-medium': '替代·中信心',
  gap: '官網未列',
};

export interface SourceLink {
  label: string;
  url: string;
}

export interface ConfidenceEntry {
  confidence: Confidence;
  /** 一行摘要，可含 **bold** 標記 */
  summary: string;
  /** 完整引用／公式說明段落（替代驗證常見，含換算範例），可含 **bold** 標記 */
  quote?: string;
  sources?: SourceLink[];
}

/** Phase BQ：財力摘要一行（收合狀態顯示），取該卡最具代表性的一筆
 *  finance entry 精簡改寫，完整計算/落差說明保留在 finance[] 展開區 */
export interface FinanceSummary {
  text: string;
  confidence: Confidence;
}

export interface VisaCard {
  id: string;
  number: string;
  title: string;
  officialUpdated: string;
  sourceNote: string;
  /** 卡09：依來源文件註記「本次未更新」，不得因其他卡片已更新而誤植 */
  notUpdatedThisRound?: boolean;
  /** Phase BQ：一句話結論，收合狀態開門見山顯示（比照 AU.a 三層格式 summary） */
  conclusion: string;
  /** Phase BQ：條列關鍵資訊 2-4 項（年齡/工作權限等，財力另由 financeSummary 呈現） */
  summaryPoints: string[];
  /** Phase BQ：財力精簡一行＋信心徽章，收合狀態顯示 */
  financeSummary: FinanceSummary;
  eligibility: string;
  ageLimit: string;
  ageLimitNote?: ConfidenceEntry;
  finance: ConfidenceEntry[];
  workRights: string;
  degreeRecognition?: string;
  otherRequirements?: string;
  processingDays: string;
  fee: string;
  commonMistakes: string[];
  sources: SourceLink[];
  verifiedAt: string;
}

export const VISA_SELECTOR_TITLE = '選擇簽證';

export const VISA_SELECTOR_SUBTITLE =
  '德國單國長期簽證資訊卡（台灣申請人適用）｜整合版';

/** 模組列表卡片用的短版副標，長版 VISA_SELECTOR_SUBTITLE 僅用於頁面內 Hero */
export const VISA_SELECTOR_MODULE_SUBTITLE = '14 種簽證比較 · 你適合哪一種';

export const VISA_SELECTOR_UPDATE_LOG =
  '更新紀錄：2026-07-18 新增卡03/04/05/06 Bürgergeld公式替代驗證、卡14 BFD官方零用金上限與FSJ地區示例。卡09依用戶指示未更新。';

export const VISA_SELECTOR_DISCLAIMER =
  '本文件所有金額／年齡數字，凡標示「推估」者僅供方向參考，正式申請前務必自行前往官網或現場確認最新公告。官網未載明具體數字之欄位，一律標示「官網未列出，需另洽詢」；標示「替代驗證」者為第三方來源估算，非官方門檻，信心分數與風險已個別註記。';

export const VISA_CARDS: VisaCard[] = [
  {
    id: 'visa-01',
    number: '01',
    title: '工作簽證',
    officialUpdated: '2025-02-14',
    sourceNote: '🔗 1 來源',
    conclusion: '適合：已取得德國企業僱用合約的專業人士',
    summaryPoints: [
      '年齡：官網未列硬性上限，45歲以上另有規定',
      '工作權限：依合約工作',
      '學歷：需 ANABIN/ZAB 認證',
    ],
    financeSummary: { text: '依合約薪資；45歲以上門檻金額未列', confidence: 'gap' },
    eligibility: '已取得德國企業僱用合約、具德國認可高等學歷或完整職業培訓之專業人士',
    ageLimit: '官網未列出硬性上限；45歲以上申請者另有規定',
    finance: [
      {
        confidence: 'gap',
        summary:
          '依僱用合約載明之薪資為準；45歲以上若合約年薪未達法定門檻，須另附「老年生活保障證明」（如台灣勞退帳戶、商業年金保險）。官網未列出法定門檻具體歐元數字，需另洽官網或現場確認。',
        quote: '替代驗證：未找到可信第三方數字，維持缺口。',
      },
    ],
    workRights: '依合約工作',
    degreeRecognition:
      '具高等學歷者須經 ANABIN 資料庫確認學校列「H+」、學位類別與主修相符；未列者須送 ZAB 辦理學歷認證(Zeugnisbewertung)',
    processingDays: '官網未列出固定天數，依個案而定',
    fee: '€75（現金台幣或刷卡，受理後不退費）',
    commonMistakes: [
      '誤以為45歲以上門檻金額全球統一，實際上官網僅要求「附加證明」而未寫死數字',
      '誤將此頁與藍卡簽證(薪資門檻明確)混用',
    ],
    sources: [
      {
        label: '德國在台協會｜單國德國長期簽證須知-工作',
        url: 'https://taipei.diplo.de/tw-zh-tw/service/visa-einreise/2453302-2453302',
      },
    ],
    verifiedAt: '2026-07-18',
  },
  {
    id: 'visa-02',
    number: '02',
    title: '藍卡工作簽證（EU Blue Card）',
    officialUpdated: '2025-02-14',
    sourceNote: '🔗 1 來源',
    conclusion: '適合：高階外籍人才、科技/工程/醫療等稀缺職業人才',
    summaryPoints: [
      '年齡：無限制',
      '工作權限：依合約，需滿6個月以上',
      '學歷：需 ANABIN/ZAB 認證，IT可憑經驗申請',
    ],
    financeSummary: { text: '€50,700/年（一般）／€45,934.20/年（稀缺職業）', confidence: 'official' },
    eligibility: '高階外籍人才、科技/工程/醫療等稀缺職業人才，具德國或經ANABIN/ZAB承認之外國大學學位',
    ageLimit: '無限制',
    finance: [
      {
        confidence: 'official',
        summary: '（2026年1月1日起適用）一般標準職業：年薪毛額至少 **€50,700**',
        sources: [
          {
            label: '德國在台協會｜單國德國長期簽證須知-藍卡(歐盟)',
            url: 'https://taipei.diplo.de/tw-zh-tw/service/visa-einreise/2453304-2453304',
          },
        ],
      },
      {
        confidence: 'official',
        summary:
          '稀缺職業（數學、IT、生命科學、工程師、醫師）：年薪毛額至少 **€45,934.20**，須先取得勞工局(BA)許可',
        sources: [
          {
            label: '德國在台協會｜單國德國長期簽證須知-藍卡(歐盟)',
            url: 'https://taipei.diplo.de/tw-zh-tw/service/visa-einreise/2453304-2453304',
          },
        ],
      },
    ],
    workRights: '依合約工作；合約期須滿6個月以上',
    degreeRecognition:
      '須經 ANABIN 資料庫確認"H+"或送 ZAB 辦理學歷認證；無學歷之IT專家可憑7年內3年以上專業經驗申請',
    processingDays: '官網未列出固定天數',
    fee: '€75',
    commonMistakes: [
      '誤用2025年舊門檻金額（€48,300/€43,992），2026/1/1起已調整為€50,700/€45,934.20',
      '忽略稀缺職業仍需BA許可，並非所有職業都免審',
    ],
    sources: [
      {
        label: '德國在台協會｜單國德國長期簽證須知-藍卡(歐盟)',
        url: 'https://taipei.diplo.de/tw-zh-tw/service/visa-einreise/2453304-2453304',
      },
    ],
    verifiedAt: '2026-07-18',
  },
  {
    id: 'visa-03',
    number: '03',
    title: '結婚/同性伴侶登記簽證',
    officialUpdated: '2025-06-02',
    sourceNote: '🔗 1 來源＋財力替代驗證來源',
    conclusion: '適合：尚未結婚，欲赴德與伴侶完婚或辦理同性伴侶登記',
    summaryPoints: [
      '年齡：官網未列出',
      '工作權限：官網未列出',
      '需德語A1證明＋德國境內居所證明',
    ],
    financeSummary: { text: '約€563/月起估算（依家戶需求）', confidence: 'alt-medium' },
    eligibility: '尚未結婚，欲赴德與德籍或已居留德國之未婚夫/妻完婚，或辦理同性伴侶登記者',
    ageLimit: '官網未列出',
    finance: [
      {
        confidence: 'alt-medium',
        summary: '須提供財力擔保聲明書(Verpflichtungserklärung)；官網未列出具體金額',
        quote:
          '財力替代驗證（信心：中，非官方）：擔保人須證明其收入足以支應「家戶最低生活需求(Bürgergeld/Grundsicherung標準)＋暖房租金」。2025/26月標準需求：單身成人€563；伴侶雙人家庭每人€506（另一來源沿用單人€563計算，兩來源不一致）。此數字用於評估「擔保人財力是否足夠」，非申請人自備金門檻。正式門檻仍以外事局(Ausländerbehörde)個案核定為準。',
        sources: [
          { label: 'how-to-germany.com｜German Family Reunion Visa 2026', url: 'https://www.how-to-germany.com/visa/long-stay/family-reunion/' },
          { label: 'visaright.eu｜Family Reunification Germany 2026', url: 'https://visaright.eu/en/blog/familienzusammenfuehrung' },
          { label: 'fintiba.com｜德國簽證要求完整指南', url: 'https://www.fintiba.com/zh-tw/germany/visa/requirements' },
        ],
      },
    ],
    workRights: '官網未列出',
    otherRequirements: '德語A1證明(6個月內核發)；德國境內租屋合約或足夠居所證明',
    processingDays: '約8週（依個案可能更久）',
    fee: '€75',
    commonMistakes: [
      '與「依親簽證(配偶)」混淆——本簽證是「尚未結婚、赴德完婚」，依親簽證是「已完成結婚登記後團聚」，兩者申請文件不同',
      '忽略須自備德國境內居所/租屋合約證明',
      '誤將Bürgergeld估算數字當作固定門檻，實際仍個案核定',
    ],
    sources: [
      {
        label: '德國在台協會｜單國德國長期簽證須知-結婚/同性伴侶',
        url: 'https://taipei.diplo.de/tw-zh-tw/service/visa-einreise/2453312-2453312',
      },
    ],
    verifiedAt: '2026-07-18',
  },
  {
    id: 'visa-04',
    number: '04',
    title: '依親簽證（配偶/同性伴侶）',
    officialUpdated: '2025-06-02',
    sourceNote: '🔗 1 來源＋財力替代驗證來源',
    conclusion: '適合：已完成結婚/伴侶登記，欲與配偶在德團聚',
    summaryPoints: [
      '年齡：官網未列出',
      '工作權限：官網未列出（居留後可另申請）',
      '需德語A1證明＋結婚證書正本驗證',
    ],
    financeSummary: { text: '約€2,068/月估算（配偶+2子女+租金範例）', confidence: 'alt-medium' },
    eligibility: '已完成結婚登記或同性伴侶登記，欲赴德與配偶/伴侶團聚者',
    ageLimit: '官網未列出',
    finance: [
      {
        confidence: 'alt-medium',
        summary: '官網未列出具體金額（一般依被依親配偶之經濟能力審查）',
        quote:
          '財力替代驗證（信心：中，非官方）：公式＝Σ(家戶成員Bürgergeld標準需求)＋暖房租金全額。2025/26月標準需求：單身成人€563、兒童0–5歲€357（另一來源€390）、兒童6–13歲€390、兒童14–17歲€471（另一來源6–17歲統一€471）。範例：配偶＋2名學齡兒童＋暖房租金€1,000 ≈ 需求€2,068/月。兩來源(how-to-germany/visaright)兒童分級與伴侶數字不一致，屬2025→2026制度過渡落差，僅供方向估算。',
        sources: [
          { label: 'how-to-germany.com（2026）', url: 'https://www.how-to-germany.com/visa/long-stay/family-reunion/' },
          { label: 'visaright.eu（2026）', url: 'https://visaright.eu/en/blog/familienzusammenfuehrung' },
        ],
      },
    ],
    workRights: '官網未列出（實務上核發居留證後可另申請工作許可，請以居留當地外事單位規定為準）',
    otherRequirements: '德國結婚證書或英文結婚證書(須正本驗證)；德語A1證明(6個月內核發)；被依親者護照影本(非德籍另附居留證影本)',
    processingDays: '官網未列出固定天數',
    fee: '€75',
    commonMistakes: [
      '誤用「結婚/同性伴侶登記簽證」（簽證卡03）之文件清單申請本簽證，兩者條件不同',
      '忽略德語A1證明須為6個月內核發之新證書',
      '將替代驗證的估算金額誤認為官方固定門檻',
    ],
    sources: [
      {
        label: '德國在台協會｜單國德國長期簽證須知-依親簽證(配偶/同性伴侶)',
        url: 'https://taipei.diplo.de/tw-zh-tw/service/visa-einreise/2453296-2453296',
      },
    ],
    verifiedAt: '2026-07-18',
  },
  {
    id: 'visa-05',
    number: '05',
    title: '依親簽證（依附未成年德籍子女）',
    officialUpdated: '2024-12-17',
    sourceNote: '🔗 1 來源＋財力替代驗證來源',
    conclusion: '適合：台灣籍父母欲依附未成年德籍子女赴德',
    summaryPoints: [
      '年齡：子女須未成年，申請人本身無限制',
      '工作權限：官網未列出',
      '需子女出生證明＋監護權證明',
    ],
    financeSummary: { text: '依家戶需求公式估算（同卡04邏輯）', confidence: 'alt-medium' },
    eligibility: '台灣籍父母欲依附其未成年德籍子女赴德居留',
    ageLimit: '依附對象（子女）須為未成年；申請人（父/母）本身無年齡限制',
    finance: [
      {
        confidence: 'alt-medium',
        summary: '官網未列出具體金額',
        quote:
          '財力替代驗證（信心：中，非官方）：適用同卡04之Bürgergeld公式邏輯（家戶成員標準需求＋暖房租金），惟此類別常涉及單親家庭與德籍子女，實際核定另受兒童福利與監護狀態影響，估算誤差較配偶依親更大，僅供方向參考。',
        sources: [
          { label: 'how-to-germany.com（2026）', url: 'https://www.how-to-germany.com/visa/long-stay/family-reunion/' },
          { label: 'visaright.eu（2026）', url: 'https://visaright.eu/en/blog/familienzusammenfuehrung' },
        ],
      },
    ],
    workRights: '官網未列出',
    otherRequirements: '未成年子女出生證明(正本驗證)；德籍子女護照影本；監護權證明（父母結婚證書或法院判決）',
    processingDays: '官網未列出固定天數',
    fee: '€75',
    commonMistakes: [
      '與「未成年子女依親父母」（簽證卡06）方向相反——本卡是父母依附子女，簽證卡06是子女依附父母',
    ],
    sources: [
      {
        label: '德國在台協會｜單國德國長期簽證須知-依親(依附未成年德籍子女)',
        url: 'https://taipei.diplo.de/tw-zh-tw/service/visa-einreise/2453298-2453298',
      },
    ],
    verifiedAt: '2026-07-18',
  },
  {
    id: 'visa-06',
    number: '06',
    title: '未成年子女依親父母',
    officialUpdated: '2024-12-17',
    sourceNote: '🔗 1 來源＋財力替代驗證來源',
    conclusion: '適合：未滿18歲子女依附持監護權之父母赴德',
    summaryPoints: [
      '年齡：申請人須未滿18歲',
      '工作權限：官網未列出',
      '⚠️ 父母/監護人須親自陪同申請',
    ],
    financeSummary: { text: '依擔保人(父母)收入公式估算', confidence: 'alt-medium' },
    eligibility: '未滿18歲之未成年子女，依附持有監護權之父/母（或單獨監護人）赴德',
    ageLimit: '申請人須未滿18歲；官網明訂父母或監護人須親自陪同提出申請',
    finance: [
      {
        confidence: 'alt-medium',
        summary: '官網未列出具體金額',
        quote:
          '財力替代驗證（信心：中，非官方）：財力審查對象為德國境內之父/母（擔保人），非未成年申請人本身。可套用卡04之Bürgergeld公式（含子女年齡分級需求＋暖房租金）估算擔保人所需收入水準，僅供方向參考。',
        sources: [
          { label: 'how-to-germany.com（2026）', url: 'https://www.how-to-germany.com/visa/long-stay/family-reunion/' },
          { label: 'visaright.eu（2026）', url: 'https://visaright.eu/en/blog/familienzusammenfuehrung' },
        ],
      },
    ],
    workRights: '官網未列出（未成年就學另受其他就學規範限制）',
    otherRequirements: '英文戶籍謄本(正本驗證)；德籍父母護照影本(非德籍另附居留證影本)；父母離婚者須單獨監護權證明',
    processingDays: '官網未列出固定天數',
    fee: '€75',
    commonMistakes: [
      '遺漏「父母/監護人須親自陪同申請」此項強制規定，導致現場被拒收件',
    ],
    sources: [
      {
        label: '德國在台協會｜單國德國長期簽證須知-依親簽證:未成年子女依附擁有監護權的父母',
        url: 'https://taipei.diplo.de/tw-zh-tw/service/visa-einreise/2453300-2453300',
      },
    ],
    verifiedAt: '2026-07-18',
  },
  {
    id: 'visa-07',
    number: '07',
    title: '實習/受訓簽證',
    officialUpdated: '2025-02-18',
    sourceNote: '🔗 1 來源',
    conclusion: '適合：在學/畢業2年內實習生，或雙軌制職業培訓生',
    summaryPoints: [
      '年齡：官網未列出',
      '工作權限：依實習/受訓合約，學程實習需 ZAV 許可',
      '財力四擇一（合約薪資/存款證明/擔保書/獎學金）',
    ],
    financeSummary: { text: '四擇一彈性證明，銀行帳戶最低額未列', confidence: 'gap' },
    eligibility: '①實習：大學在學或畢業不超過2年，赴德企業進行專業相關實習；②受訓：赴德參加雙軌制職業培訓(Ausbildung)',
    ageLimit: '官網未列出',
    finance: [
      {
        confidence: 'gap',
        summary:
          '（四擇一，皆須附影本）實習合約內載明之每月薪資／個人銀行帳戶3個月以上交易明細／德國境內擔保人之財力擔保聲明書／英文版獎學金證明。官網未列出「個人銀行帳戶」項之最低月存款額具體數字。',
        quote: '替代驗證：未找到可信第三方數字，維持缺口。',
      },
    ],
    workRights: '依實習/受訓合約內容工作；學程規定之實習需另附勞工局(ZAV)工作許可',
    processingDays: '依申請文件而異，官網未列出固定天數',
    fee: '€75',
    commonMistakes: [
      '誤以為財力證明只能用限制提領帳戶(Sperrkonto)，實際上官網列出四種可接受形式',
      '忽略「學程規定實習」與「自主安排實習」在ZAV許可要求上的差異',
    ],
    sources: [
      {
        label: '德國在台協會｜單國德國長期簽證須知-實習/受訓',
        url: 'https://taipei.diplo.de/tw-zh-tw/service/visa-einreise/2453308-2453308',
      },
    ],
    verifiedAt: '2026-07-18',
  },
  {
    id: 'visa-08',
    number: '08',
    title: '客座學者/研究人員簽證',
    officialUpdated: '2025-02-14',
    sourceNote: '🔗 1 來源',
    conclusion: '適合：受德國學術機構邀請進行研究/授課/交流',
    summaryPoints: [
      '年齡：無限制',
      '工作權限：官網未列出',
      '審核最快，約1週',
    ],
    financeSummary: { text: '三擇一彈性證明，無固定月數字', confidence: 'gap' },
    eligibility: '受德國研究機構、大學或認證學術單位邀請，進行學術交流、授課或計畫研究者',
    ageLimit: '無限制',
    finance: [
      {
        confidence: 'gap',
        summary:
          '（三擇一）獎學金許可函／大學或研究機構提供之月薪證明／個人銀行帳戶至少完整3個月以上明細。官網未列出固定月數字（如坊間常見的€992/月僅為Sperrkonto通用估算標準，非本簽證專屬數字）。',
        quote: '替代驗證：未找到可信第三方專屬數字，維持缺口。',
      },
    ],
    workRights: '官網未列出',
    otherRequirements: '德國大學入學許可或研究機構邀請函(正本+影本)；身分為研究人員者須另附研究人員合約',
    processingDays: '約1週（本類別中審核最快）',
    fee: '€75（德籍/歐盟籍公民之配偶免付）',
    commonMistakes: [
      '誤植固定財力數字（如€992/月），官網實際上是三選一彈性財力證明，無統一數字',
    ],
    sources: [
      {
        label: '德國在台協會｜單國德國長期簽證須知-客座學者/研究人員',
        url: 'https://taipei.diplo.de/tw-zh-tw/service/visa-einreise/2453314-2453314',
      },
    ],
    verifiedAt: '2026-07-18',
  },
  {
    id: 'visa-09',
    number: '09',
    title: '中學交換生簽證',
    officialUpdated: '2024-12-17',
    sourceNote: '🔗 1 來源（本卡未列入本次更新範圍）',
    notUpdatedThisRound: true,
    conclusion: '適合：透過合格交換計畫赴德中學交流之台灣國高中生',
    summaryPoints: [
      '年齡：僅稱「未成年」，無具體歲數區間',
      '工作權限：官網未列出',
      '⚠️ 父母/監護人須親自陪同申請',
    ],
    financeSummary: { text: '四擇一彈性證明', confidence: 'gap' },
    eligibility: '台灣國高中生透過合格交換計畫，赴德中學進行文化與學術交流',
    ageLimit: '官網僅稱申請者須為「未成年」，未列出具體歲數區間（如常見的14–18歲屬計畫主辦單位或坊間慣例，非本官網原文）',
    finance: [
      {
        confidence: 'gap',
        summary:
          '（四擇一）德國境內擔保人財力擔保聲明書／交換機構依§§66-68居留法規提供之財力擔保聲明書／限制提領帳戶(Sperrkonto)／英文版獎學金證明。',
      },
    ],
    workRights: '官網未列出',
    otherRequirements: '未成年申請人之父母/監護人須親自陪同申請；經合格交換機構(如YFU、AFS)或姊妹校安排之邀請函/確認函',
    processingDays: '依申請文件而異',
    fee: '€75',
    commonMistakes: [
      '將坊間流傳的「14–18歲」當作官方硬性規定，實際年齡區間應洽交換計畫主辦單位確認',
      '遺漏寄宿家庭同意函與詳細居住地址',
    ],
    sources: [
      {
        label: '德國在台協會｜單國德國長期簽證須知-中學交換生',
        url: 'https://taipei.diplo.de/tw-zh-tw/service/visa-einreise/2453310-2453310',
      },
    ],
    verifiedAt: '2026-07-18',
  },
  {
    id: 'visa-10',
    number: '10',
    title: '語言進修簽證（不含申請學校）',
    officialUpdated: '2024-12-17',
    sourceNote: '🔗 1 來源',
    conclusion: '適合：純赴德語言學校學習德文，無升學意圖',
    summaryPoints: [
      '年齡：官網未列出',
      '工作權限：可打工，每週≤20小時',
      '無法直接轉換為就學簽證',
    ],
    financeSummary: { text: '€1,091/月（Sperrkonto）', confidence: 'official' },
    eligibility: '純粹赴德語言學校(Sprachschule)學習德文，無升學意圖',
    ageLimit: '官網未列出',
    finance: [
      {
        confidence: 'official',
        summary: '限制提領帳戶(Sperrkonto)每月至少 **€1,091**（此數字與「高等學院就讀簽證」之€992不同，兩者不可混用）',
      },
    ],
    workRights: '可打工，每週不得超過20小時，但不得從事自營業（自由業/自營商）',
    otherRequirements:
      '課程要求：每週至少18小時，官網建議報名20–22小時課程以利簽證申請。此簽證無法在德國境內直接轉換為就學目的居留證，欲繼續攻讀學位者須以「就學目的」重新申請',
    processingDays: '依申請文件而異',
    fee: '€75',
    commonMistakes: [
      '誤植財力數字為€992（該數字屬高等學院就讀簽證專用）',
      '誤以為語言簽證完全不可打工，實際上可打工但週工時上限20小時',
    ],
    sources: [
      {
        label: '德國在台協會｜單國德國長期簽證須知-語言進修(不含申請學校)',
        url: 'https://taipei.diplo.de/tw-zh-tw/service/visa-einreise/2453290-2453290',
      },
    ],
    verifiedAt: '2026-07-18',
  },
  {
    id: 'visa-11',
    number: '11',
    title: '高等學院就讀簽證（已獲入學許可）',
    officialUpdated: '2025-02-14',
    sourceNote: '🔗 1 來源',
    conclusion: '適合：已取得德國大學/科大正式入學許可',
    summaryPoints: [
      '年齡：無限制',
      '工作權限：註冊後最多120全天/240半天',
      '審核約2–3週',
    ],
    financeSummary: { text: '€992/月，年€11,904（Sperrkonto）', confidence: 'official' },
    eligibility: '已取得德國大學、科技大學或同等高等教育機構正式入學許可(Zulassungsbescheid)者',
    ageLimit: '無限制',
    finance: [
      {
        confidence: 'official',
        summary: 'Sperrkonto 每月 **€992／年€11,904**（交換學生依總停留月數計算）',
      },
    ],
    workRights: '註冊後可工作，一年總計最多120個全天或240個半天（此為現行新制，與坊間流傳之140/280舊制不同）',
    otherRequirements: '授課語言能力證明(交換學生除外)；德文或英文動機信；適用德國境內、入境日生效之保險證明',
    processingDays: '約2–3週',
    fee: '€75',
    commonMistakes: [
      '引用工作時數舊制(140天/280半天)，現行已調整為120天/240半天',
      '誤將德國或旅遊平安險當作學生註冊用健保，實際須為德國境內公立/私立學生健保',
    ],
    sources: [
      {
        label: '德國在台協會｜單國德國長期簽證-於德國境內就讀高等學院簽證',
        url: 'https://taipei.diplo.de/tw-zh-tw/service/visa-einreise/2453292-2453292',
      },
    ],
    verifiedAt: '2026-07-18',
  },
  {
    id: 'visa-12',
    number: '12',
    title: '打工度假簽證',
    officialUpdated: '2025-02-12',
    sourceNote: '🔗 1 來源',
    conclusion: '適合：18–30歲台灣青年赴德度假並打工籌旅費',
    summaryPoints: [
      '年齡：18–30歲，每年名額500名',
      '工作權限：同一雇主最長3個月',
      '不得轉換為其他停留目的',
    ],
    financeSummary: { text: '€4,000 存款證明', confidence: 'official' },
    eligibility: '台灣青年赴德度假旅遊，並藉短期工作籌措旅費',
    ageLimit: '申請時須滿18歲且未滿31歲（即18–30歲）；每年名額500名',
    finance: [
      {
        confidence: 'official',
        summary:
          '銀行存摺正本存款至少 **€4,000**（自己或父母帳戶皆可；若為父母帳戶須另附費用負擔聲明書）。官網原文未提及「無回程機票需提高至€6,000」之條款，此說法未見於官方頁面，如遇此要求請以現場承辦人員說明為準',
      },
    ],
    workRights: '可工作籌措旅費，同一雇主最長3個月；語言班/技職訓練/實習總計不超過總停留一半（最長6個月）',
    otherRequirements: '不得從事需特殊資格工作(如看護)或互惠生等特別法規工作；不得轉換為其他停留目的簽證；不得展延',
    processingDays: '約1週',
    fee: '€75',
    commonMistakes: [
      '誤信「無回程機票需備€6,000」的說法，此條款未見於官方頁面原文',
      '誤以為可轉換為其他長期居留目的，實際上完全不可轉換',
    ],
    sources: [
      {
        label: '德國在台協會｜打工度假簽證須知',
        url: 'https://taipei.diplo.de/tw-zh-tw/service/visa-einreise/2453316-2453316',
      },
    ],
    verifiedAt: '2026-07-18',
  },
  {
    id: 'visa-13',
    number: '13',
    title: '互惠生（Au-Pair）簽證',
    officialUpdated: '2023-09-22',
    sourceNote: '🔗 1 來源',
    conclusion: '適合：赴德接待家庭協助家務/照顧孩童並學德語',
    summaryPoints: [
      '年齡：不得超過26歲',
      '工作權限：僅限互惠工作本身',
      '需德語A1以上證書',
    ],
    financeSummary: { text: '官網未列零用金數字', confidence: 'gap' },
    eligibility: '赴德接待家庭協助照顧孩童、分擔簡單家務，藉此體驗生活並學習德語',
    ageLimit: '申請時不得超過26歲（官網原文明訂上限，未列出最低年齡）',
    finance: [
      {
        confidence: 'gap',
        summary:
          '官網未列出零用金或財力具體數字（坊間常見€280/月零用金、€70語言班補助等說法未見於本官方頁面）。',
        quote: '替代驗證：未找到可信第三方數字，維持缺口，如需確認請洽接待家庭合約或現場承辦人員。',
      },
    ],
    workRights: '僅限互惠工作本身（依合約協助家務/照顧孩童），不得從事其他受僱、兼職或自由業工作',
    otherRequirements: '德語能力A1以上，證書須6個月內核發；接待家庭德國護照影本、邀請函',
    processingDays: '約8週',
    fee: '€75',
    commonMistakes: [
      '誤植年齡上限為27歲，官網明訂上限為26歲',
      '誤信固定零用金數字（如€280/月），此數字未見於官方頁面，實際金額依接待家庭合約而定',
    ],
    sources: [
      {
        label: '德國在台協會｜單國德國長期簽證須知-互惠生',
        url: 'https://taipei.diplo.de/tw-zh-tw/service/visa-einreise/2453306-2453306',
      },
    ],
    verifiedAt: '2026-07-18',
  },
  {
    id: 'visa-14',
    number: '14',
    title: '志願服務者簽證（BFD／FSJ／FÖJ／EFD）',
    officialUpdated: '2023-09-22',
    sourceNote: '🔗 1 來源＋財力替代驗證來源（官方bmbfsfj.bund.de、ich-will-fsj.de）',
    conclusion: '適合：赴德參加 BFD/FSJ/FÖJ/EFD 志願服務',
    summaryPoints: [
      '年齡：BFD無上限（官方），其餘未列',
      '工作權限：僅限指定機構志願服務',
      '服務期6–24個月，可全職或兼職',
    ],
    financeSummary: { text: 'EFD€110/月；BFD上限€644/月；因方案而異', confidence: 'official' },
    eligibility: '赴德參加聯邦志願服務(BFD)、志願社會年(FSJ)、志願生態年(FÖJ)或歐盟志願服務(EFD)',
    ageLimit: '官網未列出統一數字，依各計畫類型另有規定',
    ageLimitNote: {
      confidence: 'alt-high',
      summary: 'BFD無年齡上限，僅須完成「全時義務教育」即可申請；FSJ/FÖJ慣例上限齡於26歲仍未見官方明文，維持原缺口標示。',
      sources: [
        {
          label: 'bmbfsfj.bund.de｜Bürgerinnen und Bürger jeden Alters engagieren sich（BFD官方頁）',
          url: 'https://www.bmbfsfj.bund.de/bmbfsfj/themen/engagement-und-gesellschaft/freiwilligendienste/bundesfreiwilligendienst/bundesfreiwilligendienst/buergerinnen-und-buerger-jeden-alters-engagieren-sich-75014',
        },
      ],
    },
    finance: [
      {
        confidence: 'official',
        summary: 'EFD（歐盟志願服務）：官網明確載明服務單位負擔食宿＋每月約 **€110** 零用金',
      },
      {
        confidence: 'gap',
        summary: 'BFD／FSJ／FÖJ：官網未列出統一零用金數字，合約未載明食宿供給者須另附「基本生活保障證明」',
      },
      {
        confidence: 'official',
        summary: 'BFD零用金(Taschengeld)法定上限為 **€644/月**（全職，2025年1月生效），實際給付金額由服務單位與志工個別協議，此為法定天花板非固定發放額。',
        sources: [
          {
            label: 'bmbfsfj.bund.de｜Bürgerinnen und Bürger jeden Alters engagieren sich（BFD官方頁）',
            url: 'https://www.bmbfsfj.bund.de/bmbfsfj/themen/engagement-und-gesellschaft/freiwilligendienste/bundesfreiwilligendienst/bundesfreiwilligendienst/buergerinnen-und-buerger-jeden-alters-engagieren-sich-75014',
          },
        ],
      },
      {
        confidence: 'alt-medium',
        summary:
          'FSJ財力替代驗證（僅單一地區示例，非全國統一）：Baden-Württemberg邦Freiwilligendienste DRS gGmbH之FSJ方案：基本零用金最低€390/月＋餐費補助€60/月＋交通補助€50/月。此數字僅代表單一邦單一Träger，不可套用至其他邦或機構，實際金額須另洽所選服務單位。',
        sources: [
          { label: 'ich-will-fsj.de｜FSJ Gehalt & Leistungen（Freiwilligendienste DRS gGmbH，BW地區）', url: 'https://ich-will-fsj.de/was-du-bekommst/bezahlung-und-mehr' },
        ],
      },
    ],
    workRights: '僅限指定機構內之志願服務工作，不得從事其他兼職或受僱工作',
    otherRequirements:
      '志願服務合約需視類型由BAFzA／媒合機構／服務單位共同簽署；德語能力不足者可先取得「暫時放棄德語要求」證明，入境後補修課程；BFD服務期間為6–24個月，可全職或兼職(>20hr/週)',
    processingDays: '官網未列出固定天數',
    fee: '€75',
    commonMistakes: [
      '將EFD的€110/月零用金數字誤套用至BFD/FSJ/FÖJ，三者財力規定不同',
      '忽略BFD需三方(BAFzA+服務單位+媒合機構)共同簽署合約之特殊規定',
      '誤將BW地區FSJ示例數字(€390+€60+€50)當作全國統一標準',
      '誤將BFD零用金上限(€644/月)當作保證發放金額，實際仍由服務單位協議',
    ],
    sources: [
      {
        label: '德國在台協會｜單國德國長期簽證-志願服務者簽證',
        url: 'https://taipei.diplo.de/tw-zh-tw/service/visa-einreise/2525726-2525726',
      },
      {
        label: 'bmbfsfj.bund.de｜Bürgerinnen und Bürger jeden Alters engagieren sich（BFD官方頁）',
        url: 'https://www.bmbfsfj.bund.de/bmbfsfj/themen/engagement-und-gesellschaft/freiwilligendienste/bundesfreiwilligendienst/bundesfreiwilligendienst/buergerinnen-und-buerger-jeden-alters-engagieren-sich-75014',
      },
      {
        label: 'ich-will-fsj.de｜FSJ Gehalt & Leistungen（Freiwilligendienste DRS gGmbH，BW地區）',
        url: 'https://ich-will-fsj.de/was-du-bekommst/bezahlung-und-mehr',
      },
    ],
    verifiedAt: '2026-07-18；財力替代驗證補充於 2026-07-18',
  },
];
