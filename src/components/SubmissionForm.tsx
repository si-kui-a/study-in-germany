import { useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import { translateError } from '../lib/errorMessages';
import { useToast } from '../lib/toast';

interface Props {
  submissionType: 'school_edit' | 'new_school' | 'new_recommendation' | 'general_feedback';
  targetId?: string;
  titlePlaceholder: string;
  contentPlaceholder: string;
  onSubmitted?: () => void;
}

export default function SubmissionForm({
  submissionType,
  targetId,
  titlePlaceholder,
  contentPlaceholder,
  onSubmitted,
}: Props) {
  const { user } = useAuth();
  const { push } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim().length >= 2 && content.trim().length >= 5;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);

    const { error } = await supabase.from('user_submissions').insert({
      user_id: user?.id ?? null,
      submission_type: submissionType,
      target_id: targetId ?? null,
      target_url: url.trim() || null,
      title: title.trim(),
      content: content.trim(),
    });

    setSubmitting(false);

    if (error) {
      const f = translateError(error);
      push('error', f.message);
      // eslint-disable-next-line no-console
      console.error('[SubmissionForm] insert failed:', f.raw);
      return;
    }

    push('success', '提交完成 · 我們會盡快審核');
    setTitle('');
    setContent('');
    setUrl('');
    onSubmitted?.();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="text-xs px-3 py-1.5 rounded-lg
                      bg-brand-gold-soft border border-brand-gold/30
                      inline-flex items-center gap-2">
        <span className="text-brand-gold">🕓</span>
        <span className="text-content-secondary">
          使用者提交 · 未審核（審核後將出現於相關版面）
        </span>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-content-primary">
          標題 <span className="text-content-muted">（2-100 字）</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder={titlePlaceholder}
          className="w-full px-3 py-2 rounded-lg
                     bg-surface-canvas border border-border-subtle
                     text-sm text-content-primary
                     focus:outline-none focus:border-brand-burgundy"
        />
        <div className="text-xs text-content-muted text-right">
          {title.length} / 100
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-content-primary">
          相關連結 <span className="text-content-muted">（選填 · 官網 / 佐證 URL）</span>
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          maxLength={500}
          placeholder="https://..."
          className="w-full px-3 py-2 rounded-lg
                     bg-surface-canvas border border-border-subtle
                     text-sm text-content-primary
                     focus:outline-none focus:border-brand-burgundy"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-content-primary">
          內容 <span className="text-content-muted">（5-2000 字）</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder={contentPlaceholder}
          className="w-full px-3 py-2 rounded-lg
                     bg-surface-canvas border border-border-subtle
                     text-sm text-content-primary
                     focus:outline-none focus:border-brand-burgundy resize-none"
        />
        <div className="text-xs text-content-muted text-right">
          {content.length} / 2000
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? '送出中…' : '送出提交'}
      </button>

      {!user && (
        <p className="text-xs text-content-muted text-center">
          未登入也可以提交 · 但登入後可查詢自己提交的紀錄
        </p>
      )}
    </form>
  );
}
