import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Listing, SchoolReview } from '../lib/types';
import { attachProfiles } from '../lib/types';
import BoardList from '../components/BoardList';
import ReviewList from '../components/ReviewList';
import PostModal from '../components/PostModal';
import FloatingActionButton from '../components/FloatingActionButton';
import EmptyState from '../components/EmptyState';
import { SkeletonList } from '../components/Skeleton';
import BoardIcon from '../assets/icons/BoardIcon';
import { useToast } from '../lib/toast';
import { translateError } from '../lib/errorMessages';
import { useAuth } from '../lib/useAuth';
import { useFollowingList } from '../lib/useFollow';
import { MOCK_MODE, mockLog } from '../lib/mockMode';
import { MOCK_LISTINGS } from '../lib/mockData';
import { boardTypeOf, isDiscussion, isRentalType, BOARD_TYPE_LABEL } from '../lib/board';
import { fetchBadgesMap } from '../lib/badges';
import type { BadgeId } from '../lib/badges';

type ViewMode = 'all' | 'following' | 'mine';
type MineSubTab = 'reviews' | 'posts';

type MainFilter = 'all' | 'secondhand' | 'rental' | 'discussion';
type SubFilter =
  | 'all_discussion'
  | 'discussion'
  | 'discussion_study'
  | 'discussion_longterm'
  | 'discussion_food'
  | 'discussion_taiwan_restaurant'
  | 'all_rental'
  | 'rental_offer'
  | 'rental_seek';

const MAIN_FILTERS: { key: MainFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'secondhand', label: BOARD_TYPE_LABEL.secondhand },
  { key: 'rental', label: '租房' },
  { key: 'discussion', label: '討論' },
];

const SUB_FILTERS_RENTAL: { key: SubFilter; label: string }[] = [
  { key: 'all_rental', label: '全部租房' },
  { key: 'rental_offer', label: BOARD_TYPE_LABEL.rental_offer },
  { key: 'rental_seek', label: BOARD_TYPE_LABEL.rental_seek },
];

const SUB_FILTERS_DISCUSSION: { key: SubFilter; label: string }[] = [
  { key: 'all_discussion', label: '全部討論' },
  { key: 'discussion', label: '一般' },
  { key: 'discussion_study', label: '學習' },
  { key: 'discussion_longterm', label: '長居' },
  { key: 'discussion_food', label: '美食' },
  { key: 'discussion_taiwan_restaurant', label: '台灣餐廳' },
];

export default function Board() {
  const { push } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { followingIds, loading: followingLoading } = useFollowingList(user?.id ?? null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [badgesMap, setBadgesMap] = useState<Map<string, BadgeId[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [myReviews, setMyReviews] = useState<SchoolReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [mainFilter, setMainFilter] = useState<MainFilter>('all');
  const [subFilter, setSubFilter] = useState<SubFilter>('all_discussion');
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const v = searchParams.get('view');
    if (v === 'following' || v === 'mine') return v;
    return 'all';
  });
  const [mineSubTab, setMineSubTab] = useState<MineSubTab>(() =>
    searchParams.get('sub') === 'reviews' ? 'reviews' : 'posts'
  );

  // Phase AJ：新增 2 個深連結入口（Header「我的貼文」、Home Portal「我的資料」）後，
  // 若使用者已在 /board 上又點另一個 ?view= 深連結，HashRouter 不會重新掛載此元件，
  // 上面的 useState 初始值只在首次掛載時生效——故另加 effect 讓後續的 query 變化也能生效
  // Phase AK：一併支援 sub 參數（?view=mine&sub=reviews|posts），見 PAT-130
  useEffect(() => {
    const v = searchParams.get('view');
    if (v === 'following' || v === 'mine') {
      setViewMode(v);
    }
    const sub = searchParams.get('sub');
    if (sub === 'reviews' || sub === 'posts') {
      setMineSubTab(sub);
    }
  }, [searchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    if (MOCK_MODE) {
      mockLog('board', 'using MOCK_LISTINGS');
      setListings(MOCK_LISTINGS);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      const friendly = translateError(error);
      push('error', `讀取討論區失敗：${friendly.message}`);
      console.error('[Board] raw:', friendly.raw, 'code:', friendly.code);
      setLoading(false);
      return;
    }
    const withProfiles = await attachProfiles((data ?? []) as Listing[]);
    setListings(withProfiles);
    setBadgesMap(await fetchBadgesMap(withProfiles.map((l) => l.user_id)));
    setLoading(false);
  }, [push]);

  useEffect(() => { load(); }, [load]);

  // Phase AJ：「我的評價」viewMode 併入 MyPosts.tsx 原本的評價集中檢視功能
  // （PAT-129），與 listings 資料流互不相干，獨立 fetch
  const loadReviews = useCallback(async () => {
    if (!user) {
      setMyReviews([]);
      setReviewsLoading(false);
      return;
    }
    setReviewsLoading(true);
    if (MOCK_MODE) {
      mockLog('board', 'using empty MOCK data for my_reviews view');
      setMyReviews([]);
      setReviewsLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('school_reviews')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      const friendly = translateError(error);
      push('error', `讀取評價失敗：${friendly.message}`);
      console.error('[Board] loadReviews raw:', friendly.raw, 'code:', friendly.code);
      setReviewsLoading(false);
      return;
    }
    const withProfiles = await attachProfiles((data ?? []) as SchoolReview[]);
    setMyReviews(withProfiles);
    setReviewsLoading(false);
  }, [user, push]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  // Phase R：listings_public_read RLS 本輪改為 expires_at IS NULL OR ... OR
  // auth.uid() = user_id（見 schema.sql），本人自己已過期的商業類貼文會被
  // 查詢回傳（供「我的貼文」續期使用），但主列表不應顯示任何人的過期貼文
  // （含自己的），故於此另外做一層 client-side 過濾。
  const isExpired = (l: Listing) =>
    !!l.expires_at && new Date(l.expires_at).getTime() < Date.now();

  const visibleListings = listings.filter((l) => !isExpired(l));

  // Phase AE：「追蹤動態」為獨立於分類 filter 之外的檢視模式（用誰的角度看 vs
  // 內容屬於什麼類型，兩個不同維度可疊加），先依 viewMode 縮限範圍，分類 filter
  // 再疊加套用於這個縮限後的集合上
  // Phase AJ：「我的貼文」比照辦理，但源頭是未經到期過濾的 listings（而非
  // visibleListings），讓已過期的自己貼文仍能在此檢視/續期（PAT-129）
  const scopedListings =
    viewMode === 'following'
      ? visibleListings.filter((l) => followingIds.includes(l.user_id))
      : viewMode === 'mine'
        ? listings.filter((l) => user && l.user_id === user.id)
        : visibleListings;

  // 「我的貼文」不限分類，顯示自己的全部貼文，略過下方分類 filter
  const filtered =
    viewMode === 'mine'
      ? scopedListings
      : scopedListings.filter((l) => {
          if (mainFilter === 'all') return true;
          if (mainFilter === 'rental') {
            if (subFilter === 'all_rental') return isRentalType(boardTypeOf(l));
            return boardTypeOf(l) === subFilter;
          }
          if (mainFilter === 'discussion') {
            if (subFilter === 'all_discussion') return isDiscussion(l);
            return boardTypeOf(l) === subFilter;
          }
          if (isRentalType(boardTypeOf(l)) || isDiscussion(l)) return false;
          return boardTypeOf(l) === mainFilter;
        });

  const handleMainFilterClick = (key: MainFilter) => {
    setMainFilter(key);
    if (key === 'rental') setSubFilter('all_rental');
    if (key === 'discussion') setSubFilter('all_discussion');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">討論區</h1>
        <p className="text-sm text-content-secondary mt-1">
          二手交易、租房（出租／求租）、討論（一般／學習／長居／美食／台灣餐廳）。
          二手交易／租房 90 天後自動下架（可續期），討論類永久保留。
        </p>
      </div>

      {/* 檢視模式（用誰的角度看）· 與下方分類 filter（內容屬於什麼類型）為不同維度，見 PAT-123
          Phase AK：「我的貼文」「我的評價」重組為單一「我的」頂層分頁 + 子分類（見 PAT-130） */}
      <div className="flex gap-2 border-b border-border-subtle overflow-x-auto">
        <button
          onClick={() => setViewMode('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            viewMode === 'all'
              ? 'border-brand-burgundy text-brand-burgundy'
              : 'border-transparent text-content-muted hover:text-content-secondary'
          }`}
        >
          全部貼文
        </button>
        <button
          onClick={() => setViewMode('following')}
          disabled={!user}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
            viewMode === 'following'
              ? 'border-brand-burgundy text-brand-burgundy'
              : 'border-transparent text-content-muted hover:text-content-secondary'
          }`}
          title={!user ? '請先登入' : undefined}
        >
          追蹤動態
        </button>
        <button
          onClick={() => setViewMode('mine')}
          disabled={!user}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
            viewMode === 'mine'
              ? 'border-brand-burgundy text-brand-burgundy'
              : 'border-transparent text-content-muted hover:text-content-secondary'
          }`}
          title={!user ? '請先登入' : undefined}
        >
          我的
        </button>
      </div>

      {/* 「我的」子分類（語校評價/貼文）· 沿用租房/討論的 hierarchical sub-filter 樣式（PAT-73/PAT-103） */}
      {viewMode === 'mine' && (
        <div className="pl-4 border-l-2 border-brand-gold/30 flex flex-wrap gap-2">
          <button
            onClick={() => setMineSubTab('reviews')}
            className={`text-xs px-2.5 py-1 rounded transition-colors ${
              mineSubTab === 'reviews'
                ? 'text-brand-burgundy font-medium'
                : 'text-content-muted hover:text-content-secondary'
            }`}
          >
            語校評價
          </button>
          <button
            onClick={() => setMineSubTab('posts')}
            className={`text-xs px-2.5 py-1 rounded transition-colors ${
              mineSubTab === 'posts'
                ? 'text-brand-burgundy font-medium'
                : 'text-content-muted hover:text-content-secondary'
            }`}
          >
            貼文
          </button>
        </div>
      )}

      {/* 說明文字：原 MyPosts.tsx 頁首說明，Phase AK 移至「我的」分頁區塊內（PAT-130） */}
      {viewMode === 'mine' && (
        <p className="text-xs text-content-muted">
          管理你發布過的評價與貼文。刪除為永久動作（資料庫層級刪除），無法復原。
        </p>
      )}

      {/* 分類 filter 僅適用於「全部貼文」「追蹤動態」；「我的」不限分類，不顯示分類 filter */}
      {(viewMode === 'all' || viewMode === 'following') && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {MAIN_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => handleMainFilterClick(f.key)}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  mainFilter === f.key
                    ? 'border-brand-burgundy text-brand-burgundy bg-brand-burgundy/5'
                    : 'border-border-subtle text-content-secondary hover:border-border-strong'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {(mainFilter === 'rental' || mainFilter === 'discussion') && (
            <div className="pl-4 border-l-2 border-brand-gold/30 flex flex-wrap gap-2">
              {(mainFilter === 'rental' ? SUB_FILTERS_RENTAL : SUB_FILTERS_DISCUSSION).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setSubFilter(f.key)}
                  className={`text-xs px-2.5 py-1 rounded transition-colors ${
                    subFilter === f.key
                      ? 'text-brand-burgundy font-medium'
                      : 'text-content-muted hover:text-content-secondary'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <section>
        {viewMode === 'mine' && mineSubTab === 'reviews' ? (
          reviewsLoading ? (
            <SkeletonList n={3} />
          ) : !user ? (
            <EmptyState
              icon={<BoardIcon className="w-full h-full" />}
              title="請先登入"
              description="登入後即可查看你發表過的所有評價。"
            />
          ) : myReviews.length === 0 ? (
            <EmptyState
              icon={<BoardIcon className="w-full h-full" />}
              title="尚未發表評價"
              description="於語校詳情頁留下你的第一則心得。"
              action={
                <Link to="/schools" className="btn-ghost no-underline inline-flex text-xs">
                  去看看學校列表
                </Link>
              }
            />
          ) : (
            <ReviewList reviews={myReviews} onDeleted={loadReviews} showSchoolLink />
          )
        ) : loading || (viewMode === 'following' && followingLoading) ? (
          <SkeletonList n={3} />
        ) : viewMode === 'following' && !user ? (
          <EmptyState
            icon={<BoardIcon className="w-full h-full" />}
            title="請先登入"
            description="登入後即可查看你追蹤的人最新發布的貼文。"
          />
        ) : viewMode === 'mine' && !user ? (
          <EmptyState
            icon={<BoardIcon className="w-full h-full" />}
            title="請先登入"
            description="登入後即可管理你發布過的貼文。"
          />
        ) : viewMode === 'following' && followingIds.length === 0 ? (
          <EmptyState
            icon={<BoardIcon className="w-full h-full" />}
            title="你還沒有追蹤任何人"
            description="於評價或貼文旁點「+ 追蹤」開始關注其他使用者。"
          />
        ) : viewMode === 'following' && scopedListings.length === 0 ? (
          <EmptyState
            icon={<BoardIcon className="w-full h-full" />}
            title="你追蹤的人還沒有發佈貼文"
            description="持續關注，或切換回「全部貼文」瀏覽。"
          />
        ) : viewMode === 'mine' && scopedListings.length === 0 ? (
          <EmptyState
            icon={<BoardIcon className="w-full h-full" />}
            title="尚未刊登貼文"
            description="點擊右下角「+」發布你的第一則出租、求租或二手交易資訊。"
          />
        ) : viewMode === 'all' && visibleListings.length === 0 ? (
          <EmptyState
            icon={<BoardIcon className="w-full h-full" />}
            title="目前沒有貼文"
            description="登入後可刊登第一則出租、求租或二手交易資訊。"
          />
        ) : (
          <BoardList listings={filtered} onDeleted={load} onRenewed={load} badgesMap={badgesMap} />
        )}
      </section>

      <FloatingActionButton onClick={() => setPostModalOpen(true)} />
      <PostModal
        open={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        onSubmitted={load}
      />
    </div>
  );
}
