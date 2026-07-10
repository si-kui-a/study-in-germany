import { Link } from 'react-router-dom';
import PortalCard from '../components/PortalCard';
import HeroSection from '../components/HeroSection';
import Announcements from '../components/Announcements';
import HotSchoolsCarousel from '../components/HotSchoolsCarousel';
import SchoolIcon from '../assets/icons/SchoolIcon';
import BoardIcon from '../assets/icons/BoardIcon';
import FaqIcon from '../assets/icons/FaqIcon';
import MyPostsIcon from '../assets/icons/MyPostsIcon';
import EduIcon from '../assets/icons/EduIcon';
import RecommendationIcon from '../assets/icons/RecommendationIcon';
import BellIcon from '../assets/icons/BellIcon';

/**
 * DS v4.1 Portal 首頁（B.1 Hero + B.2 Morandi 整合 · Phase G 擴為 6 卡）
 * 結構：Hero 天際線 → Portal (6 卡，兩列 3+3) → 熱門語校 → 最新公告
 */
export default function Home() {
  return (
    <div className="space-y-20 sm:space-y-24">
      <HeroSection />

      {/* Portal */}
      <section>
        <div className="text-xs text-content-muted mb-4 uppercase tracking-wider">Portal</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          <PortalCard
            to="/schools"
            title="語言學校"
            description="查看語校資料、學生評價、學費資訊"
            icon={<SchoolIcon className="w-full h-full" />}
          />
          <PortalCard
            to="/board"
            title="生活佈告欄"
            description="出租、求租、二手交易"
            icon={<BoardIcon className="w-full h-full" />}
          />
          <PortalCard
            to="/edu"
            title="學用板塊"
            description="簽證、落地、延簽、獎學金、政策"
            icon={<EduIcon className="w-full h-full" />}
          />
          <PortalCard
            to="/recommendation"
            title="推薦"
            description="德國好物、方案、優惠"
            icon={<RecommendationIcon className="w-full h-full" />}
          />
          <PortalCard
            to="/faq"
            title="常見問答"
            description="簽證、健保、限制提領帳戶、生活疑問"
            icon={<FaqIcon className="w-full h-full" />}
          />
          <PortalCard
            to="/my-posts"
            title="我的資料"
            description="管理自己的評價與貼文"
            icon={<MyPostsIcon className="w-full h-full" />}
          />
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
            <BellIcon className="w-4 h-4" />
            <span className="text-xs">最近 5 則</span>
          </div>
        </div>
        <Announcements />
      </section>
    </div>
  );
}
