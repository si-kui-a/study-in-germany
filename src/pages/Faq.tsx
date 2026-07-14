import { Link } from 'react-router-dom';
import FAQ from '../components/FAQ';

export default function Faq() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">常見問答</h1>
        <p className="text-sm text-content-secondary mt-1 max-w-2xl">
          留德新手最常先問的問題。深入的簽證、落地、申請、獎學金流程請至
          {' '}<Link to="/edu">作戰手冊</Link>。
        </p>
      </div>
      <FAQ />

      <div className="card bg-surface-section max-w-2xl">
        <div className="text-sm font-medium text-content-primary mb-2">
          🔎 需要更完整的資訊？
        </div>
        <p className="text-sm text-content-secondary leading-relaxed mb-3">
          「作戰手冊」六個子主題整理成可查、可讀、可帶著走的實用筆記：
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { slug: 'visa', label: '簽證流程' },
            { slug: 'arrival', label: '落地指南' },
            { slug: 'renewal', label: '延簽流程' },
            { slug: 'application', label: '學程申請' },
            { slug: 'scholarship', label: '獎學金' },
            { slug: 'policy', label: '教育政策' },
          ].map((t) => (
            <Link
              key={t.slug}
              to={`/edu/${t.slug}`}
              className="text-xs px-3 py-1.5 rounded-lg border border-border-subtle
                         hover:border-brand-gold hover:text-brand-burgundy
                         no-underline transition-colors"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
