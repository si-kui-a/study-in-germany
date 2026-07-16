import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import {
  PERSONA_STAGE_LABELS,
  PERSONA_MODULE_MAP,
  markOnboardingCompleted,
  markSkippedOnboardingBefore,
  setLocalPersonaStage,
} from '../lib/onboarding';
import type { PersonaStage } from '../lib/onboarding';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Phase AX：僅在使用者「選定階段」完成導覽時觸發，略過導覽（skip）不觸發 */
  onStageSelected?: () => void;
}

type Step = 'stage' | 'closing';

/**
 * DS v4.2 · 新手導覽（精簡版）
 * Step 1 階段判斷 → Step 5 收尾，中間跳過期限/推播（功能本體未建）
 */
export default function OnboardingModal({ open, onClose, onStageSelected }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('stage');
  const [selectedStage, setSelectedStage] = useState<PersonaStage | null>(null);

  /** Phase BA：略過導覽的統一出口——略過按鈕／ESC／背景點擊／關閉 X 皆走這裡，
   * 一律寫入 has_skipped_onboarding_before 永久旗標（見 PAT-161）。與
   * handleFinish（選定階段完成）路徑完全分開，不影響 AX 既有 Path A 邏輯 */
  const handleSkipClose = () => {
    markOnboardingCompleted();
    markSkippedOnboardingBefore();
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkipClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const handleSelectStage = async (stage: PersonaStage | 'skip') => {
    if (stage === 'skip') {
      handleSkipClose();
      return;
    }

    setSelectedStage(stage);
    setLocalPersonaStage(stage);

    if (user) {
      await supabase.from('profiles').update({ persona_stage: stage }).eq('id', user.id);
    }

    setStep('closing');
  };

  const handleFinish = () => {
    markOnboardingCompleted();
    onClose();
    if (selectedStage) {
      onStageSelected?.();
      navigate(`/edu/${PERSONA_MODULE_MAP[selectedStage]}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center
                    bg-black/40 backdrop-blur-sm" onClick={handleSkipClose}>
      <div
        className="relative w-full sm:max-w-md bg-surface-canvas rounded-t-2xl sm:rounded-2xl
                   border border-border-subtle shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Phase BA：關閉 X（略過導覽的其中一種出口，見 handleSkipClose） */}
        <button
          type="button"
          onClick={handleSkipClose}
          aria-label="關閉"
          className="absolute top-3 right-3 text-content-muted hover:text-content-primary
                     transition-colors p-1"
        >
          ✕
        </button>

        {step === 'stage' && (
          <>
            <h2 className="text-lg font-semibold text-content-primary mb-1">
              你目前在哪個階段？
            </h2>
            <p className="text-xs text-content-muted mb-4">
              我們會幫你把最相關的內容放在前面
            </p>
            <div className="space-y-2">
              {(Object.keys(PERSONA_STAGE_LABELS) as PersonaStage[]).map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => handleSelectStage(stage)}
                  className="w-full text-left p-3 rounded-lg border border-border-subtle
                             hover:border-brand-gold transition-colors"
                >
                  <div className="text-sm font-medium text-content-primary">
                    {PERSONA_STAGE_LABELS[stage].label}
                  </div>
                  <div className="text-xs text-content-muted mt-0.5">
                    {PERSONA_STAGE_LABELS[stage].hint}
                  </div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleSelectStage('skip')}
              className="w-full mt-3 text-xs text-content-muted hover:text-content-secondary"
            >
              跳過，直接瀏覽
            </button>
          </>
        )}

        {step === 'closing' && selectedStage && (
          <>
            <h2 className="text-lg font-semibold text-content-primary mb-2">
              好的，我們幫你安排好了
            </h2>
            <p className="text-sm text-content-secondary mb-4">
              之後可以隨時從導覽列「作戰手冊」回到這裡，
              或於「我的資料」頁面重新設定你的階段。
            </p>
            <button
              type="button"
              onClick={handleFinish}
              className="btn-primary w-full"
            >
              開始瀏覽
            </button>
          </>
        )}
      </div>
    </div>
  );
}
