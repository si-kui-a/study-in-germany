import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { fetchWithRetry } from './fetchWithRetry';
import { translateError } from './errorMessages';
import { useToast } from './toast';

/**
 * Follow 狀態管理 · 單一目標使用者
 */
export function useFollow(targetUserId: string | null, currentUserId: string | null) {
  const { push } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const { count } = await fetchWithRetry(
      () => supabase
        .from('user_follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', targetUserId)
        .retry(false),
      { table: 'user_follows', source: 'useFollow.followerCount' },
    );
    setFollowerCount(count ?? 0);

    if (currentUserId) {
      const { data } = await fetchWithRetry(
        () => supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', currentUserId)
          .eq('following_id', targetUserId)
          .maybeSingle()
          .retry(false),
        { table: 'user_follows', source: 'useFollow.isFollowing' },
      );
      setIsFollowing(!!data);
    }

    setLoading(false);
  }, [targetUserId, currentUserId]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggleFollow = async () => {
    if (!currentUserId || !targetUserId || busy) return;
    setBusy(true);

    if (isFollowing) {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);

      if (error) {
        const f = translateError(error);
        push('error', f.message);
      } else {
        setIsFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
      }
    } else {
      const { error } = await supabase
        .from('user_follows')
        .insert({ follower_id: currentUserId, following_id: targetUserId });

      if (error) {
        const f = translateError(error);
        push('error', f.message);
      } else {
        setIsFollowing(true);
        setFollowerCount((c) => c + 1);
        push('success', '已追蹤');
      }
    }

    setBusy(false);
  };

  return { isFollowing, followerCount, loading, busy, toggleFollow };
}

/**
 * 取得使用者追蹤中的 following_id 清單（用於動態牆查詢）
 */
export function useFollowingList(userId: string | null) {
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    (async () => {
      const { data } = await fetchWithRetry(
        () => supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', userId)
          .retry(false),
        { table: 'user_follows', source: 'useFollowingList' },
      );

      setFollowingIds((data ?? []).map((d) => d.following_id));
      setLoading(false);
    })();
  }, [userId]);

  return { followingIds, loading };
}
