import { useEffect } from 'react';
import BoardForm from './BoardForm';
import AuthGate from './AuthGate';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export default function PostModal({ open, onClose, onSubmitted }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center
                 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto
                   bg-surface-canvas rounded-t-2xl sm:rounded-2xl
                   border border-border-subtle shadow-xl
                   p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-content-primary">
            刊登新貼文
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       hover:bg-surface-hover text-content-muted"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <AuthGate message="請先登入才能刊登討論區貼文。">
          <BoardForm
            onSubmitted={() => {
              onSubmitted?.();
              onClose();
            }}
          />
        </AuthGate>
      </div>
    </div>
  );
}
