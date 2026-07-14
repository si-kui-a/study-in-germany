import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  IconBuildingArch,
  IconSpeakerphone,
  IconNotebook,
  IconStar,
  IconMessageQuestion,
  IconUserCircle,
  IconBell,
} from '@tabler/icons-react';
import HeroSection from '../components/HeroSection';
import Announcements from '../components/Announcements';
import HotSchoolsCarousel from '../components/HotSchoolsCarousel';
import OnboardingModal from '../components/OnboardingModal';
import { isOnboardingCompleted } from '../lib/onboarding';

/**
 * Phase AB：Portal 卡片圖示不再各自套用 module-* 識別色（Phase Y 的做法），
 * 統一固定為 text-brand-burgundy，脫離 module-edu/module-recommendation 等
 * 只該用於各自頁面內部語境的變數（PAT-119）。
 */
const PORTAL_ITEMS = [
  {
    to: '/schools', title: '語言學校', description: '查看語校資料、學生評價、學費資訊',
    Icon: IconBuildingArch,
  },
  {
    to: '/board', title: '生活佈告欄', description: '出租、求租、二手交易',
    Icon: IconSpeakerphone,
  },
  {
    to: '/edu', title: '作戰手冊', description: '簽證、落地、延簽、獎學金、政策',
    Icon: IconNotebook,
  },
  {
    to: '/recommendation', title: '推薦', description: '德國好物、方案、優惠',
    Icon: IconStar,
  },
  {
    to: '/faq', title: '常見問答', description: '簽證、健保、限制提領帳戶、生活疑問',
    Icon: IconMessageQuestion,
  },
  {
    to: '/board?view=mine&sub=posts', title: '我的資料', description: '管理自己的評價與貼文',
    Icon: IconUserCircle,
  },
];

/**
 * DS v4.1 Portal 首頁（B.1 Hero + B.2 Morandi 整合 · Phase G 擴為 6 卡）
 * Phase Y：Portal 卡片改用與 Edu Hub 一致的大圖示置中佈局（PAT-116）
 * Phase AB：Portal 圖示色彩統一為 brand-burgundy，不再各卡各自套用 module-* 識別色（PAT-119）
 * Phase AC：Portal 圖示造型統一為色塊為主、線條為輔（PAT-121，已於 Phase AH 淘汰）
 * Phase AF：卡片密度優化，響應式雙態佈局（手機橫向列表 / 桌面縮小版 grid），
 *   與 Recommendation.tsx、Edu.tsx 共用同一套 class 組合邏輯（PAT-126）
 * Phase AG：圖示與標題文字放大，消除卡片內部多餘留白（PAT-126 v2）
 * Phase AH：6 個手繪 SVG 圖示全數改用 Tabler Icons（`@tabler/icons-react`），
 *   直接以元件參照存於 PORTAL_ITEMS，不再需要獨立的 PortalRecommendationIcon.tsx
 *   分流檔案（PAT-122 終局版）
 * Phase AI：新增新手導覽 Modal（精簡版，僅階段選擇+收尾），首次造訪時自動彈出
 *   （PAT-127）
 * 結構：Hero 天際線 → Portal (6 卡) → 熱門語校 → 最新公告
 */
export default function Home() {
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    if (!isOnboardingCompleted()) {
      setOnboardingOpen(true);
    }
  }, []);

  return (
    <div className="space-y-20 sm:space-y-24">
      <HeroSection />

      {/* Portal */}
      <section>
        <div className="text-xs text-content-muted mb-4 uppercase tracking-wider">Portal</div>
        <div className="flex flex-col gap-2 sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-3">
          {PORTAL_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle
                         bg-surface-card hover:border-border-strong transition-all duration-150
                         no-underline
                         sm:flex-col sm:items-center sm:justify-center sm:text-center sm:gap-0
                         sm:p-3 sm:aspect-[3/2] sm:rounded-card sm:hover:-translate-y-0.5"
            >
              <div className="text-brand-burgundy w-12 h-12 shrink-0 flex items-center justify-center
                              sm:w-16 sm:h-16 lg:w-20 lg:h-20 sm:mb-2">
                <item.Icon className="w-full h-full" stroke={1.5} />
              </div>

              <div className="flex-1 min-w-0 sm:flex-none sm:w-full">
                <div className="text-sm font-semibold text-content-primary truncate
                                sm:text-base sm:whitespace-normal">
                  {item.title}
                </div>
                <div className="text-xs text-content-muted truncate sm:hidden">
                  {item.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Hot Schools */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-medium">熱門語校</h2>
          <Link to="/schools" className="text-xs no-underline">
            全部語校 →
          </Link>
        </div>
        <HotSchoolsCarousel />
      </section>

      {/* Announcements */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-medium">最新公告</h2>
          <div className="flex items-center gap-2 text-content-muted">
            <IconBell className="w-4 h-4" />
            <span className="text-xs">最近 5 則</span>
          </div>
        </div>
        <Announcements />
      </section>

      <OnboardingModal open={onboardingOpen} onClose={() => setOnboardingOpen(false)} />
    </div>
  );
}
