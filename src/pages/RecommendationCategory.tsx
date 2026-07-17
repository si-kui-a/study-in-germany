import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  RECOMMENDATION_CATEGORIES, HOUSING_FEE_STATUS_LABEL, HOUSING_TERM_LABEL, HOUSING_TARGET_LABEL,
} from '../lib/recommendation';
import type { Recommendation, HousingFeeStatus, HousingTerm, HousingTarget } from '../lib/recommendation';
import { RecommendationCategoryIcon } from '../assets/icons/recommendation';
import UserSubmissionsList from '../components/UserSubmissionsList';
import ImmigrationGuide from '../components/ImmigrationGuide';
import GermanLearningBoard from '../components/GermanLearningBoard';
import CareerBoard from '../components/CareerBoard';
import financeData from '../data/recommendations/finance.json';
import transportData from '../data/recommendations/transport.json';
import telecomData from '../data/recommendations/telecom.json';
import housingData from '../data/recommendations/housing.json';
import lookupData from '../data/recommendations/lookup.json';
import scholarshipData from '../data/recommendations/scholarship.json';
import expenseData from '../data/recommendations/expense.json';
import immigrationData from '../data/recommendations/immigration.json';
import generalData from '../data/recommendations/general.json';
import germanLearningData from '../data/recommendations/german_learning.json';
import careerData from '../data/recommendations/career.json';

const DATA_MAP: Record<string, Recommendation[]> = {
  finance: financeData as Recommendation[],
  transport: transportData as Recommendation[],
  telecom: telecomData as Recommendation[],
  housing: housingData as Recommendation[],
  lookup: lookupData as Recommendation[],
  scholarship: scholarshipData as Recommendation[],
  expense: expenseData as Recommendation[],
  immigration: immigrationData as Recommendation[],
  general: generalData as Recommendation[],
  german_learning: germanLearningData as Recommendation[],
  career: careerData as Recommendation[],
};

type FeeStatusFilter = 'all' | HousingFeeStatus;
type TermFilter = 'all' | HousingTerm;

const FEE_STATUS_OPTIONS: FeeStatusFilter[] = ['all', 'free', 'partial', 'paid', 'unknown'];
const TERM_OPTIONS: TermFilter[] = ['all', 'long', 'short'];
const TARGET_OPTIONS: HousingTarget[] = ['student', 'general', 'shared', 'room'];

/**
 * Phase AQ：分類重組為 8 新分類（PAT-145）
 * Phase AS：描述過長項目改用 summary/points/detail 三層結構（PAT-147）
 * Phase AT：immigration 分類城市連結上方新增跨城市通用應對指南（PAT-149）
 * Phase AU：全站卡片格式統一為「結論先行一句＋精簡列點＋可收合 detail」
 * （PAT-152），移除舊有「正方形小卡／寬卡」雙分支——所有卡片皆有 summary
 * 後，正方形分支已不會再命中，改為單一卡片版型；官方連結改為明確的
 * 「官網 ↗」按鈕，不再需要 stretched-link + pointer-events 疊加技巧
 * （該技巧原是為了在正方形整卡可點擊區域內安全嵌入 details 收合而設計，
 * 版型改為一般卡片列表後不再需要）。
 */
export default function RecommendationCategory() {
  const { slug } = useParams<{ slug: string }>();
  const meta = RECOMMENDATION_CATEGORIES.find((c) => c.key === slug);
  const items = slug ? DATA_MAP[slug] : null;
  const isHousing = slug === 'housing';
  const isGermanLearning = slug === 'german_learning';
  const isCareer = slug === 'career';

  // Phase BD：找房分類篩選（fee_status/term 單選、target 可複選），沿用
  // Schools.tsx 的 <select> 互動模式；target 因需複選改用 chip 切換
  // （比照 Board.tsx 既有的 filter chip 視覺樣式，選取邏輯改為獨立切換）
  const [feeStatusFilter, setFeeStatusFilter] = useState<FeeStatusFilter>('all');
  const [termFilter, setTermFilter] = useState<TermFilter>('all');
  const [targetFilter, setTargetFilter] = useState<HousingTarget[]>([]);

  const toggleTarget = (t: HousingTarget) => {
    setTargetFilter((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const visibleItems = useMemo(() => {
    if (!items || !isHousing) return items ?? [];
    return items.filter((item) => {
      if (feeStatusFilter !== 'all' && item.fee_status !== feeStatusFilter) return false;
      if (termFilter !== 'all' && !item.term?.includes(termFilter)) return false;
      if (targetFilter.length > 0 && !targetFilter.some((t) => item.target?.includes(t))) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, isHousing, feeStatusFilter, termFilter, targetFilter]);

  if (!meta || !items) {
    return (
      <div className="py-16 text-center text-content-secondary">
        找不到這個分類。
        <Link to="/recommendation" className="ml-2">回資源</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/recommendation" className="text-xs no-underline">
          ← 回資源
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

      {/* Phase AT：跨城市通用應對指南，置於城市連結清單「上方」（PAT-149） */}
      {meta.key === 'immigration' && <ImmigrationGuide />}

      {/* Phase AR：外事局分類提醒制度變動頻繁，不描述具體預約流程（PAT-146） */}
      {meta.key === 'immigration' && (
        <div className="text-xs text-content-muted bg-brand-gold-soft px-3 py-2 rounded-lg">
          ⚠️ 各城市外事局的預約制度變動頻繁（例如柏林已廢除傳統線上預約系統），
          本頁僅提供官方入口連結，實際申請流程請以官網當下顯示內容為準。
          目前僅收錄柏林、慕尼黑，其餘城市待未來查證後補充。
        </div>
      )}

      {/* Phase AU.c：預付卡開卡共通事實，不逐卡重複（PAT-154） */}
      {meta.key === 'telecom' && (
        <div className="text-xs text-content-muted bg-brand-gold-soft px-3 py-2 rounded-lg">
          ℹ️ 德國預付卡開卡依法須完成身分驗證（VideoIdent／PostIdent／門市臨櫃），備妥護照。
          各品牌對非德國證件（如台灣護照）的支援度不一，請以官網當下的驗證方式頁面為準。
        </div>
      )}

      {/* Phase BE：德文學習為兩層（大分類→子板塊）結構，複雜度明顯高於其餘
          單層分類，獨立抽成 GermanLearningBoard 元件，不塞進本頁通用渲染路徑
          Phase BG：DACH 實習/求職同為兩層結構，篩選維度形狀與德文學習差異
          大，獨立抽成 CareerBoard 元件而非共用（見 PAT-167 判斷理由） */}
      {isGermanLearning ? (
        <GermanLearningBoard items={items} />
      ) : isCareer ? (
        <CareerBoard items={items} />
      ) : (
      <>
      {/* Phase BD：找房分類篩選（PAT-55 既有 <select> 互動模式 + Board.tsx
          既有 chip 視覺樣式，選取邏輯改為可複選切換） */}
      {isHousing && (
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={feeStatusFilter}
            onChange={(e) => setFeeStatusFilter(e.target.value as FeeStatusFilter)}
            className="text-sm px-3 py-2 rounded-lg border border-border-subtle
                       bg-surface-canvas text-content-primary
                       focus:outline-none focus:border-brand-burgundy
                       hover:border-brand-gold transition-colors"
          >
            <option value="all">FEE：任意</option>
            {FEE_STATUS_OPTIONS.filter((f) => f !== 'all').map((f) => (
              <option key={f} value={f}>{HOUSING_FEE_STATUS_LABEL[f]}</option>
            ))}
          </select>

          <select
            value={termFilter}
            onChange={(e) => setTermFilter(e.target.value as TermFilter)}
            className="text-sm px-3 py-2 rounded-lg border border-border-subtle
                       bg-surface-canvas text-content-primary
                       focus:outline-none focus:border-brand-burgundy
                       hover:border-brand-gold transition-colors"
          >
            <option value="all">租期：任意</option>
            {TERM_OPTIONS.filter((t) => t !== 'all').map((t) => (
              <option key={t} value={t}>{HOUSING_TERM_LABEL[t]}</option>
            ))}
          </select>

          <div className="flex flex-wrap gap-2">
            {TARGET_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleTarget(t)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  targetFilter.includes(t)
                    ? 'border-brand-burgundy text-brand-burgundy bg-brand-burgundy/5'
                    : 'border-border-subtle text-content-secondary hover:border-border-strong'
                }`}
              >
                {HOUSING_TARGET_LABEL[t]}
              </button>
            ))}
          </div>

          <span className="text-xs text-content-muted ml-auto">
            共 {visibleItems.length} 項
          </span>
        </div>
      )}

      {isHousing && visibleItems.length === 0 ? (
        <div className="card text-center text-content-muted py-8">
          沒有符合條件的平台，試試調整篩選條件。
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visibleItems.map((item) => (
          <div key={item.id} className="card space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-content-primary leading-snug">
                {item.title}
              </h3>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-burgundy no-underline hover:text-brand-burgundy-hover shrink-0"
              >
                官網 ↗
              </a>
            </div>

            {item.summary ? (
              <>
                <p className="text-sm text-content-secondary leading-relaxed">{item.summary}</p>
                {item.points && (
                  <ul className="space-y-1 pl-4 list-disc text-xs text-content-secondary marker:text-content-muted">
                    {item.points.map((p, i) => (
                      <li key={i} className="leading-relaxed">{p}</li>
                    ))}
                  </ul>
                )}
                {item.detail && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-content-muted hover:text-content-primary">
                      查看完整說明
                    </summary>
                    <p className="mt-1.5 text-content-secondary leading-relaxed">{item.detail}</p>
                  </details>
                )}
              </>
            ) : (
              <p className="text-sm text-content-secondary leading-relaxed">{item.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-1 pt-1">
              {item.tags?.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-surface-hover text-content-muted">
                  {tag}
                </span>
              ))}
              {item.updated_at && (
                <span className="text-xs text-content-muted ml-auto">更新於 {item.updated_at}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
      </>
      )}

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
