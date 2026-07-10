import { Link, useParams } from 'react-router-dom';
import { RECOMMENDATION_CATEGORIES } from '../lib/recommendation';
import type { Recommendation } from '../lib/recommendation';
import generalData from '../data/recommendations/general.json';
import visaData from '../data/recommendations/visa.json';
import arrivalData from '../data/recommendations/arrival.json';
import eduData from '../data/recommendations/edu.json';
import scholarshipData from '../data/recommendations/scholarship.json';
import taiwanData from '../data/recommendations/taiwan.json';

const DATA_MAP: Record<string, Recommendation[]> = {
  general: generalData as Recommendation[],
  visa: visaData as Recommendation[],
  arrival: arrivalData as Recommendation[],
  edu: eduData as Recommendation[],
  scholarship: scholarshipData as Recommendation[],
  taiwan: taiwanData as Recommendation[],
};

export default function RecommendationCategory() {
  const { slug } = useParams<{ slug: string }>();
  const meta = RECOMMENDATION_CATEGORIES.find((c) => c.key === slug);
  const items = slug ? DATA_MAP[slug] : null;

  if (!meta || !items) {
    return (
      <div className="py-16 text-center text-content-secondary">
        找不到這個分類。
        <Link to="/recommendation" className="ml-2">回推薦專區</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/recommendation" className="text-xs no-underline">
          ← 回推薦專區
        </Link>
      </div>

      <header className="flex items-start gap-4">
        <div className="text-4xl" aria-hidden>{meta.emoji}</div>
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

      <div className="space-y-4">
        {items.map((r) => (
          <article key={r.id} className="card space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-base font-semibold text-content-primary leading-tight">
                {r.title}
              </h3>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs no-underline shrink-0"
              >
                前往 ↗
              </a>
            </div>

            <p className="text-sm text-content-secondary leading-relaxed">
              {r.description}
            </p>

            {r.note && (
              <div className="text-xs text-content-muted italic pt-1">
                備註：{r.note}
              </div>
            )}

            <div className="pt-2 flex flex-wrap gap-1.5">
              {r.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded
                             bg-surface-hover text-content-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <section className="pt-4 border-t border-border-subtle">
        <div className="text-xs text-content-muted mb-3">其他分類</div>
        <div className="flex flex-wrap gap-2">
          {RECOMMENDATION_CATEGORIES.filter((c) => c.key !== slug).map((c) => (
            <Link
              key={c.key}
              to={`/recommendation/${c.key}`}
              className="text-xs px-3 py-1.5 rounded-lg border border-border-subtle
                         hover:border-brand-gold hover:text-brand-burgundy
                         no-underline transition-colors"
            >
              {c.emoji} {c.title}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
