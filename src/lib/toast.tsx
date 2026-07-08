import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type ToastKind = 'info' | 'success' | 'error';
interface Toast { id: number; kind: ToastKind; message: string; }

const ToastContext = createContext<{
  push: (kind: ToastKind, message: string) => void;
} | null>(null);

let seq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = ++seq;
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 max-w-sm"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`card text-sm shadow-none border-2 ${
              t.kind === 'error'
                ? 'border-state-danger text-state-danger'
                : t.kind === 'success'
                ? 'border-state-success text-state-success'
                : 'border-brand-burgundy text-content-primary'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
