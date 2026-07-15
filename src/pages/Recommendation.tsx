import { Link } from 'react-router-dom';
import RecommendationIcon from '../assets/icons/RecommendationIcon';
import { RecommendationCategoryIcon } from '../assets/icons/recommendation';
import { RECOMMENDATION_CATEGORIES } from '../lib/recommendation';
import SubmissionForm from '../components/SubmissionForm';
import UserSubmissionsList from '../components/UserSubmissionsList';

/**
 * DS v4.2 · 加油站 Hub（原「推薦專區」，Phase AQ 更名，PAT-142）
 * 8 個子分類卡矩陣 · 圖示置中 · 文字置中（Phase AQ 分類重組，PAT-145）
 * Phase AF：卡片密度優化，響應式雙態佈局，與 Home.tsx、Edu.tsx 共用同一套
 *   class 組合邏輯（PAT-126）；子分類項目數（COUNT_MAP）不再於卡片上顯示，
 *   優先保留 icon+title 之精簡度
 * Phase AG：圖示與標題文字放大，消除卡片內部多餘留白（PAT-126 v2）
 */
export default function Recommendation() {
  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs text-content-muted uppercase tracking-wider mb-2">
          Recommendations
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-3">
          <span className="text-module-recommendation w-8 h-8 sm:w-10 sm:h-10 inline-flex">
            <RecommendationIcon className="w-full h-full" />
          </span>
          加油站
        </h1>
        <p className="text-sm text-content-secondary mt-3 max-w-2xl leading-relaxed">
          給留德新手與在德華人的實用工具、方案、平台清單。
          內容以可查證的官方連結為主，不寫時效性資訊（價格、優惠碼）。
          正式使用前請至各平台查詢最新細節。
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-3">
        {RECOMMENDATION_CATEGORIES.map((c) => (
          <Link
            key={c.key}
            to={`/recommendation/${c.key}`}
            className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle
                       bg-surface-card hover:border-border-strong transition-all duration-150
                       no-underline
                       sm:flex-col sm:items-center sm:justify-center sm:text-center sm:gap-0
                       sm:p-3 sm:aspect-[3/2] sm:rounded-card sm:hover:-translate-y-0.5"
          >
            <div className="text-module-recommendation w-12 h-12 shrink-0 flex items-center justify-center
                            sm:w-16 sm:h-16 lg:w-20 lg:h-20 sm:mb-2">
              <RecommendationCategoryIcon slug={c.key} className="w-full h-full" />
            </div>

            <div className="flex-1 min-w-0 sm:flex-none sm:w-full">
              <div className="text-sm font-semibold text-content-primary truncate
                              sm:text-base sm:whitespace-normal">
                {c.title}
              </div>
              <div className="text-xs text-content-muted truncate sm:block sm:mt-0.5">
                {c.subtitle}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 提交推薦 · user_submissions form（PAT-67/68/69） */}
      <section className="card bg-brand-gold-soft border-brand-gold/30 max-w-2xl">
        <details>
          <summary className="cursor-pointer flex items-center justify-between gap-3
                              hover:text-brand-burgundy transition-colors">
            <div>
              <div className="text-sm font-medium text-content-primary">
                📝 有推薦想貢獻？
              </div>
              <div className="text-xs text-content-muted mt-1 leading-relaxed">
                歡迎提交你認為有用的工具、方案、平台。
              </div>
            </div>
            <span className="text-xs text-brand-burgundy shrink-0">展開 →</span>
          </summary>
          <div className="pt-4 mt-3 border-t border-border-subtle">
            <SubmissionForm
              submissionType="new_recommendation"
              titlePlaceholder="推薦名稱"
              contentPlaceholder="推薦的類別、用途、官網、你的體驗"
            />
          </div>
        </details>
      </section>

      <UserSubmissionsList
        submissionType="new_recommendation"
        title="尚未分類的使用者推薦"
      />
    </div>
  );
}
