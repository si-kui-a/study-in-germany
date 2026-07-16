import { Link } from 'react-router-dom';
import BerlinIllustration from '../assets/cities/Berlin';
import FrankfurtIllustration from '../assets/cities/Frankfurt';
import MunichIllustration from '../assets/cities/Munich';
import DuesseldorfIllustration from '../assets/cities/Duesseldorf';

/**
 * DS v4.0 Hero · 幾何城市天際線 + 品牌定位 + CTA
 * 4 城 SVG 橫向拼組作為背景（低透明度），不搶焦點。
 * 純 SVG · currentColor 對接 ZenTheme · 淺深模式自動適配。
 */
export default function HeroSection() {
  return (
    <section className="relative pt-6 pb-20 sm:pt-10 sm:pb-24">
      {/* 天際線背景 · 4 城拼組 · 低透明度不搶焦 */}
      <div
        className="absolute inset-x-0 bottom-0 h-32 sm:h-40
                   text-content-primary opacity-[0.08] dark:opacity-[0.12]
                   flex items-end pointer-events-none overflow-hidden select-none"
        aria-hidden="true"
      >
        <div className="flex-1 min-w-0"><BerlinIllustration className="w-full h-full" /></div>
        <div className="flex-1 min-w-0"><MunichIllustration className="w-full h-full" /></div>
        <div className="flex-1 min-w-0"><FrankfurtIllustration className="w-full h-full" /></div>
        <div className="flex-1 min-w-0"><DuesseldorfIllustration className="w-full h-full" /></div>
      </div>

      {/* Hero 內容 */}
      <div className="relative text-center max-w-2xl mx-auto space-y-5 px-4">
        <div className="inline-block px-3 py-1 rounded-full
                        bg-brand-gold/15 text-brand-burgundy text-xs font-medium
                        border border-brand-gold/30">
          留德華站 · v4.1
        </div>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight">
          德國語校、住宿、生活資訊
          <span className="text-brand-burgundy">.</span>
        </h1>
        <p className="text-content-secondary max-w-xl mx-auto leading-relaxed">
          給留德台灣人的一站式基地：語校真實評價、作戰手冊逐步指引、討論區、資源庫與外事局應對指南、常見問答。
          瀏覽內容無需登入，登入僅用於留言與追蹤等寫入功能，並確保問責。
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link to="/schools" className="btn-primary no-underline">
            瀏覽語校評價
          </Link>
          <Link to="/board" className="btn-ghost no-underline">
            進入討論區
          </Link>
        </div>
      </div>
    </section>
  );
}
