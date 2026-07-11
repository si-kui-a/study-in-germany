import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface ContributionCounts {
  reviews: number;
  listings: number;
  submissions: number;
  totalContributions: number;
}

/**
 * 統計使用者在各版面的貢獻
 * Phase K-1 建置 · Phase K-2 用於徽章判定
 */
export function useContributions(userId: string | null) {
  const [counts, setCounts] = useState<ContributionCounts>({
    reviews: 0,
    listings: 0,
    submissions: 0,
    totalContributions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    (async () => {
      const [reviewsRes, listingsRes, submissionsRes] = await Promise.all([
        supabase
          .from('school_reviews')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('listings')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('user_submissions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
      ]);

      const reviews = reviewsRes.count ?? 0;
      const listings = listingsRes.count ?? 0;
      const submissions = submissionsRes.count ?? 0;

      setCounts({
        reviews,
        listings,
        submissions,
        totalContributions: reviews + listings + submissions,
      });
      setLoading(false);
    })();
  }, [userId]);

  return { counts, loading };
}
