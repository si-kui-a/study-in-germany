import { Link, useParams } from 'react-router-dom';
import { RECOMMENDATION_CATEGORIES } from '../lib/recommendation';
import type { Recommendation } from '../lib/recommendation';
import { RecommendationCategoryIcon } from '../assets/icons/recommendation';
import UserSubmissionsList from '../components/UserSubmissionsList';
import ImmigrationGuide from '../components/ImmigrationGuide';
import financeData from '../data/recommendations/finance.json';
import transportData from '../data/recommendations/transport.json';
import telecomData from '../data/recommendations/telecom.json';
import housingData from '../data/recommendations/housing.json';
import lookupData from '../data/recommendations/lookup.json';
import scholarshipData from '../data/recommendations/scholarship.json';
import expenseData from '../data/recommendations/expense.json';
import immigrationData from '../data/recommendations/immigration.json';
import generalData from '../data/recommendations/general.json';

const DATA_MAP: Record<string, Recommendation[]> = {
  finance: financeData as Recommendation[],
  transport: transportData as Recommendation[],
  telecom: telecomData as Recommendation[],
  housing: housingData as Recommendation[],
  lookup: lookupData as Recommendation[],
  scholarship: scholarshipData as Recommendation[],
  expense: expenseData as Recommendation[],
  immigration: immigrationData as Recommendation[],
  general: generalData as Recommendation[],
};

/**
 * Phase AQ：條目卡片改為正方形小卡 grid（原直排列表形式），
 * 分類重組為 8 新分類（PAT-145）
 * Phase AS：描述過長項目改用 summary/points/detail 三層結構（PAT-147），
 * 卡片補上 updated_at 顯示（PAT-148）
 * Phase AT：immigration 分類城市連結上方新增跨城市通用應對指南（PAT-149）
 */
export default function RecommendationCategory() {
  const { slug } = useParams<{ slug: string }>();
  const meta = RECOMMENDATION_CATEGORIES.find((c) => c.key === slug);
  const items = slug ? DATA_MAP[slug] : null;

  if (!meta || !items) {
    return (
      <div className="py-16 text-center text-content-secondary">
        找不到這個分類。
        <Link to="/recommendation" className="ml-2">回加油站</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/recommendation" className="text-xs no-underline">
          ← 回加油站
        </Link>
      </div>

      <header className="flex items-start gap-4">
        <div className="text-module-recommendation w-14 h-14 sm:w-16 sm:h-16 shrink-0">
          <RecommendationCategoryIcon slug={meta.key} className="w-full h-full" />
        </div>
        <div>
          <div className="text-xs text-content-muted uppercase tracking-wider mb-1">
            {meta.subtitle}
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-content-primary">
            {meta.title}
          </h1>
          <p className="text-sm text-content-muted mt-2">
            {items.length} 項推薦
          </p>
        </div>
      </header>

      {/* Phase AT：跨城市通用應對指南，置於城市連結清單「上方」（PAT-149） */}
      {meta.key === 'immigration' && <ImmigrationGuide />}

      {/* Phase AR：外事局分類提醒制度變動頻繁，不描述具體預約流程（PAT-146） */}
      {meta.key === 'immigration' && (
        <div className="text-xs text-content-muted bg-brand-gold-soft px-3 py-2 rounded-lg">
          ⚠️ 各城市外事局的預約制度變動頻繁（例如柏林已廢除傳統線上預約系統），
          本頁僅提供官方入口連結，實際申請流程請以官網當下顯示內容為準。
          目前僅收錄柏林、慕尼黑，其餘城市待未來查證後補充。
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item) =>
          item.summary ? (
            // Phase AS：描述過長項目改用 summary/points/detail，跳出正方形小卡改為
            // 較寬的卡片以容納條列重點（PAT-147）；整卡可點擊改為 stretched-link
            // pattern（絕對定位覆蓋 <a> + 內容 pointer-events-none），因 <details>
            // 收合區塊不可巢狀在 <a> 內（無效 HTML，且點擊會誤觸外部連結）
            <div
              key={item.id}
              className="relative sm:col-span-2 flex flex-col gap-2 p-3
                         rounded-lg border border-border-subtle
                         hover:border-brand-gold transition-colors"
            >
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0"
                aria-label={item.title}
              />
              <div className="relative pointer-events-none">
                <div className="text-sm font-semibold text-content-primary line-clamp-2">
                  {item.title}
                </div>
                <p className="text-xs text-content-secondary mt-1">{item.summary}</p>
              </div>
              {item.points && (
                <ul className="relative pointer-events-none space-y-0.5 text-xs text-content-muted list-disc pl-3.5">
                  {item.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              )}
              {item.detail && (
                <details className="relative z-10 text-xs">
                  <summary className="cursor-pointer text-content-muted hover:text-content-primary">
                    查看完整說明
                  </summary>
                  <p className="mt-1.5 text-content-secondary leading-relaxed">{item.detail}</p>
                </details>
              )}
              <div className="relative pointer-events-none flex flex-wrap items-center gap-1 mt-auto pt-1">
                {item.tags?.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-surface-hover text-content-muted">
                    {tag}
                  </span>
                ))}
                {item.updated_at && (
                  <span className="text-xs text-content-muted ml-auto">更新於 {item.updated_at}</span>
                )}
              </div>
            </div>
          ) : (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square flex flex-col justify-between p-3
                         rounded-lg border border-border-subtle
                         hover:border-brand-gold transition-colors no-underline"
            >
              <div>
                <div className="text-sm font-semibold text-content-primary line-clamp-2">
                  {item.title}
                </div>
                <div className="text-xs text-content-muted mt-1 line-clamp-3">
                  {item.description}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1 mt-2">
                {item.tags?.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-surface-hover text-content-muted">
                    {tag}
                  </span>
                ))}
                {item.updated_at && (
                  <span className="text-xs text-content-muted ml-auto">更新於 {item.updated_at}</span>
                )}
              </div>
            </a>
          )
        )}
      </div>

      <UserSubmissionsList
        submissionType="new_recommendation"
        targetCategory={meta.key}
        title={`使用者提交的${meta.title}`}
        emptyMessage="還沒有使用者提交推薦"
      />

      <section className="pt-4 border-t border-border-subtle">
        <div className="text-xs text-content-muted mb-3">其他分類</div>
        <div className="flex flex-wrap gap-2">
          {RECOMMENDATION_CATEGORIES.filter((c) => c.key !== slug).map((c) => (
            <Link
              key={c.key}
              to={`/recommendation/${c.key}`}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border-subtle
                         hover:border-brand-gold hover:text-brand-burgundy
                         no-underline transition-colors"
            >
              <span className="w-3.5 h-3.5 inline-flex shrink-0">
                <RecommendationCategoryIcon slug={c.key} className="w-full h-full" />
              </span>
              {c.title}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
