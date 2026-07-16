import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { fetchWithRetry } from './fetchWithRetry';
import schoolsData from '../data/schools.json';
import type { School } from './types';

export interface HotSchool extends School {
  review_count: number;
  avg_overall: number | null;
}

/**
 * 熱門語校 hook · 排序按評價數 desc（決策 4 鎖定）
 * 對每校聚合 review 數與平均 overall。
 * 無評價的語校 review_count=0 也回傳，UI 端可選擇是否顯示。
 */
export function useHotSchools() {
  const [hot, setHot] = useState<HotSchool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await fetchWithRetry(
        () => supabase.from('school_reviews').select('school_id, stars').retry(false),
        { table: 'school_reviews', source: 'useHotSchools' },
      );
      if (error) {
        setLoading(false);
        return;
      }
      const counts = new Map<string, { count: number; sum: number }>();
      for (const r of data ?? []) {
        const overall =
          typeof r.stars === 'object' && r.stars !== null
            ? Number((r.stars as { overall?: number }).overall) || 0
            : 0;
        const prev = counts.get(r.school_id) ?? { count: 0, sum: 0 };
        counts.set(r.school_id, {
          count: prev.count + 1,
          sum: prev.sum + overall,
        });
      }
      const enriched: HotSchool[] = (schoolsData as School[]).map((s) => {
        const c = counts.get(s.id);
        return {
          ...s,
          review_count: c?.count ?? 0,
          avg_overall: c && c.count > 0 ? Math.round((c.sum / c.count) * 10) / 10 : null,
        };
      });
      enriched.sort((a, b) => b.review_count - a.review_count);
      setHot(enriched);
      setLoading(false);
    })();
  }, []);

  return { hot, loading };
}
