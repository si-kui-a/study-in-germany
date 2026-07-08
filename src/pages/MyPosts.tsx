import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthGate from '../components/AuthGate';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import { LISTING_TYPE_LABEL } from '../lib/types';
import type { Listing, School, SchoolReview } from '../lib/types';
import { deletePhoto } from '../lib/storage';
import schools from '../data/schools.json';
import { MOCK_MODE, mockLog } from '../lib/mockMode';

function schoolName(schoolId: string): string {
  return (schools as School[]).find((s) => s.id === schoolId)?.name_zh ?? schoolId;
}

function MyPostsContent() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<SchoolReview[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setErr(null);
    if (MOCK_MODE) {
      mockLog('my-posts', 'using empty MOCK data for guest view');
      setReviews([]);
      setListings([]);
      setLoading(false);
      return;
    }
    const [reviewsRes, listingsRes] = await Promise.all([
      supabase
        .from('school_reviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ]);
    if (reviewsRes.error || listingsRes.error) {
      setErr(reviewsRes.error?.message ?? listingsRes.error?.message ?? '載入失敗');
      setLoading(false);
      return;
    }
    setReviews((reviewsRes.data ?? []) as SchoolReview[]);
    setListings((listingsRes.data ?? []) as Listing[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const deleteReview = async (id: number) => {
    if (!confirm('確定刪除這則評價？此動作無法復原。')) return;
    const { error } = await supabase.from('school_reviews').delete().eq('id', id);
    if (error) { alert(`刪除失敗：${error.message}`); return; }
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const deleteListing = async (l: Listing) => {
    if (!confirm('確定刪除這則貼文？照片會一併移除，此動作無法復原。')) return;
    await Promise.all(l.photo_urls.map((u) => deletePhoto(u).catch(() => null)));
    const { error } = await supabase.from('listings').delete().eq('id', l.id);
    if (error) { alert(`刪除失敗：${error.message}`); return; }
    setListings((prev) => prev.filter((x) => x.id !== l.id));
  };

  if (loading) return <div className="text-sm text-content-muted">載入中…</div>;
  if (err) return <div className="text-sm text-state-danger">載入失敗：{err}</div>;

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h2 className="text-lg font-medium">我的評價（{reviews.length}）</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-content-muted">
            還沒有發表過評價。
            <Link to="/schools" className="ml-1 underline">去看看學校列表</Link>
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="card flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link to={`/schools/${r.school_id}`} className="text-sm font-medium">
                    {schoolName(r.school_id)}
                  </Link>
                  <div className="mt-1 text-xs text-brand-gold">
                    整體 {'★'.repeat(r.stars.overall)}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-content-secondary">
                    {r.comment_text}
                  </p>
                  <p className="mt-1 text-xs text-content-muted">
                    {new Date(r.created_at).toLocaleDateString('zh-Hant')}
                  </p>
                </div>
                <button
                  onClick={() => deleteReview(r.id)}
                  className="btn-danger text-xs px-2 py-1 shrink-0"
                >
                  刪除
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">我的佈告欄貼文（{listings.length}）</h2>
        {listings.length === 0 ? (
          <p className="text-sm text-content-muted">
            還沒有刊登過貼文。
            <Link to="/board" className="ml-1 underline">去佈告欄刊登</Link>
          </p>
        ) : (
          <div className="space-y-3">
            {listings.map((l) => (
              <div key={l.id} className="card flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="px-2 py-0.5 rounded bg-brand-gold/15 text-brand-burgundy text-xs font-medium">
                    {LISTING_TYPE_LABEL[l.type]}
                  </span>
                  <p className="mt-1 text-sm font-medium text-content-primary">{l.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-content-secondary">
                    {l.description}
                  </p>
                  <p className="mt-1 text-xs text-content-muted">
                    {new Date(l.created_at).toLocaleDateString('zh-Hant')} · 有效至{' '}
                    {new Date(l.expires_at).toLocaleDateString('zh-Hant')}
                    {l.photo_urls.length > 0 && ` · ${l.photo_urls.length} 張照片`}
                  </p>
                </div>
                <button
                  onClick={() => deleteListing(l)}
                  className="btn-danger text-xs px-2 py-1 shrink-0"
                >
                  刪除
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function MyPosts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-content-primary">我的發文</h1>
        <p className="mt-1 text-sm text-content-secondary">
          管理你發布過的評價與貼文。刪除為永久動作（資料庫層級刪除），無法復原。
        </p>
      </div>
      <AuthGate message="請先登入才能查看自己的發文。">
        <MyPostsContent />
      </AuthGate>
    </div>
  );
}
