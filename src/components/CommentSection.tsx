import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { fetchWithRetry } from '../lib/fetchWithRetry';
import { useAuth } from '../lib/useAuth';
import { translateError } from '../lib/errorMessages';
import { useToast } from '../lib/toast';

interface Comment {
  id: number;
  listing_id: number;
  user_id: string;
  content: string;
  created_at: string;
}

export default function CommentSection({ listingId }: { listingId: string }) {
  const { user } = useAuth();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadComments = async () => {
    setLoading(true);
    setLoadError(false);
    const { data, error } = await fetchWithRetry(
      () => supabase
        .from('listing_comments')
        .select('*')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: true })
        .retry(false),
      { table: 'listing_comments', source: 'CommentSection.load' },
    );

    if (error) {
      setLoadError(true);
    } else {
      setComments((data as Comment[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || input.trim().length === 0) return;

    setSubmitting(true);
    const { error } = await supabase.from('listing_comments').insert({
      listing_id: listingId,
      user_id: user.id,
      content: input.trim(),
    });
    setSubmitting(false);

    if (error) {
      push('error', translateError(error).message);
      return;
    }

    setInput('');
    loadComments();
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs text-content-muted hover:text-brand-burgundy transition-colors"
      >
        💬 留言{comments.length > 0 ? ` (${comments.length})` : ''}
      </button>

      {open && (
        <div className="mt-2 pl-3 border-l-2 border-border-subtle space-y-2">
          {loading ? (
            <div className="text-xs text-content-muted">載入中…</div>
          ) : loadError ? (
            <div className="text-xs text-content-muted">讀取失敗，請稍後再試。</div>
          ) : comments.length === 0 ? (
            <div className="text-xs text-content-muted italic">還沒有留言</div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="text-xs">
                <div className="text-content-primary">{c.content}</div>
                <div className="text-content-muted mt-0.5">
                  {new Date(c.created_at).toLocaleDateString('zh-TW')}
                </div>
              </div>
            ))
          )}

          {user ? (
            <form onSubmit={submit} className="flex gap-2 pt-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                placeholder="留言…"
                className="flex-1 text-xs px-2 py-1.5 rounded border border-border-subtle
                           bg-surface-canvas text-content-primary"
              />
              <button
                type="submit"
                disabled={submitting || input.trim().length === 0}
                className="text-xs px-3 py-1.5 rounded bg-brand-burgundy text-white
                           disabled:opacity-50"
              >
                送出
              </button>
            </form>
          ) : (
            <div className="text-xs text-content-muted pt-1">請先登入才能留言</div>
          )}
        </div>
      )}
    </div>
  );
}
