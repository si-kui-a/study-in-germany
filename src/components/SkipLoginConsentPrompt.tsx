import { useEffect, useState } from 'react';
import { useAuth } from '../lib/useAuth';
import { hasSkippedOnboardingBefore } from '../lib/onboarding';
import { useRegisteredUserCount } from '../lib/useRegisteredUserCount';
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
 * Phase BL 修正：Home.tsx 的 OnboardingModal 掛在 <Routes> 內，SPA 導覽
 * 離開又切回「/」時會重新掛載、其 onboardingOpen state 重置為初始值，
 * 使用者若再次關閉它會再次觸發 notifyOnboardingModalClosed()——若本元件
 * 只靠 `open` 這顆 state 判斷，會被這第二次事件重新打開，違反「同一次
 * 頁面載入期間關閉後不再重複出現」的需求。改用獨立的 `dismissedThisLoad`
 * state 記錄「本次頁面載入內是否已手動關閉過」，關閉時一併設為 true，
 * 事件處理常式檢查此旗標而非只看 `open`；此旗標同樣是純 React state，
 * 不寫入任何 Storage，瀏覽器真正重新整理時隨整個 App 重新掛載而重置
 * （見 PAT-173）。
 *
 * GDPR 第 7(4) 條考量：checkbox 預設未勾選，未勾選時 Google 登入按鈕為
 * 真正的 disabled（原生 disabled 屬性，非僅視覺變灰，瀏覽器層級阻擋
 * click 事件），勾選後才可登入；彈窗本身可隨時關閉，不做成無法關閉的
 * 強制牆。
 */
export default function SkipLoginConsentPrompt() {
  const { user, signInWithGoogle } = useAuth();
  const [open, setOpen] = useState(false);
  const [dismissedThisLoad, setDismissedThisLoad] = useState(false);
  const [agreed, setAgreed] = useState(false);
  // Phase BL：複用 Phase BK 建立的 useRegisteredUserCount，查詢完成前
  // （loading 或 count 尚為 null）不插入該句，避免顯示 undefined/0 等
  // 錯誤過渡值（見 PAT-173）
  const { count, loading: countLoading } = useRegisteredUserCount();

  useEffect(() => {
    const handler = () => {
      if (!dismissedThisLoad && !user && hasSkippedOnboardingBefore()) {
        setOpen(true);
      }
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, [user, dismissedThisLoad]);

  const visible = open && !user;

  const handleClose = () => {
    setOpen(false);
    setDismissedThisLoad(true);
  };

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center
                 bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
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
          onClick={handleClose}
          aria-label="關閉"
          className="absolute top-3 right-3 text-content-muted hover:text-content-primary
                     transition-colors p-1"
        >
          ✕
        </button>

        <h2
          id="skip-login-consent-prompt-title"
          className="text-lg font-semibold text-content-primary mb-1"
        >
          登入即可儲存你的進度、留言與追蹤
        </h2>

        {!countLoading && count !== null && (
          <p className="text-xs text-content-muted mb-4">
            已有 {count} 人註冊，一起加入。
          </p>
        )}

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
