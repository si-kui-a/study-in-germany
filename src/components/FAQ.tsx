import faq from '../data/faq.json';
import type { FaqItem } from '../lib/types';

export default function FAQ() {
  return (
    <div className="space-y-3">
      {(faq as FaqItem[]).map((item) => (
        <details key={item.q} className="card group">
          <summary className="cursor-pointer font-medium text-content-primary group-open:text-brand-burgundy">
            {item.q}
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-content-secondary whitespace-pre-wrap">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
