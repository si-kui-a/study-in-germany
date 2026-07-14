import { Link } from 'react-router-dom';
import { EduTopicIcon } from '../assets/icons/edu';
import { visaWorkflow } from '../data/edu/visa';
import { arrivalWorkflow } from '../data/edu/arrival';
import { renewalWorkflow } from '../data/edu/renewal';
import { applicationWorkflow } from '../data/edu/application';
import { scholarshipWorkflow } from '../data/edu/scholarship';
import { policyWorkflow } from '../data/edu/policy';
import { exitWorkflow } from '../data/edu/exit';

const TOPICS = [
  visaWorkflow,
  arrivalWorkflow,
  renewalWorkflow,
  applicationWorkflow,
  scholarshipWorkflow,
  policyWorkflow,
  exitWorkflow,
];

/**
 * DS v4.2 · Edu Hub
 * 從 Article Portal 改為 Workflow Portal。
 * 每卡顯示：Geometry SVG + Title + Subtitle
 * Phase AF：卡片密度優化，響應式雙態佈局，與 Home.tsx、Recommendation.tsx 共用
 *   同一套 class 組合邏輯（PAT-126）；step 數量不再於卡片上顯示，優先保留
 *   icon+title 之精簡度（進入各主題頁後仍可見完整 step 數量與流程總覽）
 * Phase AG：圖示與標題文字放大，消除卡片內部多餘留白（PAT-126 v2）
 */
export default function Edu() {
  return (
    <div className="space-y-10">
      <section>
        <div className="text-xs text-content-muted uppercase tracking-wider mb-2">
          German Study Hub
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-content-primary">
          德國留學作戰手冊
        </h1>
        <p className="text-sm text-content-secondary mt-3 max-w-2xl leading-relaxed">
          把德國留學所有行政程序拆解成可執行步驟。
          點入任一主題查看 workflow · 每一步告訴你要做什麼、需要什麼、去哪辦、完成後可以往下走哪。
        </p>
      </section>

      <section>
        <div className="flex flex-col gap-2 sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-3">
          {TOPICS.map((t) => (
            <Link
              key={t.slug}
              to={`/edu/${t.slug}`}
              className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle
                         bg-surface-card hover:border-border-strong transition-all duration-150
                         no-underline
                         sm:flex-col sm:items-center sm:justify-center sm:text-center sm:gap-0
                         sm:p-3 sm:aspect-[3/2] sm:rounded-card sm:hover:-translate-y-0.5"
            >
              <div className="text-module-edu w-12 h-12 shrink-0 flex items-center justify-center
                              sm:w-16 sm:h-16 lg:w-20 lg:h-20 sm:mb-2">
                <EduTopicIcon slug={t.slug} className="w-full h-full" />
              </div>

              <div className="flex-1 min-w-0 sm:flex-none sm:w-full">
                <div className="text-sm font-semibold text-content-primary truncate
                                sm:text-base sm:whitespace-normal">
                  {t.title}
                </div>
                <div className="text-xs text-content-muted truncate sm:hidden">
                  {t.subtitle}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="pt-4 text-center">
        <Link
          to="/recommendation"
          className="text-sm text-brand-burgundy hover:text-brand-burgundy-hover"
        >
          需要更多實用工具與推薦？前往推薦專區 →
        </Link>
      </div>

      <div className="pt-8 border-t border-border-subtle">
        <p className="text-xs text-content-muted text-center">
          本站作戰手冊內容最後審核於 2026-07-11 ·
          <br className="sm:hidden" />
          正式使用請至各官方連結查詢最新資訊
        </p>
      </div>

      <section className="card bg-brand-gold-soft border-brand-gold/30 max-w-3xl">
        <div className="text-sm font-medium text-content-primary mb-2">
          📝 貢獻你的經驗
        </div>
        <p className="text-sm text-content-secondary leading-relaxed">
          內容以官方公開資料為基礎，仍持續補充中。
          若你走過某段流程有實用細節，請於
          <Link to="/board" className="mx-1">佈告欄</Link>
          留言分享，或直接開 GitHub issue。留言功能將於後續版本上線。
        </p>
      </section>
    </div>
  );
}
