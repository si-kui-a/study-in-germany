import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Listing } from '../lib/types';
import { attachProfiles } from '../lib/types';
import BoardList from '../components/BoardList';
import BoardForm from '../components/BoardForm';
import AuthGate from '../components/AuthGate';
import EmptyState from '../components/EmptyState';
import { SkeletonList } from '../components/Skeleton';
import BoardIcon from '../assets/icons/BoardIcon';
import { useToast } from '../lib/toast';
import { translateError } from '../lib/errorMessages';
import { MOCK_MODE, mockLog } from '../lib/mockMode';
import { MOCK_LISTINGS } from '../lib/mockData';
import { boardTypeOf, isDiscussion, BOARD_TYPE_LABEL } from '../lib/board';
import { fetchBadgesMap } from '../lib/badges';
import type { BadgeId } from '../lib/badges';

type MainFilter = 'all' | 'secondhand' | 'rental_offer' | 'rental_seek' | 'discussion';
type SubFilter =
  | 'all_discussion'
  | 'discussion'
  | 'discussion_study'
  | 'discussion_longterm'
  | 'discussion_food'
  | 'discussion_taiwan_restaurant';

const MAIN_FILTERS: { key: MainFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'secondhand', label: BOARD_TYPE_LABEL.secondhand },
  { key: 'rental_offer', label: BOARD_TYPE_LABEL.rental_offer },
  { key: 'rental_seek', label: BOARD_TYPE_LABEL.rental_seek },
  { key: 'discussion', label: '討論' },
];

const SUB_FILTERS: { key: SubFilter; label: string }[] = [
  { key: 'all_discussion', label: '全部討論' },
  { key: 'discussion', label: '一般' },
  { key: 'discussion_study', label: '學習' },
  { key: 'discussion_longterm', label: '長居' },
  { key: 'discussion_food', label: '美食' },
  { key: 'discussion_taiwan_restaurant', label: '台灣餐廳' },
];

export default function Board() {
  const { push } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [badgesMap, setBadgesMap] = useState<Map<string, BadgeId[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [mainFilter, setMainFilter] = useState<MainFilter>('all');
  const [subFilter, setSubFilter] = useState<SubFilter>('all_discussion');

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
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
      setErr(friendly.message);
      push('error', `讀取佈告欄失敗：${friendly.message}`);
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

  // Phase R：listings_public_read RLS 本輪改為 expires_at IS NULL OR ... OR
  // auth.uid() = user_id（見 schema.sql），本人自己已過期的商業類貼文會被
  // 查詢回傳（供 MyPosts 續期使用），但主列表不應顯示任何人的過期貼文
  // （含自己的），故於此另外做一層 client-side 過濾。
  const isExpired = (l: Listing) =>
    !!l.expires_at && new Date(l.expires_at).getTime() < Date.now();

  const visibleListings = listings.filter((l) => !isExpired(l));

  const filtered = visibleListings.filter((l) => {
    if (mainFilter === 'all') return true;
    if (mainFilter === 'discussion') {
      if (subFilter === 'all_discussion') return isDiscussion(l);
      return boardTypeOf(l) === subFilter;
    }
    if (isDiscussion(l)) return false;
    return boardTypeOf(l) === mainFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">生活佈告欄</h1>
        <p className="text-sm text-content-secondary mt-1">
          二手交易、出租、求租、討論（一般／學習／長居／美食／台灣餐廳）。
          二手交易／出租／求租 90 天後自動下架（可續期），討論類永久保留。
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {MAIN_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setMainFilter(f.key)}
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

        {mainFilter === 'discussion' && (
          <div className="pl-4 border-l-2 border-brand-gold/30 flex flex-wrap gap-2">
            {SUB_FILTERS.map((f) => (
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

      <section>
        {loading ? (
          <SkeletonList n={3} />
        ) : err ? (
          <div className="text-sm text-state-danger">讀取失敗：{err}</div>
        ) : visibleListings.length === 0 ? (
          <EmptyState
            icon={<BoardIcon className="w-full h-full" />}
            title="目前沒有貼文"
            description="登入後可刊登第一則出租、求租或二手交易資訊。"
          />
        ) : (
          <BoardList listings={filtered} onDeleted={load} onRenewed={load} badgesMap={badgesMap} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">刊登新貼文</h2>
        <AuthGate message="請先登入才能刊登佈告欄貼文。">
          <BoardForm onSubmitted={load} />
        </AuthGate>
      </section>
    </div>
  );
}
