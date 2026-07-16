import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { fetchWithRetry } from './fetchWithRetry';
import type { Listing } from './types';

export interface HotListing extends Listing {
  like_count: number;
  comment_count: number;
}

/**
 * 熱門討論區 hook（Phase BB，見 PAT-162）
 * 排序：按讚數 desc → 留言數 desc → 建立時間 desc。
 * listing_likes/listing_comments 皆為 public schema 表（非 auth.users FK），
 * 沿用 useHotSchools 的「整表撈回＋client 端聚合排序」模式，僅現有表 SELECT，
 * 不建新表/新欄位。
 * Phase BC：3 個讀取皆改用 fetchWithRetry；首頁裝飾性輪播，重試耗盡後維持
 * 既有的靜默失敗行為（hot 保持空陣列，HotBoardCarousel 直接不顯示區塊），
 * 不新增可見的錯誤 UI（見 PAT-163）。
 */
export function useHotListings() {
  const [hot, setHot] = useState<HotListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [listingsRes, likesRes, commentsRes] = await Promise.all([
        fetchWithRetry(
          () => supabase.from('listings').select('*').order('created_at', { ascending: false }).retry(false),
          { table: 'listings', source: 'useHotListings' },
        ),
        fetchWithRetry(
          () => supabase.from('listing_likes').select('listing_id').retry(false),
          { table: 'listing_likes', source: 'useHotListings' },
        ),
        fetchWithRetry(
          () => supabase.from('listing_comments').select('listing_id').retry(false),
          { table: 'listing_comments', source: 'useHotListings' },
        ),
      ]);
      if (listingsRes.error || !listingsRes.data) {
        setLoading(false);
        return;
      }

      const likeCounts = new Map<number, number>();
      for (const row of likesRes.data ?? []) {
        likeCounts.set(row.listing_id, (likeCounts.get(row.listing_id) ?? 0) + 1);
      }
      const commentCounts = new Map<number, number>();
      for (const row of commentsRes.data ?? []) {
        commentCounts.set(row.listing_id, (commentCounts.get(row.listing_id) ?? 0) + 1);
      }

      const enriched: HotListing[] = (listingsRes.data as Listing[]).map((l) => ({
        ...l,
        like_count: likeCounts.get(l.id) ?? 0,
        comment_count: commentCounts.get(l.id) ?? 0,
      }));
      enriched.sort((a, b) =>
        b.like_count - a.like_count
        || b.comment_count - a.comment_count
        || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setHot(enriched);
      setLoading(false);
    })();
  }, []);

  return { hot, loading };
}
