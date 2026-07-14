import faq from '../data/faq.json';
import type { FaqEntry } from '../lib/faq';

export default function FAQ() {
  return (
    <div className="space-y-3">
      {(faq as FaqEntry[]).map((item) => (
        <details key={item.q} className="card group">
          <summary className="cursor-pointer font-medium text-content-primary group-open:text-brand-burgundy">
            {item.q}
          </summary>
          {item.summary ? (
            <div className="mt-2 space-y-3">
              <div className="text-sm font-semibold text-brand-burgundy bg-brand-gold-soft
                              px-3 py-2 rounded-lg">
                {item.summary}
              </div>
              <ul className="space-y-1.5 text-sm text-content-secondary list-disc pl-5">
                {(item.points ?? []).map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
              <details className="text-xs">
                <summary className="cursor-pointer text-content-muted hover:text-content-primary">
                  查看完整說明
                </summary>
                <p className="mt-2 text-content-secondary whitespace-pre-wrap leading-relaxed">
                  {item.detail}
                </p>
              </details>
            </div>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-content-secondary whitespace-pre-wrap">
              {item.a}
            </p>
          )}
        </details>
      ))}
    </div>
  );
}
