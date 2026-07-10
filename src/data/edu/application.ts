import type { WorkflowTopic } from './workflow';

export const applicationWorkflow: WorkflowTopic = {
  slug: 'application',
  title: '學程申請',
  subtitle: 'Studienkolleg · 學士 · 碩士 · 博士',
  description:
    '四大路徑:學院預備班 · 學士 · 碩士 · 博士。時程差異大 · 越早規劃越好。',
  steps: [
    {
      step: 1,
      title_zh: '確認申請路徑與門檻',
      meta: { timing: '起點', priority: 'required' },
      outcome: ['選對路徑 · 避免走冤枉路'],
      detail: {
        documents: [],
        procedure: [
          {
            text: '基本學歷分流：',
            items: [
              '高中畢業無大學學歷 → Studienkolleg（學院預備班）+ FSP 結業考',
              '大學讀一年以上 → 直接申請學士',
              '大學畢業 → 碩士',
              '碩士畢業 → 博士',
            ],
          },
          {
            text: '成績要求（依學程而異，以下為常見範圍）：',
            items: [
              'Studienkolleg：高中畢業，部分要求 GPA 3.0+（4.0 制）',
              '學士（直接申請）：台灣 GPA 3.0+ 或大學一年，部分頂尖需 3.5+',
              '碩士：台灣 GPA 3.0+（4.0 制）為門檻，名校要求 3.5+',
              'MBA / 頂尖商學院：GPA 3.5+，工作經驗 3-5 年，GMAT 700+',
              '博士：研究方向明確，有教授願指導，GPA 3.5+',
            ],
          },
          {
            text: '語言門檻：',
            items: [
              '德文授課：DSH-2 / TestDaF 4×4 / telc C1 Hochschule',
              '英文授課：IELTS 6.5+ / TOEFL 90+',
              '頂尖學程可能要求更高',
            ],
          },
        ],
        common_mistakes: [
          '學歷未達門檻卻直接申請大學(拒信直接來)',
          '成績未達門檻卻申請頂尖學校 · 沒補救方案',
          '低估語言要求 · 申請通過但註冊時被要求先修語言',
        ],
        official_sources: [
          { name: 'DAAD 課程搜尋', url: 'https://www.daad.de/en/studying-in-germany/' },
          { name: 'uni-assist', url: 'https://www.uni-assist.de/' },
        ],
      },
    },
    {
      step: 2,
      title_zh: '確認學歷認證需求',
      meta: { docs_count: 3, priority: 'required' },
      outcome: ['確認需否辦理額外認證'],
      detail: {
        documents: [
          '護照',
          '學位證 + 成績單',
          '身分證明(僅需 APS 者需要)',
        ],
        procedure: [
          '⚠️ 重要：台灣學生一般不需要 APS（學歷審核處）審核',
          'APS 主要是針對在中國大陸地區受教育的學生，驗證學歷與成績真實性',
          {
            text: '一般台灣學生的正規流程：',
            items: [
              '準備學位證中英文正本 + 影本',
              '準備成績單中英文正本 + 影本',
              '由駐台辦事處或公證單位公證',
              '直接於 uni-assist 或大學遞件',
            ],
          },
          {
            text: '需要進行 APS 的例外情況：',
            items: [
              '台灣人但在中國大陸的大學就讀或畢業',
              '少數學校誤將台灣學歷歸類為中國學歷，要求補件 → 這時可向校方說明台灣學歷不需要 APS，附上參考連結',
            ],
          },
          '澳門 · 香港學生的情況相似 · 但有各自的細則 · 請洽在台辦事處',
        ],
        common_mistakes: [
          '誤以為所有華人學生都需要 APS · 白花時間錢財',
          '學校誤要 APS 時不敢據理力爭',
          '同時擁有台灣與中國大陸學歷 · 沒說清楚',
        ],
        official_sources: [
          { name: 'APS 說明 · 台灣學生豁免', url: 'https://www.aps.org.cn/zh/studium-in-deutschland/nicht-chinesische-zeugnisse-und-leistungsnachweise' },
        ],
      },
    },
    {
      step: 3,
      title_zh: '達到語言門檻',
      meta: { timing: '申請截止前 3-6 個月完成', priority: 'required' },
      outcome: ['滿足入學語言要求'],
      detail: {
        documents: ['語言證書'],
        procedure: [
          '德文授課:DSH-2 / TestDaF 4×4 / telc C1 Hochschule 三選一',
          '英文授課:IELTS 6.5+ / TOEFL 90+',
          '部分課程要求德+英雙語',
          '考試日期:提前 2-3 個月報名(尤其 TestDaF)',
        ],
        common_mistakes: [
          '想著「先申請再考」(多數學程要求申請時已有證書)',
          'DSH 只有目標學校承認 · TestDaF 較通用',
        ],
        official_sources: [
          { name: 'TestDaF 官方', url: 'https://www.testdaf.de/' },
          { name: 'telc 官方', url: 'https://www.telc.net/' },
        ],
      },
    },
    {
      step: 4,
      title_zh: '選校 + 準備文件',
      meta: { timing: '截止前 3 個月', docs_count: 8, priority: 'required' },
      outcome: ['申請包完整'],
      detail: {
        documents: [
          '護照',
          '學位證書 + 成績單',
          '語言證書',
          '履歷(英/德)',
          '動機信(英/德)',
          '推薦信 2-3 封',
          '身分證明',
          '其他學程要求(作品集/研究計畫等)',
        ],
        procedure: [
          '在 DAAD/uni-assist 搜索目標學程',
          '確認申請截止(多數冬季學期 7 月中)',
          '準備各校要求的獨特文件',
          '動機信客製化每所學校',
        ],
        common_mistakes: [
          '所有學校用同一份動機信(招生官看得出來)',
          '推薦信找不熟教授寫(內容空泛)',
        ],
        official_sources: [
          { name: 'DAAD 課程資料庫', url: 'https://www2.daad.de/deutschland/studienangebote/international-programmes/en/' },
        ],
      },
    },
    {
      step: 5,
      title_zh: '透過 uni-assist 遞件',
      meta: { location: 'uni-assist.de', priority: 'required' },
      outcome: ['申請進入審核'],
      detail: {
        documents: ['STEP 4 所有文件'],
        procedure: [
          '註冊 uni-assist 帳號',
          '選擇學校與學程',
          '上傳所有文件',
          '繳費(每個學程 €75)',
          '寄實體副本到 uni-assist',
          '等 uni-assist 初審 → 轉學校',
        ],
        common_mistakes: [
          '文件掃描品質差被要求重上傳',
          '截止日前才動作 · 來不及寄實體件',
        ],
        official_sources: [
          { name: 'uni-assist', url: 'https://www.uni-assist.de/' },
        ],
      },
    },
    {
      step: 6,
      title_zh: '面試(部分學程)',
      meta: { timing: '收到通知後', priority: 'recommended' },
      outcome: ['最後篩選階段'],
      detail: {
        documents: [],
        procedure: [
          'MBA/國際碩士常有 Zoom 面試',
          '準備動機信重點',
          '對學程與教授研究背景做功課',
          '準備自問問題',
        ],
        common_mistakes: [
          '沒對學程做功課(問超基本問題)',
          '面試答太空泛',
        ],
        official_sources: [],
      },
    },
    {
      step: 7,
      title_zh: '收 Zulassung + 註冊',
      meta: { timing: '8-9 月', priority: 'required' },
      outcome: ['正式取得學生身分'],
      detail: {
        documents: ['錄取通知(Zulassungsbescheid)', '學費/學期費匯款'],
        procedure: [
          '收多所錄取後選一',
          '按時繳學期費(€150-350)',
          '完成 Immatrikulation(正式註冊)',
          '收學生證 + Semesterticket',
        ],
        common_mistakes: [
          '錯過註冊截止 → 位置作廢',
          '未確認住宿就選校(大城市住宿極缺)',
        ],
        official_sources: [],
      },
    },
  ],
  general_notes: [
    'uni-assist 為多數學校統一遞件平台 · 少數學校自辦',
    '各校招生辦要求略有差異 · 最終以目標校官網為準',
    '冬季學期截止多在 7 月中 · 夏季學期截止多在 1 月中',
  ],
};
