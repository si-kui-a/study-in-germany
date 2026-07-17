import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { fetchWithRetry } from './fetchWithRetry';

/**
 * 支持本站頁「目前已註冊人數」統計（Phase BK，見 PAT-172）。
 *
 * 用 COUNT(*) 而非 MAX(registration_seq)：帳號刪除流程（PAT-94/95）僅
 * UPDATE 匿名化 display_name/avatar_url，profiles 列本身從不被移除，
 * 現行資料 COUNT(*) 與 MAX(registration_seq) 剛好相等；但若日後有
 * 任何非本站既有流程的手動移除列（如後台直接刪除），MAX(registration_seq)
 * 會因序號不連續而失真高估，COUNT(*) 才是任何情況下都準確的即時人數。
 */
export function useRegisteredUserCount() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { count: total } = await fetchWithRetry(
        () => supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .retry(false),
        { table: 'profiles', source: 'useRegisteredUserCount' },
      );
      if (!cancelled) {
        setCount(total ?? null);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { count, loading };
}
