import { useState } from 'react';
import {
  IMMIGRATION_GUIDE_TITLE,
  IMMIGRATION_GUIDE_INTRO,
  IMMIGRATION_GUIDE_VERIFIED_DATE,
  IMMIGRATION_GUIDE_SECTIONS,
  IMMIGRATION_GUIDE_LINKS,
} from '../data/recommendations/immigrationGuide';
import type { GuideBlock, ImmigrationGuideSection } from '../data/recommendations/immigrationGuide';

/** 解析 `**粗體**` 標記為 <strong>，僅支援本檔內容範圍內的簡單 inline 粗體 */
function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="text-content-primary font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function GuideBlockView({ block }: { block: GuideBlock }) {
  if (block.type === 'subheading') {
    return <div className="text-sm font-semibold text-content-primary pt-1">{block.text}</div>;
  }
  if (block.type === 'callout') {
    return (
      <div className="text-xs font-medium text-brand-burgundy bg-brand-gold-soft
                      px-3 py-2 rounded-lg inline-block">
        {renderInline(block.text)}
      </div>
    );
  }
  if (block.type === 'table') {
    return (
      <div className="overflow-x-auto rounded-lg border border-border-subtle">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-surface-hover">
              {block.headers.map((h, i) => (
                <th
                  key={i}
                  className="text-left font-semibold text-content-primary px-3 py-2
                             border-b border-border-subtle whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, ri) => (
              <tr key={ri} className={ri > 0 ? 'border-t border-border-subtle' : ''}>
                {row.map((cell, ci) => (
                  <td key={ci} className="text-content-secondary px-3 py-2 align-top leading-relaxed">
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (block.type === 'ordered') {
    return (
      <ol className="space-y-1.5 pl-5 list-decimal text-sm text-content-secondary marker:text-content-muted">
        {block.items.map((item, i) => (
          <li key={i} className="leading-relaxed">{renderInline(item)}</li>
        ))}
      </ol>
    );
  }
  return (
    <ul className="space-y-1.5 pl-5 list-disc text-sm text-content-secondary marker:text-content-muted">
      {block.items.map((item, i) => (
        <li key={i} className="leading-relaxed">{renderInline(item)}</li>
      ))}
    </ul>
  );
}

/** 沿用作戰手冊 WorkflowCard.tsx 既有 button+chevron+useState 展開模式，每節獨立展開 */
function GuideSectionCard({ section }: { section: ImmigrationGuideSection }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border-subtle rounded-lg p-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 text-sm font-semibold
                   text-content-primary hover:text-brand-burgundy transition-colors"
      >
        <span>{section.title}</span>
        <span aria-hidden className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {section.blocks.map((block, i) => (
            <GuideBlockView key={i} block={block} />
          ))}
          <div className="pt-2 border-t border-border-subtle text-xs text-content-muted">
            查證日期：{IMMIGRATION_GUIDE_VERIFIED_DATE}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ImmigrationGuide() {
  return (
    <section className="card bg-surface-section border-border-subtle space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-content-primary">{IMMIGRATION_GUIDE_TITLE}</h2>
        <p className="text-sm text-content-secondary italic mt-2 pl-3 py-0.5
                      border-l-2 border-brand-gold/50 leading-relaxed">
          {IMMIGRATION_GUIDE_INTRO}
        </p>
      </div>

      <div className="space-y-2">
        {IMMIGRATION_GUIDE_SECTIONS.map((s) => (
          <GuideSectionCard key={s.id} section={s} />
        ))}
      </div>

      <div className="pt-3 border-t border-border-subtle">
        <h3 className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-2">
          官方資源
        </h3>
        <ul className="space-y-1">
          {IMMIGRATION_GUIDE_LINKS.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-burgundy no-underline hover:text-brand-burgundy-hover"
              >
                {link.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
