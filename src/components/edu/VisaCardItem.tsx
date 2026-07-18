import { useState } from 'react';
import { IconBookmark, IconBookmarkFilled } from '@tabler/icons-react';
import type { Confidence, ConfidenceEntry, VisaCard } from '../../data/edu/visaCards';
import { CONFIDENCE_LABEL, CONFIDENCE_LABEL_SHORT } from '../../data/edu/visaCards';

/** 沿用 ImmigrationGuide.tsx GuideBlockView 的 **bold** 行內解析邏輯 */
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-content-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

const CONFIDENCE_STYLE: Record<Confidence, string> = {
  official: 'bg-state-success/15 border-state-success text-state-success',
  'alt-high': 'bg-brand-gold text-white border-brand-gold',
  'alt-medium': 'bg-brand-gold-soft border-brand-gold/50 text-content-primary',
  gap: 'bg-surface-hover border-border-subtle border-dashed text-content-muted',
};

const CONFIDENCE_ICON: Record<Confidence, string> = {
  official: '✓',
  'alt-high': '◐',
  'alt-medium': '~',
  gap: '?',
};

function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5
                  rounded border shrink-0 ${CONFIDENCE_STYLE[confidence]}`}
    >
      <span aria-hidden>{CONFIDENCE_ICON[confidence]}</span>
      {CONFIDENCE_LABEL[confidence]}
    </span>
  );
}

/** Phase BQ：摘要層精簡徽章，用短標籤但保留 Phase BP 建立的顏色/圖示視覺區隔（BQ.b/d） */
function SummaryConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1 py-0.5
                  rounded border shrink-0 whitespace-nowrap ${CONFIDENCE_STYLE[confidence]}`}
    >
      <span aria-hidden>{CONFIDENCE_ICON[confidence]}</span>
      {CONFIDENCE_LABEL_SHORT[confidence]}
    </span>
  );
}

function FinanceEntry({ entry }: { entry: ConfidenceEntry }) {
  return (
    <div className="space-y-1.5 border border-border-subtle rounded-lg p-2.5">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <p className="text-sm text-content-primary leading-relaxed flex-1 min-w-0">
          {renderInline(entry.summary)}
        </p>
        <ConfidenceBadge confidence={entry.confidence} />
      </div>
      {entry.quote && (
        <p className="text-xs text-content-secondary italic pl-3 py-0.5
                     border-l-2 border-brand-gold/50 leading-relaxed">
          {renderInline(entry.quote)}
        </p>
      )}
      {entry.sources && entry.sources.length > 0 && (
        <ul className="space-y-0.5">
          {entry.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer"
                 className="text-xs text-brand-burgundy no-underline hover:text-brand-burgundy-hover">
                {s.label} ↗
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}

export default function VisaCardItem({
  card,
  bookmarked,
  busy,
  onToggleBookmark,
}: {
  card: VisaCard;
  bookmarked: boolean;
  busy: boolean;
  onToggleBookmark: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border-subtle rounded-lg p-3">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="flex-1 min-w-0 flex items-center justify-between gap-3 text-left"
        >
          <span className="flex items-center gap-2 min-w-0">
            <span className="shrink-0 text-xs font-mono text-content-muted">
              {card.number}
            </span>
            <span className="text-sm font-semibold text-content-primary truncate">
              {card.title}
            </span>
            {card.notUpdatedThisRound && (
              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded
                               bg-surface-hover text-content-muted">
                本次未更新
              </span>
            )}
          </span>
          <span aria-hidden className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </button>
        <button
          type="button"
          onClick={onToggleBookmark}
          disabled={busy}
          title={bookmarked ? '取消收藏' : '收藏'}
          className="shrink-0 p-1 text-brand-gold hover:text-brand-gold-hover
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {bookmarked ? (
            <IconBookmarkFilled className="w-5 h-5" />
          ) : (
            <IconBookmark className="w-5 h-5" stroke={1.5} />
          )}
        </button>
      </div>

      {/* Phase BQ：摘要層——結論先行＋條列關鍵資訊＋財力精簡一行，
          比照 AU.a 資源卡片 summary/points 三層格式（PAT-152），
          收合狀態即可讀，展開才顯示完整說明（BQ.a/b） */}
      <div className="mt-2 space-y-1.5">
        <p className="text-sm text-content-primary leading-snug">{card.conclusion}</p>
        <div className="flex items-start gap-1.5 flex-wrap">
          <span className="text-xs text-content-secondary leading-snug">
            財力：{card.financeSummary.text}
          </span>
          <SummaryConfidenceBadge confidence={card.financeSummary.confidence} />
        </div>
        <ul className="space-y-0.5 pl-4 list-disc text-xs text-content-secondary marker:text-content-muted">
          {card.summaryPoints.map((p, i) => (
            <li key={i} className="leading-snug">{p}</li>
          ))}
        </ul>
      </div>

      {open && (
        <div className="mt-3 space-y-3 pt-3 border-t border-border-subtle">
          <Field label="適用對象">
            <p className="text-sm text-content-primary leading-relaxed">{card.eligibility}</p>
          </Field>

          <Field label="年齡限制">
            <p className="text-sm text-content-primary leading-relaxed">{card.ageLimit}</p>
            {card.ageLimitNote && (
              <div className="mt-1.5">
                <FinanceEntry entry={card.ageLimitNote} />
              </div>
            )}
          </Field>

          <Field label="財力/薪資">
            <div className="space-y-2">
              {card.finance.map((entry, i) => (
                <FinanceEntry key={i} entry={entry} />
              ))}
            </div>
          </Field>

          <Field label="工作權限">
            <p className="text-sm text-content-primary leading-relaxed">{card.workRights}</p>
          </Field>

          {card.degreeRecognition && (
            <Field label="學歷承認">
              <p className="text-sm text-content-primary leading-relaxed">{card.degreeRecognition}</p>
            </Field>
          )}

          {card.otherRequirements && (
            <Field label="其他必要條件">
              <p className="text-sm text-content-primary leading-relaxed">{card.otherRequirements}</p>
            </Field>
          )}

          <Field label="審核天數">
            <p className="text-sm text-content-primary leading-relaxed">{card.processingDays}</p>
          </Field>

          <Field label="簽證費">
            <p className="text-sm text-content-primary leading-relaxed">{card.fee}</p>
          </Field>

          <Field label="常見錯誤">
            <ul className="space-y-1 list-disc list-inside">
              {card.commonMistakes.map((m, i) => (
                <li key={i} className="text-sm text-state-danger leading-relaxed">
                  {m}
                </li>
              ))}
            </ul>
          </Field>

          <Field label="資料來源">
            <ul className="space-y-1">
              {card.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer"
                     className="text-sm text-brand-burgundy no-underline hover:text-brand-burgundy-hover">
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </Field>

          <div className="pt-2 border-t border-border-subtle text-xs text-content-muted">
            官網更新：{card.officialUpdated}｜{card.sourceNote}｜本卡查證於 {card.verifiedAt}
          </div>
        </div>
      )}
    </div>
  );
}
