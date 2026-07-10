import { useState } from 'react';
import type { WorkflowStep } from '../../data/edu/workflow';
import PriorityBadge from './PriorityBadge';

interface Props {
  step: WorkflowStep;
}

/**
 * DS v4.2 §八/§九/§十
 * 卡片 · 五區固定：STEP / Title / Meta / Outcome / CTA
 * CTA 為 Accordion trigger，展開 §十 四區塊：文件/流程/常見錯誤/官方資源
 */
export default function WorkflowCard({ step }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <article
      className="card space-y-3"
      id={`step-${step.step}`}
    >
      {/* Header · STEP + Title + Priority */}
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-content-muted uppercase tracking-wider mb-1">
            STEP {String(step.step).padStart(2, '0')}
          </div>
          <h3 className="text-lg font-semibold text-content-primary leading-tight">
            {step.title_zh}
          </h3>
          {step.title_de && (
            <div className="text-sm text-content-secondary mt-0.5 italic">
              {step.title_de}
            </div>
          )}
        </div>
        <PriorityBadge priority={step.meta.priority} />
      </header>

      {/* Meta · location/timing/docs */}
      {(step.meta.location || step.meta.timing || step.meta.docs_count !== undefined) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-content-secondary">
          {step.meta.location && (
            <span>📍 {step.meta.location}</span>
          )}
          {step.meta.timing && (
            <span>⏱ {step.meta.timing}</span>
          )}
          {step.meta.docs_count !== undefined && step.meta.docs_count > 0 && (
            <span>📄 {step.meta.docs_count} 項文件</span>
          )}
        </div>
      )}

      {/* Outcome */}
      {step.outcome.length > 0 && (
        <div className="pt-2 space-y-1">
          <div className="text-xs text-content-muted">完成後：</div>
          <ul className="space-y-0.5">
            {step.outcome.map((o, i) => (
              <li key={i} className="text-sm text-content-primary flex items-start gap-2">
                <span className="text-brand-gold mt-0.5">✓</span>
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA · Accordion trigger */}
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between pt-2 border-t border-border-subtle
                   text-sm text-brand-burgundy hover:text-brand-burgundy-hover
                   transition-colors"
      >
        <span>{open ? '收起詳細' : '查看詳細流程'}</span>
        <span aria-hidden className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {/* Accordion content */}
      {open && (
        <div className="pt-3 space-y-4">
          {/* 準備文件 */}
          {step.detail.documents.length > 0 && (
            <section>
              <h4 className="text-sm font-semibold text-content-primary mb-2">準備文件</h4>
              <ul className="space-y-1 pl-4 list-disc text-sm text-content-secondary">
                {step.detail.documents.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </section>
          )}

          {/* 辦理流程 */}
          {step.detail.procedure.length > 0 && (
            <section>
              <h4 className="text-sm font-semibold text-content-primary mb-2">辦理流程</h4>
              <ol className="space-y-2 pl-5 list-decimal text-sm text-content-secondary marker:text-content-muted">
                {step.detail.procedure.map((p, i) => {
                  if (typeof p === 'string') {
                    return (
                      <li key={i} className="leading-relaxed">{p}</li>
                    );
                  }
                  return (
                    <li key={i} className="leading-relaxed">
                      <div>{p.text}</div>
                      {p.items.length > 0 && (
                        <ul className="mt-1.5 pl-4 space-y-1 list-disc marker:text-content-muted">
                          {p.items.map((sub, j) => (
                            <li key={j} className="text-content-secondary">{sub}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          {/* 常見錯誤 */}
          {step.detail.common_mistakes.length > 0 && (
            <section>
              <h4 className="text-sm font-semibold text-content-primary mb-2">常見錯誤</h4>
              <ul className="space-y-1 pl-4 list-disc text-sm text-content-secondary">
                {step.detail.common_mistakes.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </section>
          )}

          {/* 官方資源 */}
          {step.detail.official_sources.length > 0 && (
            <section className="bg-brand-gold-soft rounded-lg p-3">
              <h4 className="text-sm font-semibold text-content-primary mb-2">官方資源</h4>
              <ul className="space-y-1">
                {step.detail.official_sources.map((s, i) => (
                  <li key={i} className="text-sm">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-burgundy hover:text-brand-burgundy-hover"
                    >
                      {s.name} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </article>
  );
}
