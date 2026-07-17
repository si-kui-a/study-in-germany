import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  Recommendation, CareerType, CareerFee, CareerMode, CareerCountry, CareerAudience,
} from '../lib/recommendation';
import {
  CAREER_TYPE_LABEL, CAREER_TYPE_ORDER, CAREER_FEE_LABEL, CAREER_MODE_LABEL,
  CAREER_COUNTRY_LABEL, CAREER_AUDIENCE_LABEL,
} from '../lib/recommendation';

type FeeFilter = 'all' | CareerFee;
type ModeFilter = 'all' | CareerMode;
type CountryFilter = 'all' | CareerCountry;

const FEE_OPTIONS = Object.keys(CAREER_FEE_LABEL) as CareerFee[];
const MODE_OPTIONS = Object.keys(CAREER_MODE_LABEL) as CareerMode[];
const COUNTRY_OPTIONS = Object.keys(CAREER_COUNTRY_LABEL) as CareerCountry[];
const AUDIENCE_OPTIONS = Object.keys(CAREER_AUDIENCE_LABEL) as CareerAudience[];

interface Props {
  items: Recommendation[];
}

/**
 * DACH 實習/求職大分類的子板塊導覽（Phase BG）。
 *
 * 沿用 GermanLearningBoard.tsx 建立的「tab + URL query param 同步」技術
 * （PAT-165），但不共用元件本身——兩者篩選維度形狀差異太大（這裡是
 * 4 維主動篩選：費用/模式/國家單選下拉 + 族群複選 chip，且無狀態徽章
 * 系統；德文學習是等級單選 + 族群複選，且有徽章系統），只有 2 個子板塊
 * 也遠少於德文學習的 9 個。目前只有兩個具體案例，尚不足以判斷「正確
 * 的抽象邊界」在哪裡，貿然抽出一個要同時滿足兩種形狀的共用元件，風險
 * 高於複製一份技術相同、內容各自獨立的元件（見 PAT-167 的完整判斷理由）。
 *
 * 本分類子板塊僅 2 個（實習/求職），不比照 Phase BF 幫德文學習新增的
 * 「全部」預設分頁與狀態純標籤化——那兩個決定是德文學習分類收到的
 * 專屬指示，本分類未收到相同指示，預設沿用 Phase BD 找房頁的主動篩選
 * 風格（見 recommendation.ts 內的說明註解）。
 */
export default function CareerBoard({ items }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [type, setType] = useState<CareerType>(() => {
    const s = searchParams.get('sub');
    return (CAREER_TYPE_ORDER as string[]).includes(s ?? '') ? (s as CareerType) : CAREER_TYPE_ORDER[0];
  });
  const [feeFilter, setFeeFilter] = useState<FeeFilter>('all');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');
  const [countryFilter, setCountryFilter] = useState<CountryFilter>('all');
  const [audienceFilter, setAudienceFilter] = useState<CareerAudience[]>([]);

  useEffect(() => {
    const s = searchParams.get('sub');
    if (s && (CAREER_TYPE_ORDER as string[]).includes(s)) {
      setType(s as CareerType);
    }
  }, [searchParams]);

  const handleTypeClick = (key: CareerType) => {
    setType(key);
    setSearchParams({ sub: key }, { replace: true });
  };

  const toggleAudience = (a: CareerAudience) => {
    setAudienceFilter((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  };

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      if (!item.career_type?.includes(type)) return false;
      if (feeFilter !== 'all' && !item.career_fee?.includes(feeFilter)) return false;
      if (modeFilter !== 'all' && !item.career_mode?.includes(modeFilter)) return false;
      if (countryFilter !== 'all' && !item.career_country?.includes(countryFilter)) return false;
      if (audienceFilter.length > 0 && !audienceFilter.some((a) => item.career_audience?.includes(a))) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, type, feeFilter, modeFilter, countryFilter, audienceFilter]);

  return (
    <div className="space-y-4">
      {/* 實習/求職 子板塊 tab */}
      <div className="flex flex-wrap gap-2 border-b border-border-subtle pb-3">
        {CAREER_TYPE_ORDER.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTypeClick(t)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              type === t
                ? 'border-brand-burgundy text-brand-burgundy bg-brand-burgundy/5'
                : 'border-border-subtle text-content-secondary hover:border-border-strong'
            }`}
          >
            {CAREER_TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      {/* 篩選列：費用/模式/國家單選下拉（比照 Schools.tsx／Phase BD 找房頁），
          族群多選 chip（比照 Phase BD 找房頁先例） */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={feeFilter}
          onChange={(e) => setFeeFilter(e.target.value as FeeFilter)}
          className="text-sm px-3 py-2 rounded-lg border border-border-subtle
                     bg-surface-canvas text-content-primary
                     focus:outline-none focus:border-brand-burgundy
                     hover:border-brand-gold transition-colors"
        >
          <option value="all">費用：任意</option>
          {FEE_OPTIONS.map((f) => (
            <option key={f} value={f}>{CAREER_FEE_LABEL[f]}</option>
          ))}
        </select>

        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value as ModeFilter)}
          className="text-sm px-3 py-2 rounded-lg border border-border-subtle
                     bg-surface-canvas text-content-primary
                     focus:outline-none focus:border-brand-burgundy
                     hover:border-brand-gold transition-colors"
        >
          <option value="all">模式：任意</option>
          {MODE_OPTIONS.map((m) => (
            <option key={m} value={m}>{CAREER_MODE_LABEL[m]}</option>
          ))}
        </select>

        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value as CountryFilter)}
          className="text-sm px-3 py-2 rounded-lg border border-border-subtle
                     bg-surface-canvas text-content-primary
                     focus:outline-none focus:border-brand-burgundy
                     hover:border-brand-gold transition-colors"
        >
          <option value="all">國家：任意</option>
          {COUNTRY_OPTIONS.map((c) => (
            <option key={c} value={c}>{CAREER_COUNTRY_LABEL[c]}</option>
          ))}
        </select>

        <div className="flex flex-wrap gap-2">
          {AUDIENCE_OPTIONS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggleAudience(a)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                audienceFilter.includes(a)
                  ? 'border-brand-burgundy text-brand-burgundy bg-brand-burgundy/5'
                  : 'border-border-subtle text-content-secondary hover:border-border-strong'
              }`}
            >
              {CAREER_AUDIENCE_LABEL[a]}
            </button>
          ))}
        </div>

        <span className="text-xs text-content-muted ml-auto">
          共 {visibleItems.length} 項
        </span>
      </div>

      {visibleItems.length === 0 ? (
        <div className="card text-center text-content-muted py-8">
          沒有符合條件的資源，試試調整篩選條件。
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

              {item.summary && (
                <p className="text-sm text-content-secondary leading-relaxed">{item.summary}</p>
              )}
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

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-surface-hover text-content-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
