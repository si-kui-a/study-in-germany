import type { WorkflowTopic } from './workflow';

export const renewalWorkflow: WorkflowTopic = {
  slug: 'renewal',
  title: '延簽流程',
  subtitle: '居留許可續簽 + Fiktionsbescheinigung',
  description:
    '簽證是入場券 · 居留許可(Aufenthaltstitel)才是留下來的憑證。落地 90 天內辦第一次 · 每 1-2 年續簽一次。',
  steps: [
    {
      step: 1,
      title_zh: '線上預約 Termin',
      meta: { location: 'Ausländerbehörde', timing: '簽證到期前 4-8 週', priority: 'required' },
      outcome: ['取得辦理時間'],
      detail: {
        documents: [],
        procedure: [
          '進所在邦 Ausländerbehörde 網站',
          '選擇「Verlängerung Aufenthaltstitel」',
          '大城市可能等 2-4 個月 · 越早約越好',
        ],
        common_mistakes: [
          '約晚了 → 簽證過期需辦 Fiktionsbescheinigung(見 STEP 8)',
          '約錯類型(延簽 vs 首次辦理)',
        ],
        official_sources: [
          { name: 'Berlin 移民局', url: 'https://www.berlin.de/einwanderung/' },
        ],
      },
    },
    {
      step: 2,
      title_zh: '準備財力證明',
      meta: { docs_count: 2, priority: 'required' },
      outcome: ['證明續簽期間有足夠生活費'],
      detail: {
        documents: ['新的限制提領帳戶（Sperrkonto）或財力擔保', '銀行對帳單'],
        procedure: [
          '若靠限制提領帳戶:需新一年金額到位 · 建議 Termin 前 4-6 週匯入',
          '若靠家人擔保:資助信 + 資助人稅單',
          '若有工作:勞動合約 + 3 個月稅單',
          '個人帳戶最近 3 個月流水 · 顯示無異常大額支出',
        ],
        common_mistakes: [
          '認為第一次辦理過就不用再證明財力(每次都要)',
          '資料只交德文 · 官員要英文備份時沒有',
          '限制提領帳戶新一年金額到帳晚 · 需要重排 Termin',
        ],
        official_sources: [],
      },
    },
    {
      step: 3,
      title_zh: '準備學業/工作證明',
      meta: { docs_count: 1, priority: 'required' },
      outcome: ['證明留在德國的正當理由'],
      detail: {
        documents: ['語校成績單 / 大學已修學分證明 / 勞動合約'],
        procedure: [
          '語校:每週 ≥ 18 小時上課時數',
          '大學:連續兩學期至少修 X 學分(各邦不同)',
          '工作:合約 + Bluecard 薪資達標',
        ],
        common_mistakes: [
          '學業未達進度 → 續簽被拒或減少時長',
          '停學/休學時未告知移民局 → 事後續簽困難',
        ],
        official_sources: [],
      },
    },
    {
      step: 4,
      title_zh: '準備完整文件夾',
      meta: { timing: 'Termin 前一週', docs_count: 8, priority: 'required' },
      outcome: ['避免臨場補件'],
      detail: {
        documents: [
          '護照 + 現行簽證/居留卡',
          'Meldebescheinigung',
          '財力證明(STEP 2)',
          '學業/工作證明(STEP 3)',
          '保險證明',
          '護照照片(生物特徵規格 · 需為申請日前 6 個月內拍攝)',
          '在職者:稅單 · 勞動合約',
          '生物特徵費 €100(現場繳)',
        ],
        procedure: [
          '依 Ausländerbehörde 的清單準備',
          '所有文件備正本 + 影本',
          '訂裝按順序',
        ],
        common_mistakes: [
          '文件過期(保險/財力/戶籍證明皆有時效)',
          '護照少於 6 個月效期',
          '照片超過 6 個月 · 需要重拍',
        ],
        official_sources: [],
      },
    },
    {
      step: 5,
      title_zh: '面談 + 生物特徵',
      meta: { location: 'Ausländerbehörde', timing: '約 30-60 分鐘', priority: 'required' },
      outcome: ['文件受理 · 錄指紋'],
      detail: {
        documents: [],
        procedure: [
          '準時到現場',
          '面談內容:學業/工作進度 · 未來計畫',
          '錄指紋 + 拍照',
          '收「收據」',
        ],
        common_mistakes: [
          '答不出「畢業後計畫」(他們最想知道)',
          '態度不佳(記錄會留下)',
        ],
        official_sources: [],
      },
    },
    {
      step: 6,
      title_zh: '等結果 + 領卡',
      meta: { timing: '3-6 週', priority: 'required' },
      outcome: ['新居留卡到手'],
      detail: {
        documents: [],
        procedure: [
          '收 SMS/email 通知',
          '回 Ausländerbehörde 取卡',
          '確認資料無誤(有效期 · 備註)',
        ],
        common_mistakes: [
          '未當場檢查資料 → 錯字回頭麻煩',
          '簽證過期而卡未到 → 用 Fiktionsbescheinigung(見 STEP 8)',
        ],
        official_sources: [],
      },
    },
    {
      step: 7,
      title_zh: '學業轉工作',
      meta: { timing: '畢業前 6 個月', priority: 'recommended' },
      outcome: ['取得 Bluecard 或求職簽證'],
      detail: {
        documents: ['畢業證書 / 預計畢業證明', '勞動合約(若已有工作)'],
        procedure: [
          '無工作:申請 Arbeitsplatzsuche(求職簽證 18 個月)',
          '有工作且薪資達標:Bluecard(2024/25 門檻 €45,300/年 · STEM €41,041)',
          'Bluecard 33 個月可申請永居 · 21 個月 + B1 也可',
        ],
        common_mistakes: [
          '不知道求職簽證只給一次(18 個月內找不到就 out)',
          '薪資報得太低(未達 Bluecard 門檻)',
        ],
        official_sources: [
          { name: 'Make it in Germany · Bluecard', url: 'https://www.make-it-in-germany.com/en/visa-residence/eu-blue-card' },
        ],
      },
    },
    {
      step: 8,
      title_zh: '過期臨時措施(Fiktionsbescheinigung)',
      title_de: 'Fiktionsbescheinigung',
      meta: { timing: '簽證/居留卡過期但仍在申請中', priority: 'recommended' },
      outcome: ['取得合法居留過渡文件 · 避免非法居留'],
      detail: {
        documents: ['護照', '過期居留卡 / 簽證', '正在申請的證明(Termin 收據)'],
        procedure: [
          {
            text: '什麼情況會用到：',
            items: [
              '簽證/居留卡到期，但延簽 Termin 尚未到',
              '延簽已辦但新卡尚未寄到',
              'Ausländerbehörde 處理延誤',
            ],
          },
          {
            text: '如何取得：',
            items: [
              '到 Ausländerbehörde 現場排隊，不需 Termin',
              '說明狀況並提供上述文件',
              '現場繳費 €13-100，拿到過渡證明',
            ],
          },
          {
            text: '有效期：',
            items: [
              '通常 1-3 個月',
              '可延續至正式新卡發出',
            ],
          },
          {
            text: '⚠️ 重要：',
            items: [
              '賦予暫時居留，但功能受限',
              '不能出境後再入境（部分邦准許，需詢問）',
              '可繼續工作和上學，有時銀行、保險會要求',
              '建議永遠備一份影本',
            ],
          },
        ],
        common_mistakes: [
          '以為簽證過期就是非法 · 沒去辦 Fiktionsbescheinigung 就走',
          '拿了但沒帶著 · 被抽查時無法出示',
          '以為 Fiktionsbescheinigung 可以出境旅遊(可能被拒返德)',
        ],
        official_sources: [
          { name: 'BAMF · Fiktionsbescheinigung', url: 'https://www.bamf.de/' },
        ],
      },
    },
  ],
  general_notes: [
    '續簽門檻可能因政策調整 · 正式辦理前務必確認當前規定',
    '每次 Termin 都收 €100 手續費 · 用現金或卡都可',
    'Fiktionsbescheinigung 只是臨時過渡 · 拿到後仍需盡快取得正式居留卡',
  ],
};
