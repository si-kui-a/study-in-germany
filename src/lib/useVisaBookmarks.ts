import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { fetchWithRetry } from './fetchWithRetry';
import { translateError } from './errorMessages';
import { useToast } from './toast';
import { useAuth } from './useAuth';

/**
 * 選擇簽證收藏置頂（Phase BP，比照 useCardRatingsMap 的 auth-gate 模式）。
 *
 * visa_bookmarks 為使用者私人資料（RLS 僅本人可讀寫，無 public read），
 * 讀取套用 fetchWithRetry；寫入（收藏切換）不套用，依 PAT-150。
 */
export function useVisaBookmarks() {
  const { user, signInWithGoogle } = useAuth();
  const { push } = useToast();
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setBookmarkedIds(new Set());
      setLoading(false);
      return;
    }
    const { data, error } = await fetchWithRetry(
      () => supabase
        .from('visa_bookmarks')
        .select('visa_id')
        .eq('user_id', user.id)
        .retry(false),
      { table: 'visa_bookmarks', source: 'useVisaBookmarks' },
    );
    if (!error && data) {
      setBookmarkedIds(new Set((data as { visa_id: string }[]).map((r) => r.visa_id)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggleBookmark = async (visaId: string) => {
    if (!user) {
      push('info', '請先登入才能收藏');
      signInWithGoogle();
      return;
    }
    setBusyId(visaId);
    const isBookmarked = bookmarkedIds.has(visaId);
    const { error } = isBookmarked
      ? await supabase
          .from('visa_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('visa_id', visaId)
      : await supabase
          .from('visa_bookmarks')
          .insert({ user_id: user.id, visa_id: visaId });
    setBusyId(null);
    if (error) {
      push('error', translateError(error).message);
      return;
    }
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (isBookmarked) next.delete(visaId); else next.add(visaId);
      return next;
    });
  };

  return { bookmarkedIds, loading, busyId, toggleBookmark };
}
