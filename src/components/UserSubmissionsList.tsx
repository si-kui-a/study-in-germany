import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { translateError } from '../lib/errorMessages';
import { useToast } from '../lib/toast';
import type { SubmissionType, UserSubmission } from '../lib/userSubmissions';

interface Props {
  submissionType: SubmissionType;
  targetId?: string;
  emptyMessage?: string;
  title: string;
}

/**
 * 顯示 user_submissions 表內某類別的提交
 * 顯示 pending + approved · 加「使用者提交」badge
 */
export default function UserSubmissionsList({
  submissionType, targetId, emptyMessage, title,
}: Props) {
  const { push } = useToast();
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let query = supabase
        .from('user_submissions')
        .select('*')
        .eq('submission_type', submissionType)
        .in('status', ['pending', 'approved'])
        .order('created_at', { ascending: false });

      if (targetId) query = query.eq('target_id', targetId);

      const { data, error } = await query;

      if (error) {
        const f = translateError(error);
        push('error', f.message);
        // eslint-disable-next-line no-console
        console.error('[UserSubmissionsList] fetch failed:', f.raw);
        setLoading(false);
        return;
      }

      setSubmissions((data as UserSubmission[]) ?? []);
      setLoading(false);
    })();
  }, [submissionType, targetId, push]);

  if (loading) {
    return (
      <div className="pt-4 text-xs text-content-muted">
        載入使用者提交…
      </div>
    );
  }

  if (submissions.length === 0) {
    if (emptyMessage) {
      return (
        <div className="pt-4 text-xs text-content-muted italic">
          {emptyMessage}
        </div>
      );
    }
    return null;
  }

  return (
    <section className="mt-6 pt-6 border-t border-border-subtle">
      <h3 className="text-sm font-semibold text-content-primary mb-3">
        {title} <span className="text-content-muted font-normal">({submissions.length})</span>
      </h3>
      <div className="space-y-3">
        {submissions.map((s) => (
          <article key={s.id} className="card space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded
                                   bg-brand-gold-soft text-brand-gold-hover
                                   font-medium">
                    使用者提交
                  </span>
                  {s.status === 'pending' && (
                    <span className="text-xs text-content-muted">
                      · 尚未審核
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-content-primary">
                  {s.title}
                </h4>
              </div>
              <span className="text-xs text-content-muted shrink-0">
                {formatDate(s.created_at)}
              </span>
            </div>
            <p className="text-sm text-content-secondary leading-relaxed whitespace-pre-wrap">
              {s.content}
            </p>
            {s.target_url && (
              <a
                href={s.target_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-burgundy no-underline
                           hover:text-brand-burgundy-hover
                           inline-flex items-center gap-1"
              >
                🔗 相關連結 ↗
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}
