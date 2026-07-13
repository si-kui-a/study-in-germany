import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { translateError } from '../lib/errorMessages';
import { useToast } from '../lib/toast';
import type { SubmissionType, UserSubmission } from '../lib/userSubmissions';
import { fetchBadgesMap } from '../lib/badges';
import type { BadgeId } from '../lib/badges';
import UserAvatar from './UserAvatar';
import FollowButton from './FollowButton';
import ReportButton from './ReportButton';

interface SubmitterProfile {
  display_name: string | null;
  avatar_url: string | null;
}

/** 空狀態次要引導連結（依提交類型給對應的相關頁面，非強迫貢獻） */
const EMPTY_STATE_SECONDARY_LINK: Record<SubmissionType, { to: string; label: string } | null> = {
  school_edit: { to: '/schools', label: '看看其他學校' },
  new_school: { to: '/schools', label: '看看其他學校' },
  new_recommendation: { to: '/recommendation', label: '看看推薦專區其他分類' },
  general_feedback: null,
};

interface Props {
  submissionType: SubmissionType;
  targetId?: string;
  targetCategory?: string;
  emptyMessage?: string;
  title: string;
}

/**
 * 顯示 user_submissions 表內某類別的提交
 * 顯示 pending + approved · 加「使用者提交」badge
 *
 * user_submissions.user_id 外鍵指向 auth.users（非 public.profiles），
 * PostgREST 無法 auto-embed profiles(...)（同 PAT-02 的既有限制），
 * 故 profile / badges 皆於此另開查詢、client-side 合併。
 */
export default function UserSubmissionsList({
  submissionType, targetId, targetCategory, emptyMessage, title,
}: Props) {
  const { push } = useToast();
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [profilesMap, setProfilesMap] = useState<Map<string, SubmitterProfile>>(new Map());
  const [badgesMap, setBadgesMap] = useState<Map<string, BadgeId[]>>(new Map());
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
      if (targetCategory) query = query.eq('target_category', targetCategory);

      const { data, error } = await query;

      if (error) {
        const f = translateError(error);
        push('error', f.message);
        // eslint-disable-next-line no-console
        console.error('[UserSubmissionsList] fetch failed:', f.raw);
        setLoading(false);
        return;
      }

      const rows = (data as UserSubmission[]) ?? [];
      setSubmissions(rows);

      const userIds = rows
        .map((s) => s.user_id)
        .filter((id): id is string => id !== null);

      if (userIds.length > 0) {
        const uniqueIds = Array.from(new Set(userIds));
        const [{ data: profileRows }, badges] = await Promise.all([
          supabase.from('profiles').select('id, display_name, avatar_url').in('id', uniqueIds),
          fetchBadgesMap(uniqueIds),
        ]);
        const pMap = new Map<string, SubmitterProfile>();
        for (const p of (profileRows as { id: string; display_name: string | null; avatar_url: string | null }[]) ?? []) {
          pMap.set(p.id, { display_name: p.display_name, avatar_url: p.avatar_url });
        }
        setProfilesMap(pMap);
        setBadgesMap(badges);
      } else {
        setProfilesMap(new Map());
        setBadgesMap(new Map());
      }

      setLoading(false);
    })();
  }, [submissionType, targetId, targetCategory, push]);

  if (loading) {
    return (
      <div className="pt-4 text-xs text-content-muted">
        載入使用者提交…
      </div>
    );
  }

  if (submissions.length === 0) {
    if (emptyMessage) {
      const secondary = EMPTY_STATE_SECONDARY_LINK[submissionType];
      return (
        <div className="pt-4 text-xs text-content-muted space-y-1">
          <p className="italic">{emptyMessage}</p>
          {secondary && (
            <p>
              或
              <Link to={secondary.to} className="text-brand-burgundy mx-1">
                {secondary.label}
              </Link>
            </p>
          )}
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
        {submissions.map((s) => {
          const profile = s.user_id ? profilesMap.get(s.user_id) : undefined;
          const badges = s.user_id ? badgesMap.get(s.user_id) ?? [] : [];
          return (
            <article key={s.id} className="card space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                    {profile && (
                      <span className="inline-flex items-center gap-1.5">
                        <UserAvatar
                          avatarUrl={profile.avatar_url}
                          displayName={profile.display_name}
                          badges={badges}
                          size="sm"
                        />
                        <span className="text-xs text-content-primary">
                          {profile.display_name ?? '匿名'}
                        </span>
                        {s.user_id && <FollowButton targetUserId={s.user_id} size="sm" />}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-content-primary">
                    {s.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-content-muted">
                    {formatDate(s.created_at)}
                  </span>
                  <ReportButton targetType="submission" targetId={String(s.id)} />
                </div>
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
          );
        })}
      </div>
    </section>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}
