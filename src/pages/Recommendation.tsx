import { Link } from 'react-router-dom';
import RecommendationIcon from '../assets/icons/RecommendationIcon';
import { RECOMMENDATION_CATEGORIES } from '../lib/recommendation';
import generalData from '../data/recommendations/general.json';
import visaData from '../data/recommendations/visa.json';
import arrivalData from '../data/recommendations/arrival.json';
import eduData from '../data/recommendations/edu.json';
import scholarshipData from '../data/recommendations/scholarship.json';
import taiwanData from '../data/recommendations/taiwan.json';

const COUNT_MAP: Record<string, number> = {
  general: generalData.length,
  visa: visaData.length,
  arrival: arrivalData.length,
  edu: eduData.length,
  scholarship: scholarshipData.length,
  taiwan: taiwanData.length,
};

const SUGGEST_ISSUE_URL = `https://github.com/lilichen-F/study-in-germany/issues/new?${new URLSearchParams(
  { title: '[推薦] ', labels: 'recommendation' }
).toString()}`;

/**
 * DS v4.2 · 推薦專區 Hub
 * 6 個子分類卡矩陣（3×2 或 2×3 依螢幕）
 */
export default function Recommendation() {
  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs text-content-muted uppercase tracking-wider mb-2">
          Recommendations
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-3">
          <span className="text-brand-gold w-8 h-8 sm:w-10 sm:h-10 inline-flex">
            <RecommendationIcon className="w-full h-full" />
          </span>
          推薦專區
        </h1>
        <p className="text-sm text-content-secondary mt-3 max-w-2xl leading-relaxed">
          給留德新手與在德華人的實用工具、方案、平台清單。
          內容以可查證的官方連結為主，不寫時效性資訊（價格、優惠碼）。
          正式使用前請至各平台查詢最新細節。
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {RECOMMENDATION_CATEGORIES.map((c) => (
          <Link
            key={c.key}
            to={`/recommendation/${c.key}`}
            className="card-interactive block p-5 no-underline aspect-[4/3]
                       flex flex-col justify-between"
          >
            <div className="text-3xl" aria-hidden>{c.emoji}</div>
            <div>
              <div className="font-semibold text-content-primary">{c.title}</div>
              <div className="text-xs text-content-muted mt-1 leading-relaxed">
                {c.subtitle}
              </div>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-content-secondary">
                  {COUNT_MAP[c.key]} 項
                </span>
                <span className="text-brand-burgundy font-medium">進入 →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="card bg-brand-gold-soft border-brand-gold/30 max-w-2xl">
        <div className="text-sm font-medium text-content-primary mb-2">
          📝 有推薦想貢獻？
        </div>
        <p className="text-sm text-content-secondary leading-relaxed">
          歡迎於{' '}
          <a
            href={SUGGEST_ISSUE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Issue
          </a>{' '}
          提交你認為有用的工具、方案、平台。審核後會加入清單。
        </p>
      </div>
    </div>
  );
}
