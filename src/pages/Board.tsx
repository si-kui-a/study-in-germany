import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Listing } from '../lib/types';
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
import type { BoardType } from '../lib/board';

type Filter = 'all' | BoardType;

export default function Board() {
  const { push } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

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
    setListings((data ?? []) as Listing[]);
    setLoading(false);
  }, [push]);

  useEffect(() => { load(); }, [load]);

  const filtered = listings.filter((l) => {
    if (filter === 'all') return true;
    if (filter === 'discussion') return isDiscussion(l);
    if (isDiscussion(l)) return false;
    return boardTypeOf(l) === filter;
  });

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'secondhand', label: BOARD_TYPE_LABEL.secondhand },
    { key: 'rental_offer', label: BOARD_TYPE_LABEL.rental_offer },
    { key: 'rental_seek', label: BOARD_TYPE_LABEL.rental_seek },
    { key: 'discussion', label: BOARD_TYPE_LABEL.discussion },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">生活佈告欄</h1>
        <p className="text-sm text-content-secondary mt-1">
          二手交易、出租、求租、討論區。貼文預設 60 天後自動下架。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              filter === f.key
                ? 'border-brand-burgundy text-brand-burgundy bg-brand-burgundy/5'
                : 'border-border-subtle text-content-secondary hover:border-border-strong'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section>
        {loading ? (
          <SkeletonList n={3} />
        ) : err ? (
          <div className="text-sm text-state-danger">讀取失敗：{err}</div>
        ) : listings.length === 0 ? (
          <EmptyState
            icon={<BoardIcon className="w-full h-full" />}
            title="目前沒有貼文"
            description="登入後可刊登第一則出租、求租或二手交易資訊。"
          />
        ) : (
          <BoardList listings={filtered} onDeleted={load} />
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
