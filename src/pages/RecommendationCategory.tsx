import { Link, useParams } from 'react-router-dom';
import { RECOMMENDATION_CATEGORIES } from '../lib/recommendation';
import type { Recommendation } from '../lib/recommendation';
import { RecommendationCategoryIcon } from '../assets/icons/recommendation';
import UserSubmissionsList from '../components/UserSubmissionsList';
import financeData from '../data/recommendations/finance.json';
import transportData from '../data/recommendations/transport.json';
import telecomData from '../data/recommendations/telecom.json';
import housingData from '../data/recommendations/housing.json';
import lookupData from '../data/recommendations/lookup.json';
import scholarshipData from '../data/recommendations/scholarship.json';
import expenseData from '../data/recommendations/expense.json';
import generalData from '../data/recommendations/general.json';

const DATA_MAP: Record<string, Recommendation[]> = {
  finance: financeData as Recommendation[],
  transport: transportData as Recommendation[],
  telecom: telecomData as Recommendation[],
  housing: housingData as Recommendation[],
  lookup: lookupData as Recommendation[],
  scholarship: scholarshipData as Recommendation[],
  expense: expenseData as Recommendation[],
  general: generalData as Recommendation[],
};

/**
 * Phase AQ：條目卡片改為正方形小卡 grid（原直排列表形式），
 * 分類重組為 8 新分類（PAT-145）
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item) => (
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
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags?.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-surface-hover text-content-muted">
                  {tag}
                </span>
              ))}
            </div>
          </a>
        ))}
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
