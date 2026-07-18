import { Link } from 'react-router-dom';
import { EduTopicIcon } from '../assets/icons/edu';
import {
  VISA_CARDS,
  VISA_SELECTOR_TITLE,
  VISA_SELECTOR_SUBTITLE,
  VISA_SELECTOR_UPDATE_LOG,
  VISA_SELECTOR_DISCLAIMER,
} from '../data/edu/visaCards';
import VisaCardItem from '../components/edu/VisaCardItem';
import { useVisaBookmarks } from '../lib/useVisaBookmarks';

/**
 * 選擇簽證（Phase BP）。
 *
 * 14 張簽證比較卡為「同等級並列」而非步驟化流程，故不沿用 EduTopic.tsx
 * 的 WorkflowTimeline/WorkflowCard 渲染路徑（見 Meta_Dev_Knowledge.md
 * BP.a 決策），改用 ImmigrationGuide.tsx 的 button+chevron+useState
 * 展開卡片模式，格式類型統一指視覺語言一致，非套用步驟總覽圓點。
 */
export default function VisaSelector() {
  const { bookmarkedIds, loading, busyId, toggleBookmark } = useVisaBookmarks();

  const sortedCards = loading
    ? VISA_CARDS
    : [...VISA_CARDS].sort((a, b) => {
        const aBookmarked = bookmarkedIds.has(a.id) ? 0 : 1;
        const bBookmarked = bookmarkedIds.has(b.id) ? 0 : 1;
        return aBookmarked - bBookmarked;
      });

  return (
    <div className="space-y-8">
      <div>
        <Link to="/edu" className="text-xs no-underline">
          ← 回作戰手冊
        </Link>
      </div>

      <header className="flex items-start gap-4">
        <div className="text-module-edu w-14 h-14 sm:w-16 sm:h-16 shrink-0">
          <EduTopicIcon slug="visa-selector" className="w-full h-full" />
        </div>
        <div>
          <div className="text-xs text-content-muted uppercase tracking-wider mb-1">
            {VISA_SELECTOR_SUBTITLE}
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-content-primary">
            {VISA_SELECTOR_TITLE}
          </h1>
          <p className="text-sm text-content-secondary mt-2 max-w-2xl leading-relaxed">
            14 種簽證類型比較卡，協助你判斷自己適用哪一種。點入任一卡片查看完整條件、財力信心分級與常見錯誤。
          </p>
        </div>
      </header>

      <section className="card bg-surface-section border-border-subtle">
        <p className="text-sm text-content-secondary italic leading-relaxed">
          {VISA_SELECTOR_DISCLAIMER}
        </p>
        <p className="text-xs text-content-muted mt-2">{VISA_SELECTOR_UPDATE_LOG}</p>
      </section>

      <section className="space-y-2">
        {sortedCards.map((card) => (
          <VisaCardItem
            key={card.id}
            card={card}
            bookmarked={bookmarkedIds.has(card.id)}
            busy={busyId === card.id}
            onToggleBookmark={() => toggleBookmark(card.id)}
          />
        ))}
      </section>
    </div>
  );
}
