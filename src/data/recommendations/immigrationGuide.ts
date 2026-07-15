/**
 * Phase AT · 加油站「外事局」通用應對指南
 *
 * 跨城市通用知識，非城市連結清單（城市連結見 immigration.json）。
 * 全部文字內容照抄 Phase AT 指令書提供的白名單來源整理稿，不得增添未列事實。
 * 連結僅限指令書 §2 白名單 8 條，見 IMMIGRATION_GUIDE_LINKS，見 PAT-149。
 * Phase AT.c：§2 擴充 §2a/§2b/§2c，內容逐字依 Lily 查證回覆的三張表填入，
 * 事實範圍不超過三張表本身，見 PAT-151。
 */

export interface ImmigrationGuideLink {
  label: string;
  url: string;
}

export type GuideBlock =
  | { type: 'ordered'; items: string[] }
  | { type: 'unordered'; items: string[] }
  | { type: 'subheading'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'callout'; text: string };

export interface ImmigrationGuideSection {
  id: string;
  title: string;
  blocks: GuideBlock[];
}

export const IMMIGRATION_GUIDE_TITLE = '外事局通用應對指南（跨城市適用）';

export const IMMIGRATION_GUIDE_INTRO =
  '各城市外事局（Ausländerbehörde）流程細節不同，但卡關的原因高度一致：預約、文件、期限、地址、保險、財力、語言。以下原則跨城市通用。';

export const IMMIGRATION_GUIDE_VERIFIED_DATE = '2026-07-15';

export const IMMIGRATION_GUIDE_SECTIONS: ImmigrationGuideSection[] = [
  {
    id: 'principles',
    title: '§1 四條自保原則',
    blocks: [
      {
        type: 'ordered',
        items: [
          '**先送件**——居留到期「前」正式提出申請，是一切延續效力的前提（居留法 §81 AufenthG）。',
          '**留證據**——Email、掛號信收據、線上表單截圖、預約確認，每一次接觸都留書面紀錄。口頭詢問不算申請。',
          '**帶齊文件**——依官方清單逐項備原件＋影本；非德文文件附德文譯本。',
          '**期限不空窗**——建議到期前 8–12 週開始行動；熱門城市預約提前 2–3 個月。',
        ],
      },
    ],
  },
  {
    id: 'deadline-fiktion',
    title: '§2 期限與 Fiktionsbescheinigung',
    blocks: [
      {
        type: 'unordered',
        items: [
          '到期前已正式送件：多數情況原居留效力可暫時延續，外事局可核發 Fiktionsbescheinigung（臨時證明）證明審理期間合法停留。',
          '核發前提：有效護照＋已正式提出的居留申請。只是詢問過、預約過，不構成申請。',
          '**Fiktionsbescheinigung 不是萬用旅行證件**：能否出境後再入境，取決於證明類型與註記，出國前務必逐字確認證件內容（漢堡官方明確提醒部分臨時證明不足以再入境）。',
          '到期後才送件：延續效力通常不成立，風險自負。',
        ],
      },
      // Phase AT.c · §2a 申請成立要件與應取得文件（來源：柏林官方，PAT-151）
      { type: 'subheading', text: '§2a 申請成立要件與應取得文件' },
      {
        type: 'table',
        headers: ['層次', '內容'],
        rows: [
          [
            '成立三要件',
            '到期前送達＋管轄外事局＋正式申請（官方線上表單／簽名書面申請表／親送）。詢問、Email、預約確認都不是申請。',
          ],
          [
            '該收到①送件證據',
            '線上表單確認信／掛號回執／收件確認（Eingangsbestätigung）——延續效力由「及時送達」觸發，這是你唯一能自證的東西。',
          ],
          [
            '該收到②審理期文件',
            'Fiktionsbescheinigung 本體。柏林流程：親自面談後核發，須有效護照＋Anmeldung，規費成人 13 €（柏林值，各城市或異）；該證明僅與有效護照併用才有效。',
          ],
          [
            '例外',
            '持申根短期簽（C 類）入境者：不核發 Fiktion。',
          ],
        ],
      },
      // Phase AT.c · §2b Abs.3/Abs.4 再入境對照表（來源：漢堡官方，PAT-151）
      { type: 'subheading', text: '§2b Abs.3/Abs.4 再入境對照表' },
      {
        type: 'table',
        headers: ['證明上註記', '對應情境', '出境後可否再入境'],
        rows: [
          ['§81 Abs. 4', '原持有效居留或 D 簽，到期前送件', '可，但返德當下該證明本身須仍在效期內'],
          [
            '§81 Abs. 3',
            '免簽入境後在境內首次申請（台灣護照典型情境）',
            '不可再入境，亦不得開始新工作／新學業。唯一例外：免簽 90 天額度未用完者可依免簽身分入境',
          ],
          ['申根 C 簽入境', '—', '根本不核發 Fiktion'],
        ],
      },
      {
        type: 'callout',
        text: '出國前逐字確認證明上勾選的是 Abs. 3 還是 Abs. 4，這一個勾決定你回不回得來。',
      },
      // Phase AT.c · §2c 送件底線＋建議值（PAT-151）
      { type: 'subheading', text: '§2c 送件底線' },
      {
        type: 'unordered',
        items: ['法定底線：到期日「前」送達即成立——踩線日有效，但零緩衝、零補救空間。'],
      },
      { type: 'callout', text: '本站建議，非官方期限' },
      {
        type: 'unordered',
        items: [
          '最遲到期前 4 週送出可留證據的申請',
          '8–12 週開始備件',
          '熱門城市預約提前 2–3 個月',
          '柏林官方明文「文件缺漏」是核發 Fiktion 的常見原因之一——佐證「先送件、後補件」優於「等備齊才送」',
        ],
      },
    ],
  },
  {
    id: 'documents',
    title: '§3 文件通則',
    blocks: [
      {
        type: 'unordered',
        items: [
          '文件一致性優先：姓名、地址、護照號、雇主名稱、薪資數字，所有文件互相對得上，比任何單一文件更重要。',
          '護照效期不足會直接縮短居留核發期；先換護照再辦居留，新舊護照一起帶。',
          '搬家先辦 Anmeldung，再更新外事局資料；地址錯誤＝通知收不到＝錯過補件期限。',
          '財力／保險證明用最新版本：公保附會員證明（Mitgliedsbescheinigung），私保附已繳費證明。',
          '工作／藍卡類：最終簽署版合約＋最近薪資單＋職務內容說明＋學歷認證；換雇主或職務變動需重交雇主確認文件。',
        ],
      },
    ],
  },
  {
    id: 'communication',
    title: '§4 溝通與追蹤',
    blocks: [
      {
        type: 'unordered',
        items: [
          '書面優先於電話：正式 Email 或掛號信有時間戳，是「已在期限內申請」的唯一有效證據。',
          '德語不夠用時：事前備妥德語書面摘要（案由＋訴求＋文件清單），必要時請大學國際處、雇主 HR 或懂德語者陪同。',
          '收到補件通知：當場或當日以書面確認補件項目與期限，避免聽漏。',
        ],
      },
    ],
  },
  {
    id: 'emergency',
    title: '§5 緊急狀況',
    blocks: [
      { type: 'subheading', text: 'eAT 居留卡遺失：' },
      {
        type: 'ordered',
        items: [
          '立即向外事局報失（部分城市有專門線上報失管道）',
          '若已啟用線上身分功能（eID），同步申請封鎖',
          '備妥遺失經過說明、護照、舊卡影本，有警方報案證明更佳',
          '補發需時數週，期間可申請臨時證明維持身分',
          '找回原卡必須繳回，不得兩卡並用',
        ],
      },
      { type: 'subheading', text: '居留已過期：' },
      {
        type: 'unordered',
        items: [
          '到期前已送件 → 立即確認外事局已收件，保全所有送件證據',
          '未送件 → 立即聯絡外事局、大學國際處或雇主，不要拖',
          '想出境 → **先不要走**。先確認能否取得臨時證明或離境文件；已逾期出境者，返德可能在入境端卡關，程序常需重來。',
        ],
      },
    ],
  },
];

export const IMMIGRATION_GUIDE_LINKS: ImmigrationGuideLink[] = [
  {
    label: '居留法 §81 原文（延續效力法源）',
    url: 'https://www.gesetze-im-internet.de/aufenthg_2004/__81.html',
  },
  {
    label: 'Fiktionsbescheinigung 說明（柏林）',
    url: 'https://service.berlin.de/dienstleistung/326233/en/',
  },
  {
    label: '學生居留文件清單（柏林）',
    url: 'https://service.berlin.de/dienstleistung/305244/en/',
  },
  {
    label: 'eAT 遺失處理（慕尼黑，中文）',
    url: 'https://stadt.muenchen.de/service/zh-CN/info/schnellschalter/10497977/',
  },
  {
    label: 'eAT 使用手冊（德勒斯登，中文 PDF）',
    url: 'https://www.dresden.de/media/pdf/einwohner/Infobroschuere_eAT_chinesisch.pdf',
  },
  {
    label: 'Fiktionsbescheinigung 與再入境限制（漢堡）',
    url: 'https://welcome.hamburg.com/entry-and-residence/general-information/fiktionsbescheinigung-probationary-residence-permit-17554',
  },
  {
    label: '歐盟藍卡文件自檢表（聯邦移民服務入口，PDF）',
    url: 'https://www.serviceportal-migration-deutschland.de/fileadmin/PROD/03_Blaue_Karte/Checklist_EU_Blue_Card_EN_barrierefrei.pdf',
  },
  {
    label: '學生居留 §16b 辦理說明（Essen WSC）',
    url: 'https://service.essen.de/detail/-/vr-bis-detail/dienstleistung/5242914/show',
  },
];
