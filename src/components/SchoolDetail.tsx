import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import schools from '../data/schools.json';
import { supabase } from '../lib/supabase';
import { attachProfiles } from '../lib/types';
import type { School, SchoolReview } from '../lib/types';
import AuthGate from './AuthGate';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { MOCK_MODE, mockLog } from '../lib/mockMode';
import { MOCK_REVIEWS } from '../lib/mockData';

export default function SchoolDetail() {
  const { id } = useParams<{ id: string }>();
  const school = (schools as School[]).find((s) => s.id === id);

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
      setErr(error.message);
      setLoading(false);
      return;
    }
    setReviews(await attachProfiles((data ?? []) as SchoolReview[]));
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (!school) {
    return (
      <div className="py-20 text-center text-content-secondary">
        <p>找不到這間學校。</p>
        <Link to="/schools" className="mt-2 inline-block underline">回學校列表</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link to="/schools" className="text-sm">← 回學校列表</Link>
        <h1 className="mt-2 text-2xl font-semibold text-content-primary">{school.name_zh}</h1>
        <p className="text-content-muted">{school.name_de}</p>
        <p className="mt-1 text-sm text-content-secondary">
          {school.city} · {school.level}
        </p>
        {school.note && <p className="mt-3 text-content-secondary">{school.note}</p>}
        {school.website && (
          <a
            href={school.website}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm underline"
          >
            官方網站 ↗
          </a>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">學生評價</h2>
        {loading ? (
          <div className="text-sm text-content-muted">載入中…</div>
        ) : err ? (
          <div className="text-sm text-state-danger">讀取失敗：{err}</div>
        ) : (
          <ReviewList reviews={reviews} onDeleted={load} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">發表評價</h2>
        <AuthGate message="請先登入才能發表評價。">
          <ReviewForm schoolId={school.id} onSubmitted={load} />
        </AuthGate>
      </section>
    </div>
  );
}
