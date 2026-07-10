import type { WorkflowTopic } from './workflow';

export const policyWorkflow: WorkflowTopic = {
  slug: 'policy',
  title: '教育政策',
  subtitle: 'Bologna · DSH · 學費 · Anerkennung',
  description:
    '知道規則邊界才能規劃策略。以下六個政策議題直接影響留德決策。',
  steps: [
    {
      step: 1,
      title_zh: 'Bologna 進程 + ECTS',
      meta: { priority: 'supplementary' },
      outcome: ['理解德國學位體系與學分換算'],
      detail: {
        documents: [],
        procedure: [
          {
            text: 'Bologna 進程：',
            items: [
              '德國自 2000 年代逐步實施',
              '舊制學位（Diplom / Magister）已停招',
              '新制：學士（3 年）+ 碩士（2 年）+ 博士（3-4 年）',
              '學位歐盟互通，ECTS 學分制',
            ],
          },
          {
            text: 'ECTS 學分換算（歐洲學分轉換系統）：',
            items: [
              '1 學分 = 25-30 小時學習量（含上課 + 自習 + 準備考試）',
              '學士學位一般需 180 ECTS，3 年',
              '碩士學位一般需 60-120 ECTS，1-2 年',
              '一個學期通常修 30 ECTS',
            ],
          },
          {
            text: '換算方法（台灣學分制 → ECTS）：',
            items: [
              '3 學分/學期 台灣課程 ≈ 5-6 ECTS',
              '詳細換算比例每校不同，通常提交 uni-assist 時會自動計算',
              '或申請時提供台灣學分制說明，讓校方計算',
            ],
          },
          {
            text: '成績換算：',
            items: [
              '台灣 GPA 4.0 = 德國 1.0（頂尖）',
              '台灣 3.5 ≈ 德國 1.5-2.0',
              '台灣 3.0 ≈ 德國 2.5-3.0',
              '台灣 2.5 ≈ 德國 3.0-3.5（不理想）',
              '德國 4.0 = 剛通過，5.0 = 不及格',
            ],
          },
        ],
        common_mistakes: [
          '把舊制 Diplom 當現行學位(誤解學歷)',
          '不知道 ECTS 換算方式',
          '以為台灣 GPA 4.0 就是德國最高分',
        ],
        official_sources: [
          { name: 'Bologna Process 官方', url: 'https://www.ehea.info/' },
          { name: 'DAAD · 學分認可', url: 'https://www.daad.de/en/study-and-research-in-germany/plan-your-studies/' },
        ],
      },
      references: [
        'Bologna Process 官方 官方資訊',
        'DAAD · 學分認可 官方資訊',
      ],
      updated_at: '2024-01',
    },
    {
      step: 2,
      title_zh: 'DSH 與其他語言考試',
      meta: { priority: 'required' },
      outcome: ['選對語言考試'],
      detail: {
        documents: [],
        procedure: [
          'DSH-2 = C1 · 多校認可但由目標大學辦',
          'TestDaF 4×4 = C1 · 全德統一考 · 國際通用',
          'telc C1 Hochschule = C1 · 考試較靈活',
          'DSH-1 = B2 上限 · 多數學程不接受',
          '選擇建議:',
          '  · 已錄取一所學校 → 那所學校的 DSH 最直接',
          '  · 想申請多所學校 → TestDaF 通用度高',
          '  · 較彈性的準備方式 → telc',
        ],
        common_mistakes: [
          '考 DSH 前沒申請目標大學(必先錄取才能考)',
          '以為 telc 沒 DSH 官方 · 其實多數學程接受',
        ],
        official_sources: [
          { name: 'DAAD 語言證書比較', url: 'https://www.daad.de/en/study-and-research-in-germany/plan-your-studies/language-requirements/' },
        ],
      },
      references: [
        'DAAD 語言證書比較 官方資訊',
      ],
      updated_at: '2024-01',
    },
    {
      step: 3,
      title_zh: '學費政策',
      meta: { priority: 'recommended' },
      outcome: ['預估留學成本'],
      detail: {
        documents: [],
        procedure: [
          '公立大學基本免學費(僅學期費 €150-350/學期)',
          'Baden-Württemberg 對非歐盟每學期 €1,500',
          '私立大學 €5,000-30,000/年',
          '部分邦討論「精英碩士學程收費」',
        ],
        common_mistakes: [
          '以為所有德國大學免費(未查所在邦政策)',
          '忽略學期費也是一筆錢',
        ],
        official_sources: [
          { name: 'DAAD 學費資訊', url: 'https://www.daad.de/en/study-and-research-in-germany/plan-your-studies/tuition-fees/' },
        ],
      },
      references: [
        'DAAD 學費資訊 官方資訊',
      ],
      updated_at: '2024-01',
    },
    {
      step: 4,
      title_zh: 'Duale Studium(雙軌大學)',
      meta: { priority: 'supplementary' },
      outcome: ['理解另一條路徑'],
      detail: {
        documents: [],
        procedure: [
          '基本模式:大學 + 企業實習同時進行',
          '3-4 年 · 有薪資(€900-1500/月)',
          '需先被企業錄取才能申請學校',
          '畢業多數留原企業',
          {
            text: '台灣學歷 + 身份要求：',
            items: [
              '學歷要求：高中畢業，部分企業要求 GPA 3.0+',
              '語言：通常至少 B1 德文（部分英文授課可 B2 英文）',
              '簽證：需申請雙軌大學專屬簽證（非一般職訓簽證）',
              '財力：雖有薪資但可能需要初始限制提領帳戶過渡',
            ],
          },
          {
            text: '如何申請：',
            items: [
              '先於企業官網或 IHK 網站查詢有開放雙軌大學名額的企業',
              '直接向企業投履歷，通過面試',
              '拿到企業合約後，再向配套大學遞件',
              '企業 + 大學雙方同意即可簽合約',
            ],
          },
          {
            text: '常見產業：',
            items: [
              '汽車產業（BMW、Daimler、VW、Bosch）',
              '銀行、保險（Deutsche Bank、Allianz）',
              '資訊/物流（SAP、Amazon、DHL）',
              '化工/製藥（BASF、Bayer）',
            ],
          },
        ],
        common_mistakes: [
          '以為 Duale = 學徒制(其實有學位)',
          '不知道要先找企業合作 · 直接去大學申請',
          '低估簽證程序 · 企業合約遲了整套流程延遲',
        ],
        official_sources: [
          { name: 'BIBB 職業教育', url: 'https://www.bibb.de/' },
          { name: 'IHK · Duale Studium 職缺', url: 'https://www.ihk.de/' },
        ],
      },
      references: [
        'BIBB 職業教育 官方資訊',
        'IHK · Duale Studium 職缺 官方資訊',
      ],
      updated_at: '2024-01',
    },
    {
      step: 5,
      title_zh: 'Anerkennung 學歷認可',
      meta: { priority: 'required' },
      outcome: ['台灣學歷用於德國職業'],
      detail: {
        documents: [
          '學位證 + 成績單',
          '護照',
          '認證申請費 €200-1,000',
        ],
        procedure: [
          {
            text: '什麼時候需要學歷認可（Anerkennung）：',
            items: [
              '想在德國從事「受管制職業」',
              '非受管制職業（如 IT、商業分析等）通常不需要，由雇主自行判斷',
            ],
          },
          {
            text: '常見受管制職業（全國適用）：',
            items: [
              '醫療：醫師、護理師、藥師、心理師',
              '法律：律師、稅務顧問、公證員',
              '教育：公校老師、教育顧問',
              '技術：工程師、建築師',
              '社會服務：社工師',
            ],
          },
          {
            text: '各州獨有的受管制職業（以下少數例子）：',
            items: [
              'Bayern：歐盟認證的技師',
              'NRW：特定工程領域',
              'Baden-Württemberg：食品衛生檢驗員',
              '各邦教育專業有邦內差異',
            ],
          },
          {
            text: '認證單位：',
            items: [
              '非受管制職業：KMK Zentralstelle',
              '受管制職業（醫師、律師、教師等）：各邦專門機構，例如醫師洽各邦醫師公會、律師洽各邦律師公會、教師洽各邦教育部',
            ],
          },
          {
            text: '如何確認你的職業需否認證：',
            items: [
              '到 anabin.kmk.org 資料庫查詢你的學歷是否對應德國職業',
              '到 Anerkennung in Deutschland 網站查詢職業是否受管制',
              '撥打當地手工業商會或一般商會諮詢',
              '特殊情況可先詢問雇主，他們有處理國際學歷經驗',
            ],
          },
          {
            text: '處理時間：',
            items: [
              '一般 4-12 週',
              '受管制職業可能 6-16 週',
            ],
          },
        ],
        common_mistakes: [
          '不知道自己職業需不需要認證(處理順序錯)',
          '沒認證就找工作(受管制職業雇主會拒)',
          '以為所有職業都需要 Anerkennung',
          '沒查 anabin · 直接開始認證程序',
        ],
        official_sources: [
          { name: 'anabin 資料庫', url: 'https://anabin.kmk.org/anabin.html' },
          { name: 'Anerkennung in Deutschland', url: 'https://www.anerkennung-in-deutschland.de/' },
        ],
      },
      references: [
        'anabin 資料庫 官方資訊',
        'Anerkennung in Deutschland 官方資訊',
      ],
      updated_at: '2024-01',
    },
    {
      step: 6,
      title_zh: '打工政策與工作許可',
      meta: { priority: 'required' },
      outcome: ['合法賺錢 · 不違反學生簽證'],
      detail: {
        documents: [],
        procedure: [
          '學生簽證:140 全天/280 半天 上限 每年',
          '超過需另申請工作許可',
          '學校內助教職不計入配額',
          'Mini-Job(€520/月以下)不繳所得稅但仍計入配額',
        ],
        common_mistakes: [
          '打黑工被抓 → 影響續簽甚至遣返',
          '沒記錄工時 → 超過上限自己不知道',
        ],
        official_sources: [
          { name: 'BAMF 學生工作規則', url: 'https://www.bamf.de/' },
        ],
      },
      references: [
        'BAMF 學生工作規則 官方資訊',
      ],
      updated_at: '2024-01',
    },
  ],
  general_notes: [
    '政策每年可能調整 · 本資料為 2024/25 學年狀態',
    'GDPR 是歐盟法規 · 未來若在德國做網站或應用程式需符合 · 可先了解',
  ],
};
