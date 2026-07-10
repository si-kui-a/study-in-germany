import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import schools from '../data/schools.json';
import type { School, SchoolReview } from '../lib/types';
import { attachProfiles } from '../lib/types';
import { supabase } from '../lib/supabase';
import { translateError } from '../lib/errorMessages';
import { useToast } from '../lib/toast';
import { MOCK_MODE, mockLog } from '../lib/mockMode';
import { MOCK_REVIEWS } from '../lib/mockData';
import AuthGate from './AuthGate';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { SkeletonList } from './Skeleton';
import { CityIllustration } from '../assets/cities';
import { RATING_DIMENSIONS } from '../lib/ratings';
import type { RatingDimension } from '../lib/ratings';
import RatingBreakdown from './RatingBreakdown';

const list = schools as School[];

/**
 * DS v4.1 SchoolDetail · Banner 化排版（B.1）+ mock fallback（A.75/A.100）整合
 *   - 全寬 CityIllustration 大版 + 底部漸層 overlay
 *   - 保留 translateError / Toast / SkeletonList / MOCK_MODE
 */
export default function SchoolDetail() {
  const { id } = useParams<{ id: string }>();
  const school = list.find((s) => s.id === id);
  const { push } = useToast();

  const [reviews, setReviews] = useState<SchoolReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setErr(null);
    if (MOCK_MODE) {
      mockLog('school-detail', `using MOCK_REVIEWS for ${id}`);
      setReviews(MOCK_REVIEWS.filter((r) => r.school_id === id));
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('school_reviews')
      .select('*')
      .eq('school_id', id)
      .order('created_at', { ascending: false });
    if (error) {
      const f = translateError(error);
      setErr(f.message);
      push('error', `讀取評價失敗：${f.message}`);
      console.error('[SchoolDetail] raw:', f.raw, 'code:', f.code);
      setLoading(false);
      return;
    }
    setReviews(await attachProfiles((data ?? []) as SchoolReview[]));
    setLoading(false);
  }, [id, push]);

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
              {school.website && (
                <a
                  href={school.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs"
                >
                  官方網站 ↗
                </a>
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

      <section className="space-y-3">
        <h2 className="text-lg font-medium">學員評價</h2>
        {loading ? (
          <SkeletonList n={2} />
        ) : err ? (
          <div className="card text-sm text-state-danger">讀取失敗：{err}</div>
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
    </div>
  );
}
