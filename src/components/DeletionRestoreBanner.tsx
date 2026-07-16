import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { fetchWithRetry } from '../lib/fetchWithRetry';
import { useAuth } from '../lib/useAuth';
import { useToast } from '../lib/toast';
import {
  computeDeletionStatus, restoreAccount, finalizeDeletion,
} from '../lib/deleteAccount';

interface Status {
  isPendingDeletion: boolean;
  daysRemaining: number;
}

/**
 * DS v4.2 · 帳號恢復橫幅
 * 登入時若偵測到 deletion_requested_at 在 7 天寬限期內，顯示於頁面頂部
 * 掛載於 App.tsx，全站可見
 */
export default function DeletionRestoreBanner() {
  const { user } = useAuth();
  const { push } = useToast();
  const [status, setStatus] = useState<Status | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const { data } = await fetchWithRetry(
        () => supabase
          .from('profiles')
          .select('deletion_requested_at')
          .eq('id', user.id)
          .single()
          .retry(false),
        { table: 'profiles', source: 'DeletionRestoreBanner' },
      );

      const s = computeDeletionStatus(data?.deletion_requested_at ?? null);

      if (s.isPendingDeletion) {
        setStatus(s);
      } else if (data?.deletion_requested_at) {
        // 過期未恢復 · 靜默定案
        await finalizeDeletion(user.id);
      }
    })();
  }, [user]);

  if (!user || !status?.isPendingDeletion || dismissed) return null;

  const googleName = (user.user_metadata?.full_name as string | undefined) ?? null;
  const googleAvatar = (user.user_metadata?.avatar_url as string | undefined) ??
                        (user.user_metadata?.picture as string | undefined) ?? null;

  const handleRestore = async () => {
    setBusy(true);
    const result = await restoreAccount(user.id, googleName, googleAvatar);
    setBusy(false);

    if (!result.success) {
      push('error', '恢復失敗，請稍後再試');
      // eslint-disable-next-line no-console
      console.error('[DeletionRestoreBanner] restore failed:', result.error);
      return;
    }

    push('success', '帳號已恢復');
    setStatus(null);
    // 重新整理頁面讓全站狀態更新
    window.location.reload();
  };

  return (
    <div className="bg-brand-gold-soft border-b border-brand-gold/30 px-4 py-3">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-content-primary">
          ⚠️ 你的帳號目前處於刪除寬限期（還剩 <strong>{status.daysRemaining}</strong> 天）。
          若這是誤操作，可以恢復帳號。
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRestore}
            disabled={busy}
            className="text-sm px-3 py-1.5 rounded-lg bg-brand-burgundy text-white
                       disabled:opacity-50"
          >
            {busy ? '恢復中…' : '恢復帳號'}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-sm px-3 py-1.5 rounded-lg border border-border-subtle
                       text-content-secondary"
          >
            維持刪除狀態
          </button>
        </div>
      </div>
    </div>
  );
}
