import type { WorkflowTopic } from './workflow';

export const visaWorkflow: WorkflowTopic = {
  slug: 'visa',
  title: '簽證流程',
  subtitle: '語言 · 大學 · Au-pair · 職訓',
  description:
    '進德國前必須申請對應簽證，落地後 90 天內轉換為長期居留許可（Aufenthaltstitel）。四類簽證用途不同、文件差異大,選錯類型會導致申請重來。',
  steps: [
    {
      step: 1,
      title_zh: '確認簽證類型',
      meta: { timing: '啟動點', priority: 'required' },
      outcome: ['選對簽證類別 · 避免申請流程重來'],
      detail: {
        documents: [],
        procedure: [
          '純學語言 → 語言簽證（Sprachvisum）',
          '已錄取德國大學或學院 → 大學簽證 / 學生簽證（Studienvisum）',
          '尚未錄取但想在德找學校 → 求學者簽證（Studienbewerbervisum, 有效 9 個月）',
          '18-26 歲、A1 以上、家庭幫手 → Au-pair 簽證',
          '德國職訓錄取 → 職訓簽證(Ausbildungsvisum)',
        ],
        common_mistakes: [
          '想留學一年結果辦觀光簽入境(觀光簽無法在德延簽學習)',
          '語言簽證想在德轉大學簽證(原則不允許 · 需返台重申)',
          '未錄取就辦大學簽證(需先有 Zulassung)',
          '不清楚 Studienbewerbervisum 與 Studienvisum 的差別',
        ],
        official_sources: [
          {
            name: '德國聯邦外交部簽證資訊',
            url: 'https://www.auswaertiges-amt.de/de/visa-service',
          },
          {
            name: '德國在台協會',
            url: 'https://taipei.diplo.de/',
          },
        ],
      },
    },
    {
      step: 2,
      title_zh: '收語校/大學錄取通知',
      title_de: 'Aufnahmebestätigung / Zulassungsbescheid',
      meta: { timing: '進申請流程第一件事', docs_count: 1, priority: 'required' },
      outcome: ['取得簽證申請必要文件'],
      detail: {
        documents: [
          '語校錄取通知(含課程時長與時數證明) · 適用語言簽證',
          '大學正式錄取信(Zulassung) · 適用大學簽證',
        ],
        procedure: [
          '語校:在語校官網報名並繳報名費 · 選定課程(每週 ≥ 18 小時 · 6-12 個月)',
          '大學:於 uni-assist 或大學直接申請 · 通過審核收正式錄取信',
          '匯學費並保留匯款收據',
        ],
        common_mistakes: [
          '選課程 < 18 小時/週(不符簽證要求)',
          '未確認課程時長是否適用你的目標簽證類別',
        ],
        official_sources: [
          { name: 'DAAD 語校搜尋', url: 'https://www.daad.de/' },
          { name: 'uni-assist', url: 'https://www.uni-assist.de/' },
        ],
      },
    },
    {
      step: 3,
      title_zh: '開限制提領帳戶 + 個人帳戶',
      title_de: 'Sperrkonto + Girokonto',
      meta: { timing: '簽證申請前 2-3 個月開始準備', docs_count: 3, priority: 'required' },
      outcome: ['限制提領帳戶提供財力證明 · 個人帳戶接收每月劃撥款項'],
      detail: {
        documents: [
          '護照掃描',
          '在台地址證明',
          '起始資金入帳證明',
        ],
        procedure: [
          '⚠️ 重要：限制提領帳戶（Sperrkonto）不是一般銀行帳戶，只能用於財力證明且提領受限',
          '需要另開個人銀行帳戶（Girokonto）接收限制提領帳戶每月劃撥的生活費（2024/25 每月約 €992）',
          {
            text: '限制提領帳戶服務商，線上申請最快：',
            items: [
              'Fintiba',
              'Expatrio',
              'Coracle',
              'Deutsche Bank Sperrkonto',
            ],
          },
          {
            text: '個人銀行帳戶（落地後才能辦）：',
            items: [
              'N26 / Revolut（手機開戶）',
              'Sparkasse / Deutsche Bank / Commerzbank（傳統銀行）',
            ],
          },
          '匯款時機：預計簽證申請前 4-6 週匯入當年度金額（2024/25：€11,904）',
          '匯款到帳後收到確認信，作為簽證申請文件',
          '進德國後於個人帳戶收到限制提領帳戶首次撥款（約落地 1-2 週內）',
        ],
        common_mistakes: [
          '金額不到位(未達當年度標準會被拒)',
          '想落地後補財力(不算)',
          '以為限制提領帳戶等於一般帳戶(結果無法收薪水或房租退款)',
          '沒預留 4-6 週時間匯款 · 到帳時已超過遞件日',
        ],
        official_sources: [
          { name: 'Fintiba', url: 'https://www.fintiba.com/' },
          { name: 'Expatrio', url: 'https://www.expatrio.com/' },
          { name: 'Coracle', url: 'https://www.coracle.de/' },
          { name: 'Deutsche Bank Sperrkonto', url: 'https://www.deutsche-bank.de/pk/konten-und-karten/konten/sperrkonto.html' },
        ],
      },
    },
    {
      step: 4,
      title_zh: '買保險',
      title_de: 'Krankenversicherung',
      meta: { timing: '簽證有效期涵蓋', docs_count: 1, priority: 'required' },
      outcome: ['滿足簽證與居留申請條件 · 就醫有保障'],
      detail: {
        documents: ['保險保單(涵蓋簽證有效期)'],
        procedure: [
          {
            text: '判斷公保還是私保：',
            items: [
              '語校生 / 職訓生 / 25 歲以下 Au-pair → 只能保私保（PKV）',
              '正式大學生（有正式學籍） → 可保公保（GKV），也可繼續私保',
              '30 歲以上 / 已工作 → 通常只能私保',
            ],
          },
          {
            text: '私保（PKV），費用 €30-90/月：',
            items: [
              '常見：Care Concept、Mawista、DR-WALTER、Hansemerkur、TK Studenten',
              '優點：便宜快辦',
              '缺點：自付後申請理賠、部分保單不涵蓋長期病、續簽時可能被拒',
            ],
          },
          {
            text: '公保（GKV），費用 €120-130/月（學生費率）：',
            items: [
              '常見：TK、AOK、Barmer、DAK、Techniker、Bahnhof',
              '優點：就醫當下免自付、涵蓋長期病、續簽穩',
              '缺點：大學正式註冊後才能加入',
            ],
          },
          {
            text: '理賠流程（私保為主）：',
            items: [
              '就醫先自付（現金或刷卡）',
              '索取詳細帳單、就醫紀錄、收據',
              '保險公司提交理賠申請（線上或郵寄）',
              '保險公司 2-6 週內處理，撥回帳戶',
            ],
          },
          '注意：牙醫、眼科、心理諮商多數保單不涵蓋，需另加購',
        ],
        common_mistakes: [
          '買最便宜保險 · 續簽時發現不涵蓋長期病被拒',
          '保單涵蓋期未涵蓋整個簽證期',
          '不知道私保理賠需自付先付 · 沒帶足現金',
          '牙痛才發現保單不涵蓋牙醫',
        ],
        official_sources: [
          { name: 'Mawista', url: 'https://www.mawista.com/' },
          { name: 'Care Concept', url: 'https://www.care-concept.de/' },
          { name: 'TK 公保', url: 'https://www.tk.de/' },
        ],
      },
    },
    {
      step: 5,
      title_zh: '線上預約遞件',
      title_de: 'Terminvereinbarung',
      meta: { location: '德國在台協會', timing: '預計抵達日期 3-4 個月前', priority: 'required' },
      outcome: ['取得面談時間'],
      detail: {
        documents: [],
        procedure: [
          '進德國在台協會官網選簽證類別',
          '選最近可行的預約時段',
          '一般 4-8 週後才有空檔 · 旺季(4-8 月)可能等 8-12 週',
          '簽證處理時間:一般 6-12 週 · 大學簽證旺季可能 12-16 週',
          '因此建議至少在預計抵達日期前 3-4 個月開始預約',
          '收確認信保留',
        ],
        common_mistakes: [
          '搶不到預約時段又不知道還有現場排 backup',
          '約錯類型(語言簽證 vs 大學簽證)',
          '低估等待時間 · 導致簽證核發時已延誤語校開課',
        ],
        official_sources: [
          {
            name: '德國在台協會 · 簽證預約',
            url: 'https://taipei.diplo.de/tw-zh/service/visum-einreise',
          },
        ],
      },
    },
    {
      step: 6,
      title_zh: '準備文件夾',
      meta: { timing: '預約前一週', docs_count: 10, priority: 'required' },
      outcome: ['避免遞件當日補件'],
      detail: {
        documents: [
          '護照(有效期於簽證預定結束日後仍有 6 個月以上) + 影本',
          '證件照 2 張(生物特徵規格 · 需為申請日前 6 個月內拍攝)',
          '簽證申請表(於在台協會網站下載並填寫)',
          '語校錄取通知 / 大學正式錄取信(依簽證類別)',
          '學費繳費證明',
          '限制提領帳戶開戶確認 + 匯款證明',
          '保險保單',
          '住宿證明(暫時 Airbnb 或朋友家也可)',
          '動機信 · 履歷(德文或英文)',
          '簽證處理費 · 現場刷卡繳(現在多為 €75)',
        ],
        procedure: [
          {
            text: '依協會清單逐項準備，各類別要求略有差異：',
            items: [
              '語言簽證：著重語校錄取通知、財力證明',
              '大學簽證：著重正式錄取信、履歷、學業計畫',
              'Au-pair 簽證：著重家庭合約、對方戶籍證明',
              '職訓簽證：著重職訓合約、企業證明',
            ],
          },
          '每份備一份正本 + 一份影本',
          '文件夾按清單順序排列 · 依申請表附文件順序',
        ],
        common_mistakes: [
          '照片規格錯(德國生物特徵規格嚴格 · 一般照相館未必了解)',
          '照片是舊照片 · 超過 6 個月',
          '動機信只寫「想學德文」(過度空泛易被拒)',
          '不同類別文件混用',
        ],
        official_sources: [
          {
            name: '在台協會簽證文件清單',
            url: 'https://taipei.diplo.de/tw-zh/service/visum-einreise',
          },
        ],
      },
    },
    {
      step: 7,
      title_zh: '面談 + 遞件',
      meta: { location: '德國在台協會 · 台北市信義區松高路 1 號 12 樓', timing: '約需 30-60 分鐘', priority: 'required' },
      outcome: ['正式送出申請'],
      detail: {
        documents: ['所有 STEP 6 準備的文件 · 需依原始順序排列'],
        procedure: [
          '⚠️ 進入德協前手機需關機',
          '⚠️ 手機 · 相機 · 電子產品 · 隨身包需放入德協入口處的保險櫃(免費)',
          '德協位於台北市信義區松高路 1 號(遠東國際大飯店 12 樓) · 近捷運市政府站',
          '準時到達(不建議提早太多)',
          '入場檢查 · 抽號碼牌',
          '等候被叫號',
          {
            text: '面談官會問：',
            items: [
              '為何學德文 / 為何選這所大學（依簽證類別而定）',
              '離開台灣的原因（工作 / 生涯規劃 / 家人）',
              '你的留德計畫（短期 · 中期 · 長期）',
              '學習計畫（讀語言後想做什麼、就讀什麼系所）',
              '財源證明如何來（自付 · 家人支援 · 獎學金）',
              '回台計畫或申請德國永居的看法',
            ],
          },
          '文件審核(逐項比對)',
          '現場刷卡繳簽證處理費 €75(不接受現金)',
          '收取件收據 · 有 case number',
          '離開德協時可從保險櫃取回手機和物品',
        ],
        common_mistakes: [
          '面談答不出「離台原因」或「回台計畫」(他們最在意)',
          '文件備份不全 · 順序錯亂',
          '手機沒關機 · 進入時被要求出去關機',
          '沒帶信用卡 · 現場無法繳費',
          '對「留德計畫」講太過理想化(如「一定要留德」)',
        ],
        official_sources: [
          { name: '德國在台協會 · 位置', url: 'https://taipei.diplo.de/tw-zh/vertretungen' },
        ],
      },
    },
    {
      step: 8,
      title_zh: '等結果',
      meta: { timing: '6-12 週(旺季可能更久)', priority: 'required' },
      outcome: ['取得簽證貼紙 · 開始行前準備'],
      detail: {
        documents: [],
        procedure: [
          '協會 email 通知後回去取件',
          '簽證黏在護照上 · 確認資訊無誤',
          '確認簽證有效期涵蓋你的預定行程',
          '確認簽證類別無誤(有時協會會給不同時長)',
        ],
        common_mistakes: [
          '沒注意到簽證核發日 ≠ 入境日',
          '簽證只給部分時長(意外情況需重申)',
          '簽證類別誤標(如語言變成觀光) · 需回頭釐清',
        ],
        official_sources: [],
      },
    },
  ],
  general_notes: [
    '限制提領帳戶每年金額可能調整 · 正式辦理前請核對聯邦外交部最新公告',
    '語言簽證原則不能在德轉大學簽證 · 計畫進大學者建議一開始就辦大學簽證',
    '簽證處理費每年可能調整 · 官方公告為準',
  ],
};
