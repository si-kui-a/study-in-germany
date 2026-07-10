import type { WorkflowTopic } from './workflow';

export const exitWorkflow: WorkflowTopic = {
  slug: 'exit',
  title: '離開指南',
  subtitle: 'Abmeldung · 稅務 · 帳戶 · 保險',
  description:
    '離開德國前必做清單。跳過任何一項可能導致帳單追討 · 稅務未結 · 或返德再申請時受阻。此清單按時間順序排列。',
  steps: [
    {
      step: 1,
      title_zh: '通知移民局',
      title_de: 'Ausländerbehörde 通知',
      meta: { timing: '離境前 4-8 週', priority: 'required' },
      outcome: ['明確結束你的居留身分 · 避免未來申請受阻'],
      detail: {
        documents: ['護照', '現行居留卡'],
        procedure: [
          '線上或電話預約 Termin',
          '或直接寫信通知離境日期',
          '拿到離境通知確認書',
          '交回居留卡(若被要求)',
        ],
        common_mistakes: [
          '不通知就走 · 未來再申請時被視為「隱瞞」',
          '離境通知寫錯日期 · 影響帳單結算',
        ],
        official_sources: [
          { name: 'Berlin Ausländerbehörde', url: 'https://www.berlin.de/einwanderung/' },
        ],
      },
      references: [
        'Berlin Ausländerbehörde 官方資訊',
      ],
      updated_at: '2024-01',
    },
    {
      step: 2,
      title_zh: '註銷戶籍',
      title_de: 'Abmeldung',
      meta: { location: 'Bürgeramt', timing: '離境前 2 週內', priority: 'required' },
      outcome: ['正式移除德國戶籍 · 停止電視稅等自動計費'],
      detail: {
        documents: [
          '護照',
          '離境通知(新地址或離境國)',
        ],
        procedure: [
          '線上或現場 Termin',
          '填 Abmeldung 表',
          '需提供未來地址(可以是台灣地址)',
          '收 Abmeldebescheinigung(註銷證明)',
          '妥善保存 · 未來稅務結算或申請福利可能用到',
        ],
        common_mistakes: [
          '拖到最後一天才註銷 · 因 Termin 難搶而延誤',
          '未通知電視稅單位 · 結果離境後仍收帳單',
          'Abmeldebescheinigung 遺失 · 未來查核困難',
        ],
        official_sources: [
          { name: 'Berlin Abmeldung', url: 'https://service.berlin.de/dienstleistung/120336/' },
        ],
      },
      references: [
        'Berlin Abmeldung 官方資訊',
      ],
      updated_at: '2024-01',
    },
    {
      step: 3,
      title_zh: '解除電視稅',
      title_de: 'Rundfunkbeitrag 註銷',
      meta: { timing: '同 Abmeldung 時', priority: 'required' },
      outcome: ['停止每月自動扣款 · 避免累積欠費'],
      detail: {
        documents: ['Abmeldebescheinigung'],
        procedure: [
          '到 rundfunkbeitrag.de 線上註銷',
          '或寄信通知 · 附註銷證明',
          '確認收到停止通知',
        ],
        common_mistakes: [
          '以為 Abmeldung 就會自動停 · 其實需另通知',
          '解除後仍收到帳單 · 未追蹤處理',
        ],
        official_sources: [
          { name: 'Rundfunkbeitrag · 註銷', url: 'https://www.rundfunkbeitrag.de/' },
        ],
      },
      references: [
        'Rundfunkbeitrag · 註銷 官方資訊',
      ],
      updated_at: '2024-01',
    },
    {
      step: 4,
      title_zh: '解除保險',
      title_de: 'Krankenversicherung 註銷',
      meta: { timing: '離境前 1 個月', priority: 'required' },
      outcome: ['停止保費扣款 · 保留帳戶紀錄'],
      detail: {
        documents: ['Abmeldebescheinigung', '身分證明'],
        procedure: [
          '寫信給保險公司說明離境',
          '附 Abmeldebescheinigung 副本',
          '公保:立即停止扣款',
          '私保:通常需書面通知 · 部分需付一個月',
          '收保單註銷確認',
        ],
        common_mistakes: [
          '沒通知就走 · 保費繼續扣',
          '沒收確認函 · 未來查核紀錄有問題',
        ],
        official_sources: [
          { name: 'TK 註銷保單', url: 'https://www.tk.de/' },
        ],
      },
      references: [
        'TK 註銷保單 官方資訊',
      ],
      updated_at: '2024-01',
    },
    {
      step: 5,
      title_zh: '關閉帳戶',
      title_de: 'Bankkonto 關閉',
      meta: { timing: '離境前 2-3 週', priority: 'required' },
      outcome: ['取回帳戶餘額 · 結清所有交易'],
      detail: {
        documents: ['護照', '身分證明'],
        procedure: [
          '結清所有 auto-debit 授權',
          '把餘額轉出到台灣帳戶',
          '通知帳戶關閉(可能需現場辦理)',
          '收關閉確認',
          '⚠️ Neobank(N26 等):可線上關閉 · 但要確認所有 Direct Debit 都取消',
          '⚠️ 傳統銀行:多需 Termin · 現場辦理',
        ],
        common_mistakes: [
          '關閉後才發現有未結交易 · 帳戶被凍結',
          '沒取消 Direct Debit · 關閉後被收費追討',
          'Neobank 關閉時忘記記錄未來查詢用資訊',
        ],
        official_sources: [
          { name: 'N26 關閉指南', url: 'https://n26.com/' },
        ],
      },
      references: [
        'N26 關閉指南 官方資訊',
      ],
      updated_at: '2024-01',
    },
    {
      step: 6,
      title_zh: '取回限制提領帳戶餘款',
      title_de: 'Sperrkonto 提領',
      meta: { timing: '離境前 1-2 週', priority: 'required' },
      outcome: ['取回剩餘的限制提領帳戶款項'],
      detail: {
        documents: ['護照', 'Abmeldebescheinigung', '限制提領帳戶開戶證明'],
        procedure: [
          '通知限制提領帳戶服務商離境',
          '提供離境確認書',
          '要求提前解除提領限制',
          '確認轉帳到你的台灣或其他國家帳戶',
          '有時可能需付手續費',
          '確保帳戶清空',
        ],
        common_mistakes: [
          '忘了限制提領帳戶有餘額 · 離開後才發現',
          '沒解除提領限制 · 錢卡在帳戶',
          '轉帳資訊填錯',
        ],
        official_sources: [
          { name: 'Fintiba 離境', url: 'https://www.fintiba.com/' },
        ],
      },
      references: [
        'Fintiba 離境 官方資訊',
      ],
      updated_at: '2024-01',
    },
    {
      step: 7,
      title_zh: '稅務結算',
      title_de: 'Einkommensteuer 結算',
      meta: { timing: '離境前後皆可(最多 4 年內)', priority: 'recommended' },
      outcome: ['取回可退稅款 · 避免未來稽核'],
      detail: {
        documents: [
          '所有工資單(Lohnsteuerbescheinigung)',
          '所有收據 · 可扣抵費用',
          '保險保單',
          '子女相關文件(若有)',
        ],
        procedure: [
          '登入 ELSTER 線上申報',
          '或委託稅務顧問(離境者常見選擇)',
          '準備所有票據',
          {
            text: '可扣抵費用：',
            items: [
              '工作相關花費',
              '教育費用',
              '私人保險',
              '慈善捐款',
            ],
          },
          '結算通常 4-8 週處理',
          '退稅款直接匯到指定帳戶',
        ],
        common_mistakes: [
          '沒申報 · 損失可能的退稅',
          '收據丟了 · 無法扣抵',
          '離開太久才申報(超過 4 年就過期)',
        ],
        official_sources: [
          { name: 'ELSTER 稅務系統', url: 'https://www.elster.de/' },
        ],
      },
      references: [
        'ELSTER 稅務系統 官方資訊',
      ],
      updated_at: '2024-01',
    },
    {
      step: 8,
      title_zh: '解除電信 · SIM 卡',
      title_de: 'Handyvertrag 註銷',
      meta: { timing: '離境前', priority: 'required' },
      outcome: ['停止月費扣款'],
      detail: {
        documents: [],
        procedure: [
          {
            text: '後付合約：',
            items: [
              '需書面通知（信件或 App 內註銷）',
              '通常需要 3 個月前通知',
              '剩餘合約期需付完',
            ],
          },
          {
            text: '預付卡：',
            items: [
              '直接停用即可',
              '可留下號碼 12 個月備用（部分營運商）',
            ],
          },
        ],
        common_mistakes: [
          '合約沒解除 · 未來仍收費',
          '沒提前 3 個月通知 · 得付懲罰性費用',
        ],
        official_sources: [
          { name: 'O2 解約流程', url: 'https://www.o2.de/' },
        ],
      },
      references: [
        'O2 解約流程 官方資訊',
      ],
      updated_at: '2024-01',
    },
    {
      step: 9,
      title_zh: '整理教育文件',
      meta: { timing: '離境前 · 未來重要', priority: 'recommended' },
      outcome: ['未來申請學位認證/工作認證備用'],
      detail: {
        documents: [
          '所有學位證書',
          '所有成績單',
          '所有語言證書',
          '教授推薦信',
          '德文/英文翻譯本',
        ],
        procedure: [
          '確認所有文件已取得',
          '製作影本 + 電子檔備份',
          '若需要 · 進行認證翻譯(Beglaubigte Übersetzung)',
          '未來申請德國工作 · 學位認證可能需要這些',
        ],
        common_mistakes: [
          '離開後才發現學位證書沒到 · 從國外催更困難',
          '重要教授推薦信只有紙本 · 沒備份',
          '成績單只有德文版 · 未來在台灣申請困難',
        ],
        official_sources: [],
      },
      references: [],
      updated_at: '2024-01',
    },
  ],
  general_notes: [
    '離開流程建議至少提前 4-8 週開始 · 部分事項時間敏感',
    '若可能再回德國讀書 / 工作 · 建議所有註銷保存確認函 · 未來申請時是重要文件',
    '若有稅務未結 · 可能影響返德續學 / 申請永居',
  ],
};
