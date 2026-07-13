import { Link } from 'react-router-dom';
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

const PORTAL_ITEMS = [
  {
    to: '/schools', title: '語言學校', description: '查看語校資料、學生評價、學費資訊',
    Icon: SchoolIcon, colorClass: 'text-module-schools',
  },
  {
    to: '/board', title: '生活佈告欄', description: '出租、求租、二手交易',
    Icon: BoardIcon, colorClass: 'text-module-board',
  },
  {
    to: '/edu', title: '學用板塊', description: '簽證、落地、延簽、獎學金、政策',
    Icon: EduIcon, colorClass: 'text-module-edu',
  },
  {
    to: '/recommendation', title: '推薦', description: '德國好物、方案、優惠',
    Icon: RecommendationIcon, colorClass: 'text-module-recommendation',
  },
  {
    to: '/faq', title: '常見問答', description: '簽證、健保、限制提領帳戶、生活疑問',
    Icon: FaqIcon, colorClass: 'text-module-faq',
  },
  {
    to: '/my-posts', title: '我的資料', description: '管理自己的評價與貼文',
    Icon: MyPostsIcon, colorClass: 'text-module-myposts',
  },
];

/**
 * DS v4.1 Portal 首頁（B.1 Hero + B.2 Morandi 整合 · Phase G 擴為 6 卡）
 * Phase Y：Portal 卡片改用與 Edu Hub 一致的大圖示置中佈局（PAT-116）
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
          {PORTAL_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="card-interactive block p-5 no-underline aspect-[4/3]
                         flex flex-col justify-between"
            >
              <div className={`${item.colorClass} w-20 h-20 sm:w-24 sm:h-24
                                mt-auto mb-3 mx-auto flex items-center justify-center`}>
                <item.Icon className="w-full h-full" />
              </div>

              <div className="space-y-1 text-center">
                <div className="text-base font-semibold text-content-primary">
                  {item.title}
                </div>
                <div className="text-xs text-content-muted italic">
                  {item.description}
                </div>
                <div className="pt-2 text-right text-xs">
                  <span className="text-brand-burgundy font-medium">進入 →</span>
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
            <BellIcon className="w-4 h-4" />
            <span className="text-xs">最近 5 則</span>
          </div>
        </div>
        <Announcements />
      </section>
    </div>
  );
}
