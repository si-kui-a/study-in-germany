import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthGate from '../components/AuthGate';
import EmptyState from '../components/EmptyState';
import { SkeletonList } from '../components/Skeleton';
import { useToast } from '../lib/toast';
import { translateError } from '../lib/errorMessages';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import type { Listing, School, SchoolReview } from '../lib/types';
import { deletePhoto } from '../lib/storage';
import { EXPIRY_DAYS, BOARD_TYPE_LABEL, boardTypeOf } from '../lib/board';
import schools from '../data/schools.json';
import { MOCK_MODE, mockLog } from '../lib/mockMode';

function schoolName(schoolId: string): string {
  return (schools as School[]).find((s) => s.id === schoolId)?.name_zh ?? schoolId;
}

function MyPostsContent() {
  const { user } = useAuth();
  const { push } = useToast();
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
      const friendly = translateError(reviewsRes.error ?? listingsRes.error);
      setErr(friendly.message);
      push('error', `讀取發文失敗：${friendly.message}`);
      console.error('[MyPosts] raw:', friendly.raw, 'code:', friendly.code);
      setLoading(false);
      return;
    }
    setReviews((reviewsRes.data ?? []) as SchoolReview[]);
    setListings((listingsRes.data ?? []) as Listing[]);
    setLoading(false);
  }, [user, push]);

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

  const renewListing = async (l: Listing) => {
    const newExpiresAt = new Date(
      Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();
    const { error } = await supabase
      .from('listings')
      .update({ expires_at: newExpiresAt })
      .eq('id', l.id);
    if (error) { alert(`續期失敗：${error.message}`); return; }
    setListings((prev) =>
      prev.map((x) => (x.id === l.id ? { ...x, expires_at: newExpiresAt } : x))
    );
  };

  if (loading) return <SkeletonList n={2} />;
  if (err) return <div className="text-sm text-state-danger">載入失敗：{err}</div>;

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h2 className="text-lg font-medium">我的語校評價（{reviews.length}）</h2>
        {reviews.length === 0 ? (
          <EmptyState
            title="尚未發表評價"
            description="於語校詳情頁留下你的第一則心得。"
            action={
              <Link to="/schools" className="btn-ghost no-underline inline-flex text-xs">
                去看看學校列表
              </Link>
            }
          />
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
          <EmptyState
            title="尚未刊登貼文"
            description="出租、求租或二手交易資訊都可在佈告欄刊登。"
            action={
              <Link to="/board" className="btn-ghost no-underline inline-flex text-xs">
                去佈告欄刊登
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {listings.map((l) => (
              <div key={l.id} className="card flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="px-2 py-0.5 rounded bg-brand-gold/15 text-brand-burgundy text-xs font-medium">
                    {BOARD_TYPE_LABEL[boardTypeOf(l)]}
                  </span>
                  <p className="mt-1 text-sm font-medium text-content-primary">{l.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-content-secondary">
                    {l.description}
                  </p>
                  <p className="mt-1 text-xs text-content-muted">
                    {new Date(l.created_at).toLocaleDateString('zh-Hant')}
                    {l.expires_at
                      ? ` · 有效至 ${new Date(l.expires_at).toLocaleDateString('zh-Hant')}`
                      : ' · 永久保留'}
                    {l.photo_urls.length > 0 && ` · ${l.photo_urls.length} 張照片`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {l.expires_at && (
                    <button
                      type="button"
                      onClick={() => renewListing(l)}
                      className="text-xs text-brand-burgundy hover:text-brand-burgundy-hover"
                    >
                      續期 {EXPIRY_DAYS} 天
                    </button>
                  )}
                  <button
                    onClick={() => deleteListing(l)}
                    className="btn-danger text-xs px-2 py-1"
                  >
                    刪除
                  </button>
                </div>
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
