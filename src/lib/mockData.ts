import type { Listing, SchoolReview, ListingType } from './types';

/** 開發用假資料。生產 build 走 supabase 真實查詢，本檔不會被 import（tree-shake 於 MOCK_MODE=false 時移除使用點）。 */

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';
const MOCK_USER_ID_2 = '00000000-0000-0000-0000-000000000002';

export const MOCK_REVIEWS: SchoolReview[] = [
  {
    id: 1,
    school_id: 'goethe-berlin',
    user_id: MOCK_USER_ID,
    stars: { overall: 4, teaching: 5, environment: 3 },
    comment_text: 'A2 課程老師很好，教材偏舊。校舍在市中心交通方便，但空間偏小，午休沒地方吃飯。',
    created_at: '2026-06-15T10:00:00Z',
    profile: {
      id: MOCK_USER_ID,
      display_name: '柏林小妹',
      avatar_url: null,
      created_at: '2026-01-01T00:00:00Z',
    },
  },
  {
    id: 2,
    school_id: 'goethe-berlin',
    user_id: MOCK_USER_ID_2,
    stars: { overall: 3, teaching: 3, environment: 4 },
    comment_text: '課程結構還算完整，但班上人數偏多（15+ 人），每個人發言機會不多。',
    created_at: '2026-05-20T14:30:00Z',
    profile: {
      id: MOCK_USER_ID_2,
      display_name: 'Anna',
      avatar_url: null,
      created_at: '2026-02-01T00:00:00Z',
    },
  },
  {
    id: 3,
    school_id: 'did-frankfurt',
    user_id: MOCK_USER_ID,
    stars: { overall: 5, teaching: 5, environment: 5 },
    comment_text: '貴但值得。B2 課程準備 TestDaF 完全對點，老師都是母語者且有教學執照。',
    created_at: '2026-06-01T09:00:00Z',
    profile: {
      id: MOCK_USER_ID,
      display_name: '柏林小妹',
      avatar_url: null,
      created_at: '2026-01-01T00:00:00Z',
    },
  },
];

export const MOCK_LISTINGS: Listing[] = [
  {
    id: 1,
    user_id: MOCK_USER_ID,
    type: 'rental_offer' as ListingType,
    region: 'Berlin-Neukölln',
    title: 'WG-Zimmer 出租，可短租 3 個月',
    description: '4 人 WG，房間 12 平米附家具。近 U8 Boddinstraße，走路 5 分鐘。押金 2 個月，可協商。',
    price: '€480 warm',
    contact_info: 'Telegram @mock_user_1',
    photo_urls: [],
    expires_at: '2026-09-06T00:00:00Z',
    created_at: '2026-07-07T12:00:00Z',
    profile: null,
  },
  {
    id: 2,
    user_id: MOCK_USER_ID_2,
    type: 'rental_seek' as ListingType,
    region: 'München',
    title: '9 月起找單間套房，預算 €700 內',
    description: '女性台灣人在讀 Sprachcaffe。作息正常無寵物。希望簽 6 個月以上。',
    price: '€700 max',
    contact_info: 'wechat: mock_anna',
    photo_urls: [],
    expires_at: '2026-09-06T00:00:00Z',
    created_at: '2026-07-06T18:20:00Z',
    profile: null,
  },
  {
    id: 3,
    user_id: MOCK_USER_ID,
    type: 'secondhand' as ListingType,
    region: 'Frankfurt',
    title: 'IKEA MALM 書桌 + 檯燈，€25 一起',
    description: '搬家出清。書桌白色 140x65 cm，狀況良好，僅使用 8 個月。檯燈可調光。',
    price: '€25',
    contact_info: 'mock@example.com',
    photo_urls: [],
    expires_at: '2026-09-05T00:00:00Z',
    created_at: '2026-07-05T20:00:00Z',
    profile: null,
  },
];
