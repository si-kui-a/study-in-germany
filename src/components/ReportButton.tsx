import { useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { translateError } from '../lib/errorMessages';
import { useToast } from '../lib/toast';
import { useAuth } from '../lib/useAuth';
import { communityActionBlockReason, recordCommunityAction } from '../lib/antiAbuse';

type TargetType = 'listing' | 'review' | 'submission';

interface Props {
  targetType: TargetType;
  targetId: string;
}

const REASON_LABELS: Record<string, string> = {
  spam: '垃圾廣告',
  inappropriate: '不當內容',
  misinformation: '不實資訊',
  harassment: '騷擾或攻擊',
  other: '其他',
};

export default function ReportButton({ targetType, targetId }: Props) {
  const { push } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('spam');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const signature = `${targetType}|${targetId}|${reason}`;
    const blocked = communityActionBlockReason('report', signature);
    if (blocked) {
      push('error', blocked);
      return;
    }
    setSubmitting(true);

    const { error } = await supabase.from('reports').insert({
      target_type: targetType,
      target_id: targetId,
      reporter_id: user?.id ?? null,
      reason,
      note: note.trim() || null,
    });

    setSubmitting(false);

    if (error) {
      const f = translateError(error);
      push('error', f.message);
      // eslint-disable-next-line no-console
      console.error('[ReportButton] insert failed:', f.raw);
      return;
    }

    setSubmitted(true);
    recordCommunityAction('report', signature);
    push('success', '已收到檢舉，我們會盡快處理');
    setTimeout(() => setOpen(false), 1500);
  };

  if (submitted) {
    return (
      <span className="text-xs text-content-muted">已檢舉</span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs text-content-muted hover:text-state-danger transition-colors"
      >
        🚩 檢舉
      </button>

      {open && (
        <div className="absolute z-50 top-full right-0 mt-1 w-64
                        bg-surface-card border border-border-subtle rounded-lg
                        shadow-lg p-3 space-y-2">
          <form onSubmit={submit} className="space-y-2">
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs px-2 py-1.5 rounded border border-border-subtle
                         bg-surface-canvas text-content-primary"
            >
              {Object.entries(REASON_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="補充說明（選填）"
              rows={2}
              maxLength={500}
              className="w-full text-xs px-2 py-1.5 rounded border border-border-subtle
                         bg-surface-canvas text-content-primary resize-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 text-xs px-2 py-1.5 rounded bg-brand-burgundy text-white
                           disabled:opacity-50"
              >
                {submitting ? '送出中…' : '送出檢舉'}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs px-2 py-1.5 rounded border border-border-subtle
                           text-content-secondary"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
