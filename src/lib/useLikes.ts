import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { fetchWithRetry } from './fetchWithRetry';
import { translateError } from './errorMessages';
import { useToast } from './toast';

export function useLikes(listingId: string, currentUserId: string | null) {
  const { push } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const { count } = await fetchWithRetry(
      () => supabase
        .from('listing_likes')
        .select('id', { count: 'exact', head: true })
        .eq('listing_id', listingId)
        .retry(false),
      { table: 'listing_likes', source: 'useLikes.count' },
    );
    setLikeCount(count ?? 0);

    if (currentUserId) {
      const { data } = await fetchWithRetry(
        () => supabase
          .from('listing_likes')
          .select('id')
          .eq('listing_id', listingId)
          .eq('user_id', currentUserId)
          .maybeSingle()
          .retry(false),
        { table: 'listing_likes', source: 'useLikes.isLiked' },
      );
      setIsLiked(!!data);
    }
    setLoading(false);
  }, [listingId, currentUserId]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggleLike = async () => {
    if (!currentUserId || busy) return;
    setBusy(true);

    if (isLiked) {
      const { error } = await supabase
        .from('listing_likes')
        .delete()
        .eq('listing_id', listingId)
        .eq('user_id', currentUserId);
      if (error) {
        push('error', translateError(error).message);
      } else {
        setIsLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      }
    } else {
      const { error } = await supabase
        .from('listing_likes')
        .insert({ listing_id: listingId, user_id: currentUserId });
      if (error) {
        push('error', translateError(error).message);
      } else {
        setIsLiked(true);
        setLikeCount((c) => c + 1);
      }
    }
    setBusy(false);
  };

  return { isLiked, likeCount, loading, busy, toggleLike };
}
