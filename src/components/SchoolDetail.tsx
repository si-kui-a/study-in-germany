import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import schools from '../data/schools.json';
import type { School, SchoolReview } from '../lib/types';
import { attachProfiles } from '../lib/types';
import { supabase } from '../lib/supabase';
import { fetchWithRetry } from '../lib/fetchWithRetry';
import { MOCK_MODE, mockLog } from '../lib/mockMode';
import { MOCK_REVIEWS } from '../lib/mockData';
import AuthGate from './AuthGate';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import EmptyState from './EmptyState';
import { SkeletonList } from './Skeleton';
import { CityIllustration } from '../assets/cities';
import { RATING_DIMENSIONS } from '../lib/ratings';
import type { RatingDimension } from '../lib/ratings';
import RatingBreakdown from './RatingBreakdown';
import SubmissionForm from './SubmissionForm';
import UserSubmissionsList from './UserSubmissionsList';

const list = schools as School[];

/**
 * DS v4.1 SchoolDetail · Banner 化排版（B.1）+ mock fallback（A.75/A.100）整合
 *   - 全寬 CityIllustration 大版 + 底部漸層 overlay
 *   - 保留 SkeletonList / MOCK_MODE
 * Phase BC：讀取改用 fetchWithRetry，重試耗盡不顯示原始錯誤字串，
 *   改用 loadError 旗標渲染既有 EmptyState 樣式（見 PAT-163）
 */
export default function SchoolDetail() {
  const { id } = useParams<{ id: string }>();
  const school = list.find((s) => s.id === id);

  const [reviews, setReviews] = useState<SchoolReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setLoadError(false);
    if (MOCK_MODE) {
      mockLog('school-detail', `using MOCK_REVIEWS for ${id}`);
      setReviews(MOCK_REVIEWS.filter((r) => r.school_id === id));
      setLoading(false);
      return;
    }
    const { data, error } = await fetchWithRetry(
      () => supabase
        .from('school_reviews')
        .select('*')
        .eq('school_id', id)
        .order('created_at', { ascending: false })
        .retry(false),
      { table: 'school_reviews', source: 'SchoolDetail.load' },
    );
    if (error) {
      setLoadError(true);
      setLoading(false);
      return;
    }
    setReviews(await attachProfiles((data ?? []) as SchoolReview[]));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!school) {
    return (
      <div className="py-16 text-center text-content-secondary">
        找不到這所語校。
        <Link to="/schools" className="ml-2">回列表</Link>
      </div>
    );
  }

  const avgOverall =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((s, r) => s + (r.stars.overall || 0), 0) / reviews.length) * 10
        ) / 10
      : null;

  // 計算 6 維平均（overall + 5 維）
  const avgBreakdown: Partial<Record<RatingDimension | 'overall', number>> = {};
  if (reviews.length > 0) {
    const dims: (RatingDimension | 'overall')[] = ['overall', ...RATING_DIMENSIONS.map((d) => d.key)];
    for (const dim of dims) {
      const values = reviews
        .map((r) => r.stars[dim])
        .filter((v): v is number => typeof v === 'number' && v > 0);
      if (values.length > 0) {
        avgBreakdown[dim] = Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10;
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Banner 區塊 · 城市 SVG 全寬大版 */}
      <section className="relative">
        <Link
          to="/schools"
          className="absolute top-4 left-4 z-10 text-xs
                     text-content-secondary hover:text-content-primary
                     bg-surface-card/85 backdrop-blur-sm
                     px-3 py-1.5 rounded-lg border border-border-subtle
                     no-underline transition-colors"
        >
          ← 回語校列表
        </Link>

        <div className="relative rounded-card overflow-hidden
                        bg-surface-hover border border-border-subtle">
          <div className="h-48 sm:h-64 text-brand-burgundy/50 dark:text-brand-burgundy/60
                          flex items-center justify-center px-8">
            <CityIllustration
              cityKey={school.city_key}
              className="w-full h-full max-w-2xl opacity-80"
            />
          </div>

          <div className="absolute inset-x-0 bottom-0
                          bg-gradient-to-t from-surface-card via-surface-card/95 to-transparent
                          pt-16 pb-5 px-5 sm:px-8">
            <div className="text-xs text-content-muted mb-1 uppercase tracking-wider">
              {school.city}
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold">{school.name_zh}</h1>
            <div className="text-sm text-content-secondary mt-0.5">{school.name_de}</div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
              <span className="px-2 py-0.5 rounded bg-brand-gold-soft text-brand-burgundy font-medium">
                {school.level}
              </span>
              {avgOverall !== null && (
                <span className="text-content-secondary">
                  平均{' '}
                  <span className="text-brand-gold font-semibold">★{avgOverall}</span>{' '}
                  · {reviews.length} 則評價
                </span>
              )}
              {/* Phase AS：資料查證/建立月份，PAT-148（as any 慣例同 accommodation） */}
              {(school as any).updated_at && (
                <span className="text-content-muted">
                  更新於 {(school as any).updated_at}
                </span>
              )}
            </div>

            {reviews.length > 0 && (
              <details className="mt-3">
                <summary className="text-xs text-content-secondary cursor-pointer
                                    hover:text-content-primary transition-colors">
                  展開 6 維評分
                </summary>
                <div className="mt-3 pt-3 border-t border-border-subtle max-w-md">
                  <RatingBreakdown stars={avgBreakdown} />
                </div>
              </details>
            )}
          </div>
        </div>
      </section>

      {school.note && (
        <p className="text-sm text-content-secondary leading-relaxed
                      border-l-2 border-brand-gold/60 pl-4 py-1">
          {school.note}
        </p>
      )}

      {(school as any).accommodation && (
        <div className="pt-3 border-t border-border-subtle">
          <div className="text-xs font-medium text-content-muted uppercase tracking-wider mb-1">
            住宿
          </div>
          <div className="text-sm text-content-primary">
            🏠 {(school as any).accommodation}
          </div>
        </div>
      )}

      {/* 連結區塊 · Google Maps + 官網並列（PAT-56） */}
      <div className="flex flex-wrap gap-3 text-xs">
        <a
          href={`https://www.google.com/maps/search/${encodeURIComponent(`${school.name_zh} ${school.city}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1
                     px-3 py-1.5 rounded-lg border border-border-subtle
                     hover:border-brand-gold hover:text-brand-burgundy
                     no-underline transition-colors"
        >
          📍 Google 地圖 ↗
        </a>
        {school.website && (
          <a
            href={school.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1
                       px-3 py-1.5 rounded-lg border border-border-subtle
                       hover:border-brand-gold hover:text-brand-burgundy
                       no-underline transition-colors"
          >
            🌐 官網 ↗
          </a>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">學員評價</h2>
        {loading ? (
          <SkeletonList n={2} />
        ) : loadError ? (
          <EmptyState title="讀取失敗" description="請檢查網路連線後重新整理頁面。" />
        ) : (
          <ReviewList reviews={reviews} onDeleted={load} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">留下你的評價</h2>
        <AuthGate message="請先登入才能發表評價。">
          <ReviewForm schoolId={school.id} onSubmitted={load} />
        </AuthGate>
      </section>

      {/* 提交建議 · user_submissions form（PAT-67/68/69） */}
      <section className="card bg-brand-gold-soft border-brand-gold/30">
        <details>
          <summary className="cursor-pointer flex items-center justify-between gap-3
                              hover:text-brand-burgundy transition-colors">
            <div>
              <div className="text-sm font-medium text-content-primary">
                📝 資訊有誤或想補充？
              </div>
              <div className="text-xs text-content-muted mt-1 leading-relaxed">
                歡迎回報學校資訊錯誤、住宿情況、或補充其他細節。
              </div>
            </div>
            <span className="text-xs text-brand-burgundy shrink-0">展開 →</span>
          </summary>
          <div className="pt-4 mt-3 border-t border-border-subtle">
            <SubmissionForm
              submissionType="school_edit"
              targetId={school.id}
              titlePlaceholder={`關於 ${school.name_zh} 的建議`}
              contentPlaceholder="請描述你想補充或更正的內容"
            />
          </div>
        </details>
        <UserSubmissionsList
          submissionType="school_edit"
          targetId={school.id}
          title="使用者提交的建議"
          emptyMessage="還沒有使用者提交建議"
        />
      </section>
    </div>
  );
}
