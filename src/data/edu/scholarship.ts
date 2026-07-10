import type { WorkflowTopic } from './workflow';

export const scholarshipWorkflow: WorkflowTopic = {
  slug: 'scholarship',
  title: '獎學金',
  subtitle: 'DAAD · Erasmus · 教育部 · 各基金會',
  description:
    '德方與台灣方獎學金並行申請最保險。DAAD 覆蓋面最廣、教育部最豐厚、各基金會需符合價值觀。',
  steps: [
    {
      step: 1,
      title_zh: '確認申請時機',
      meta: { timing: '啟動點', priority: 'required' },
      outcome: ['不錯過截止日'],
      detail: {
        documents: [],
        procedure: [
          'DAAD 碩士：多為 9-10 月截止，次年 8-9 月開始',
          '教育部：每年 6-7 月報名、8 月筆試、10 月放榜',
          'Erasmus：從所屬大學申請，時程隨校',
          '基金會：多為秋季截止',
        ],
        common_mistakes: [
          '想申請卻先動大學申請（順序反了 → 時程被卡）',
          '看到「明年秋季」以為還遠 → 準備不足',
        ],
        official_sources: [
          { name: 'DAAD 獎學金資料庫', url: 'https://www2.daad.de/deutschland/stipendium/en/' },
          { name: '教育部學海計畫', url: 'https://www.edu.tw/' },
        ],
      },
      references: [
        'DAAD 獎學金資料庫 官方資訊',
        '教育部學海計畫 官方資訊',
      ],
      updated_at: '2024-01',
    },
    {
      step: 2,
      title_zh: '評估自己適合哪類',
      meta: { docs_count: 0, priority: 'required' },
      outcome: ['避免亂槍打鳥'],
      detail: {
        documents: [],
        procedure: [
          '學術成績優異 + 想獨立 → DAAD',
          '願意回台服務 5 年 → 教育部公費',
          '已在歐洲、想去德國交換 → Erasmus',
          '有明確政治/社會理念 → 基金會（Konrad-Adenauer/Böll/Ebert 等）',
          '進了德國大學 → 校內 Deutschlandstipendium（€300/月）',
        ],
        common_mistakes: [
          '同時申請多個立場衝突的基金會（面試被查出）',
          '不了解基金會理念就申請',
        ],
        official_sources: [],
      },
      references: [],
      updated_at: '2024-01',
    },
    {
      step: 3,
      title_zh: '準備 DAAD 申請',
      meta: { docs_count: 7, priority: 'recommended' },
      outcome: ['DAAD 申請包完整'],
      detail: {
        documents: [
          '護照',
          '履歷（德/英）',
          '動機信（1500-2500 字）',
          '推薦信 2 封',
          '學位證書 + 成績',
          '語言證書',
          '研究計畫（碩博必要）',
        ],
        procedure: [
          '進 DAAD Portal 註冊',
          '選定學程/研究方向',
          '寫具體研究計畫（不能太空泛）',
          '找推薦人 - 熟悉你研究的教授',
          '線上遞件 + 寄實體副本',
        ],
        common_mistakes: [
          '研究計畫沒與教授討論就送出（很容易被拒）',
          '動機信寫得太人生故事型',
        ],
        official_sources: [
          { name: 'DAAD 申請', url: 'https://www.daad.de/en/' },
        ],
      },
      references: [
        'DAAD 申請 官方資訊',
      ],
      updated_at: '2024-01',
    },
    {
      step: 4,
      title_zh: '準備教育部公費申請',
      meta: { docs_count: 8, priority: 'recommended' },
      outcome: ['台灣獎學金申請包完整'],
      detail: {
        documents: [
          '報名表',
          '學位證 + 成績',
          '英文/德文 履歷',
          '中文動機信',
          '推薦信 2 封',
          '語言證書',
          '身份證',
          '照片',
        ],
        procedure: [
          '教育部官網下載當年度簡章',
          '準備所需文件',
          '參加筆試（各領域一天）',
          '通過筆試進面試',
          '面試通過 + 體檢 → 拿獎學金',
        ],
        common_mistakes: [
          '沒讀當年簡章（每年可能改）',
          '筆試準備不足（範圍廣）',
        ],
        official_sources: [
          { name: '教育部公費留學', url: 'https://www.edu.tw/' },
        ],
      },
      references: [
        '教育部公費留學 官方資訊',
      ],
      updated_at: '2024-01',
    },
    {
      step: 5,
      title_zh: '面試準備',
      meta: { timing: '收面試邀請後', priority: 'recommended' },
      outcome: ['成功爭取獎學金'],
      detail: {
        documents: [],
        procedure: [
          'DAAD：以德/英文面試，內容環繞研究計畫',
          '教育部：以中文為主，內容包含時事與回國計畫',
          '基金會：可能涉及政黨/理念認同討論、社會議題',
          '準備 3-5 個熟悉的自問問題',
        ],
        common_mistakes: [
          '沒對面試官背景做功課',
          '答太理想化（面試官會質疑真實性）',
        ],
        official_sources: [],
      },
      references: [],
      updated_at: '2024-01',
    },
    {
      step: 6,
      title_zh: '收 offer + 決定',
      meta: { timing: '通常同時收多個結果', priority: 'required' },
      outcome: ['最終選定獎學金來源'],
      detail: {
        documents: [],
        procedure: [
          '收 offer 後有時效需回覆',
          '同時多個 offer：比較金額、綁定期、專案配合',
          '教育部需回台服務 5 年 → 若未來想留德要慎重',
          'DAAD 無回國義務',
        ],
        common_mistakes: [
          '拿了教育部後想在德國留下工作（違約需返還）',
          '沒理解各獎學金的稅務規則',
        ],
        official_sources: [],
      },
      references: [],
      updated_at: '2024-01',
    },
  ],
  general_notes: [
    '獎學金金額與截止日期每年可能調整。',
    '進了德國大學後可主動詢問系辦有無研究計畫獎學金。',
    '學術類獎學金（Studienstiftung 等）門檻極高、需教授強力推薦。',
  ],
};
