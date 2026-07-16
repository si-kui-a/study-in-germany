import { useEffect, useState } from 'react';
import { useAuth } from '../lib/useAuth';
import { hasSkippedOnboardingBefore } from '../lib/onboarding';
import PrivacyNotice from './PrivacyNotice';

const EVENT_NAME = 'onboarding-modal-closed';

/** Home.tsx 的 OnboardingModal onClose 呼叫此函式，通知導覽視窗已關閉
 * （不論是選定階段完成或略過關閉），本元件監聽後自行判斷是否要顯示 */
export function notifyOnboardingModalClosed(): void {
  window.dispatchEvent(new Event(EVENT_NAME));
}

/**
 * Phase BA · 未登入者「曾略過導覽」後，每次造訪皆重新彈出的登入＋隱私同意
 * 提示（推翻 AX Path B 的「略過→永久不再彈」設計，見 PAT-161 完整決策記錄）。
 *
 * 掛載於 App.tsx 根層級（沿用 AX 建立的 window CustomEvent 架構，見
 * PostOnboardingLoginPrompt.tsx 的既有說明），監聽 OnboardingModal 關閉
 * 事件，關閉後才檢查是否要顯示——確保與導覽視窗依序出現而非同時疊加。
 *
 * 與 AX 既有的 PostOnboardingLoginPrompt（Path A，選定階段觸發，dismiss-
 * once-永久）是兩個獨立元件，互不影響：本元件只在 has_skipped_onboarding_
 * before 為 true 且未登入時才顯示，且**不可永久略過**——關閉（X／ESC／
 * 背景點擊）僅本次造訪不再重複彈出，不寫入任何永久旗標，下次整頁載入依
 * 條件重新觸發，直到使用者登入為止。
 *
 * GDPR 第 7(4) 條考量：checkbox 預設未勾選，未勾選時 Google 登入按鈕為
 * 真正的 disabled（原生 disabled 屬性，非僅視覺變灰，瀏覽器層級阻擋
 * click 事件），勾選後才可登入；彈窗本身可隨時關閉，不做成無法關閉的
 * 強制牆。
 */
export default function SkipLoginConsentPrompt() {
  const { user, signInWithGoogle } = useAuth();
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (!user && hasSkippedOnboardingBefore()) {
        setOpen(true);
      }
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, [user]);

  const visible = open && !user;

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center
                 bg-black/40 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="skip-login-consent-prompt-title"
        className="relative w-full sm:max-w-md bg-surface-canvas rounded-t-2xl sm:rounded-2xl
                   border border-border-subtle shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="關閉"
          className="absolute top-3 right-3 text-content-muted hover:text-content-primary
                     transition-colors p-1"
        >
          ✕
        </button>

        <h2
          id="skip-login-consent-prompt-title"
          className="text-lg font-semibold text-content-primary mb-4"
        >
          登入即可儲存你的進度、留言與追蹤
        </h2>

        <div className="space-y-3">
          <PrivacyNotice checked={agreed} onChange={setAgreed} variant="login" />
          <button
            type="button"
            disabled={!agreed}
            onClick={() => signInWithGoogle()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Google 登入
          </button>
        </div>
      </div>
    </div>
  );
}
