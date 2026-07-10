import type { WorkflowTopic } from './workflow';

export const arrivalWorkflow: WorkflowTopic = {
  slug: 'arrival',
  title: '落地指南',
  subtitle: '住宿 · 戶籍 · 帳戶 · 保險 · 電視稅',
  description:
    '落地前 30 天最忙的行政事項。順序有優先級 · 前幾項必須兩週內完成 · 否則影響後續所有事。',
  steps: [
    {
      step: 1,
      title_zh: '如何找房',
      title_de: 'Wohnungssuche',
      meta: { timing: '落地前 1-2 個月開始', priority: 'required' },
      outcome: ['找到落地後的暫時或長期住處'],
      detail: {
        documents: [],
        procedure: [
          {
            text: '常見住宿類型：',
            items: [
              'Wohnung：整間公寓，適合已定居的家庭',
              'WG（合租公寓的一間房）：學生最常選',
              '學生宿舍：需向 Studentenwerk 申請，便宜但等候期長',
              '短期轉租：適合 1-3 個月的過渡',
            ],
          },
          {
            text: '找房平台：',
            items: [
              'wg-gesucht.de（WG 首選）',
              'immobilienscout24.de（整套房）',
              'immowelt.de',
              'Facebook 台灣人在德國社團',
              '學校 Studentenwerk 官網',
            ],
          },
          {
            text: '準備常用文件（所有找房都要）：',
            items: [
              'SCHUFA 信用紀錄（剛到德國無紀錄，可用父母匯款證明或未來工作合約替代）',
              '過去 3 個月薪資單 / 銀行對帳單',
              '自我介紹信（WG 需要）',
              '護照影本',
              '上一位房東的推薦信（有的話）',
            ],
          },
        ],
        common_mistakes: [
          '「請先匯定金再看房」= 100% 詐騙 · 直接封鎖',
          '「房源在瑞士 / 想匯到瑞士帳戶」= 100% 詐騙',
          '找到房就想立刻付定金 · 沒看房就付款',
          '要求你先簽合約再看房',
        ],
        official_sources: [
          { name: 'wg-gesucht.de', url: 'https://www.wg-gesucht.de/' },
          { name: 'immobilienscout24', url: 'https://www.immobilienscout24.de/' },
          { name: 'Studentenwerk 學生宿舍', url: 'https://www.studentenwerke.de/' },
        ],
      },
    },
    {
      step: 2,
      title_zh: '辨識好壞租屋處',
      meta: { timing: '看房時', priority: 'required' },
      outcome: ['避免入住後才發現問題'],
      detail: {
        documents: [],
        procedure: [
          {
            text: '房屋實體條件：',
            items: [
              '通風採光、廁所排水、熱水系統',
              '有無漏水、霉斑、蟲害',
              '隔音品質（公寓上下樓、合租隔壁房）',
              '廚房家電是否完整、冰箱冷凍能力',
              '洗衣、曬衣空間',
            ],
          },
          {
            text: '費用結構：',
            items: [
              '冷租 + 水電暖氣等 = 暖租（實際每月要付的總額）',
              '押金：通常 2-3 個月冷租，房東需開專用帳戶',
              '網路費是否含在內',
            ],
          },
          {
            text: '房東 / 室友：',
            items: [
              '是否易於溝通',
              '過去的處理糾紛態度',
              '打掃安排、廚房規範',
              '訪客規定、派對政策',
            ],
          },
          {
            text: '警訊（看到就跑）：',
            items: [
              '房東要求現金付押金，沒開專用帳戶',
              '沒有正式書面租約',
              '房東不願提供房東確認書',
              '房子看起來明顯超收租金（比周邊高 30%+）',
              '房東急著催你簽，不給看合約條款時間',
              '室友明顯避開回答共同開銷',
            ],
          },
        ],
        common_mistakes: [
          '沒看房就簽約(遠端簽) · 進去才發現有問題',
          '沒問清楚暖租涵蓋哪些 · 每月被額外收費',
          '押金付現金 · 無正式收據',
          '房東不給合約副本 · 出事無憑證',
        ],
        official_sources: [
          { name: '德國租屋法規 · Mieterschutzbund', url: 'https://www.mieterbund.de/' },
        ],
      },
    },
    {
      step: 3,
      title_zh: '確認能否辦戶籍',
      title_de: 'Meldefähigkeit',
      meta: { timing: '簽約前必問', priority: 'required' },
      outcome: ['確保能在 14 天內完成戶籍登記(所有後續事項的基礎)'],
      detail: {
        documents: ['房東確認書（Wohnungsgeberbestätigung）'],
        procedure: [
          '⚠️ 極重要 · 不是所有租約都能辦戶籍',
          {
            text: '可辦戶籍的類型：',
            items: [
              '有正式租約且房東願提供房東確認書',
              '合租主承租人願為你當「次承租人」開此文件',
              '學生宿舍（自動可辦）',
            ],
          },
          {
            text: '不可辦戶籍的類型：',
            items: [
              'Airbnb 或短租平台（即使住幾個月，房東不會開文件）',
              '短期轉租中，主承租人不在，沒人開文件',
              '合租內非法轉租（主承租人向房東隱瞞）',
              '有些青年旅館',
            ],
          },
          {
            text: '簽約前一定要問：',
            items: [
              '「你會幫我開房東確認書嗎？」',
              '「多久內可以開好？」（通常 1-2 週）',
              '若是合租，「主承租人是誰？他同意我當次承租人嗎？」',
            ],
          },
          {
            text: '為什麼重要：',
            items: [
              '沒辦戶籍 → 開不了銀行帳戶',
              '沒辦戶籍 → 辦不了保險，尤其公保',
              '沒辦戶籍 → 拿不到稅號',
              '沒辦戶籍 → 無法辦圖書館證、學生福利',
              '沒辦戶籍 → 無法申請居留許可',
            ],
          },
        ],
        common_mistakes: [
          '短期 Airbnb 住了兩個月 · 才發現無法辦戶籍',
          '簽了合租才發現主承租人不願共擔責任',
          '以為所有租約都能辦戶籍 · 沒事先問',
        ],
        official_sources: [
          { name: 'Meldegesetz 戶籍法概覽', url: 'https://www.bmi.bund.de/' },
        ],
      },
    },
    {
      step: 4,
      title_zh: '戶籍登記',
      title_de: 'Anmeldung',
      meta: { location: 'Bürgeramt', timing: '落地後 14 天內', docs_count: 4, priority: 'required' },
      outcome: ['開銀行帳戶 · 辦保險 · 取得稅號'],
      detail: {
        documents: [
          '護照',
          '租約',
          '房東確認書',
          '戶籍登記表單(現場填寫 · 或先線上下載)',
        ],
        procedure: [
          '線上預約 Bürgeramt 辦理時段(大城市需 2-4 週前預約)',
          '準時到場 · 帶齊文件',
          '簽名並繳表格',
          '收戶籍證明 · 妥善保存',
        ],
        common_mistakes: [
          '柏林 · 慕尼黑辦理時段難搶 · 落地前一週就要開始盯',
          '資料填錯地址(未來所有事都會出錯)',
          '戶籍證明遺失 · 重辦需錢和時間',
        ],
        official_sources: [
          { name: 'Berlin Bürgeramt', url: 'https://service.berlin.de/dienstleistung/120686/' },
          { name: 'München Bürgerbüro', url: 'https://muenchen.de/de/rathaus/verwaltung/kreisverwaltungsreferat/buergerbuero' },
        ],
      },
    },
    {
      step: 5,
      title_zh: '個人銀行帳戶',
      title_de: 'Girokonto',
      meta: { timing: '有戶籍證明後', priority: 'required' },
      outcome: ['接收薪水 / 獎學金 · 繳費 · 接收限制提領帳戶撥款'],
      detail: {
        documents: ['護照', '戶籍證明', '學生證(若已有)'],
        procedure: [
          '傳統銀行(Sparkasse · Deutsche Bank · Commerzbank):預約時段 · 現場辦理',
          '手機銀行(N26 · Revolut · Vivid):App 開戶 · 5 分鐘完成',
          '建議:手機銀行為主帳戶(收限制提領帳戶撥款 · 日常花費) · 傳統銀行為備用(現金業務 · 部分房東要求)',
        ],
        common_mistakes: [
          '只開手機銀行帳戶 · 遇到房東要求本地 IBAN 才發現不夠',
          'SCHUFA 剛到德國無紀錄可能被拒 · 改用手機銀行繞過',
        ],
        official_sources: [
          { name: 'N26', url: 'https://n26.com/' },
          { name: 'Sparkasse', url: 'https://www.sparkasse.de/' },
        ],
      },
    },
    {
      step: 6,
      title_zh: '健康保險',
      title_de: 'Krankenversicherung',
      meta: { timing: '有戶籍證明後', priority: 'required' },
      outcome: ['滿足居留申請要件 · 就醫可用'],
      detail: {
        documents: ['戶籍證明', '護照', '學生身分證明'],
        procedure: [
          '語校生 · 職訓生:續用出發前買的私保',
          '正式大學生(有正式學籍):TK / AOK / Barmer 等公保 · 約 €120/月',
          '收保單作為之後居留申請文件',
        ],
        common_mistakes: [
          '語校期間強行加入公保被拒(僅正式大學生才可)',
          '保單有效期未涵蓋居留申請的時間',
        ],
        official_sources: [
          { name: 'TK 公保', url: 'https://www.tk.de/' },
          { name: 'AOK 公保', url: 'https://www.aok.de/' },
        ],
      },
    },
    {
      step: 7,
      title_zh: '取得稅號',
      title_de: 'Steueridentifikationsnummer',
      meta: { timing: '戶籍登記後自動寄送', priority: 'required' },
      outcome: ['開始工作或報稅'],
      detail: {
        documents: [],
        procedure: [
          '戶籍登記完成後 · 稅務局會於 3-6 週內寄稅號到你的地址',
          '若一直未收到 · 可寫信給稅務局索取',
        ],
        common_mistakes: [
          '戶籍登記地址錯 · 稅號沒收到',
          '未妥善保管稅號 · 之後找工作找不到',
        ],
        official_sources: [
          { name: 'Bundeszentralamt für Steuern', url: 'https://www.bzst.de/' },
        ],
      },
    },
    {
      step: 8,
      title_zh: 'SIM 卡',
      title_de: 'Mobilfunk',
      meta: { timing: '有帳戶後', priority: 'recommended' },
      outcome: ['本地電話號碼 · 收德國銀行/官方簡訊'],
      detail: {
        documents: ['護照(預付卡)', '銀行帳戶 + SCHUFA(後付)'],
        procedure: [
          '預付卡:Aldi Talk / Lidl Connect / Callya · 超市買 · €10-20/月',
          '後付:O2 / Vodafone / Telekom · 綁 24 個月合約',
          '建議:先用預付卡 · 住定後再考慮後付',
        ],
        common_mistakes: [
          '一到德國就簽 24 個月合約 · 之後搬走無法解約',
          '不知道預付卡也可以 · 浪費錢',
        ],
        official_sources: [
          { name: 'Aldi Talk', url: 'https://www.alditalk.de/' },
        ],
      },
    },
    {
      step: 9,
      title_zh: '電視稅登記',
      title_de: 'Rundfunkbeitrag',
      meta: { timing: '住定 2 週內會自動收到通知', priority: 'required' },
      outcome: ['避免罰款 · 合規'],
      detail: {
        documents: ['戶籍證明'],
        procedure: [
          '到 rundfunkbeitrag.de 註冊',
          '每戶每月 €18.36(2024/25)',
          '一戶只需一人繳',
        ],
        common_mistakes: [
          '以為學生免除(其實不能)',
          '同住每人都繳(重複繳費)',
        ],
        official_sources: [
          { name: 'Rundfunkbeitrag', url: 'https://www.rundfunkbeitrag.de/' },
        ],
      },
    },
  ],
  general_notes: [
    '各邦 Bürgeramt 執行細節與費用略有差異 · 正式辦理前請查詢所在邦官方公告',
    '押金糾紛極常見 · 保留所有付款憑證',
    '找房時多方比對租金水平 · 避免被超收',
  ],
};
