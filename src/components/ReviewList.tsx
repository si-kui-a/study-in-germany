import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { SchoolReview } from '../lib/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import { translateError } from '../lib/errorMessages';
import { useToast } from '../lib/toast';
import RatingBreakdown from './RatingBreakdown';
import UserAvatar from './UserAvatar';
import FollowButton from './FollowButton';
import ReportButton from './ReportButton';
import { fetchBadgesMap } from '../lib/badges';
import type { BadgeId } from '../lib/badges';

interface Props {
  reviews: SchoolReview[];
  onDeleted?: () => void;
}

export default function ReviewList({ reviews, onDeleted }: Props) {
  const { user } = useAuth();
  const { push } = useToast();
  const [badgesMap, setBadgesMap] = useState<Map<string, BadgeId[]>>(new Map());

  useEffect(() => {
    const userIds = reviews.map((r) => r.user_id);
    if (userIds.length === 0) {
      setBadgesMap(new Map());
      return;
    }
    fetchBadgesMap(userIds).then(setBadgesMap);
  }, [reviews]);

  if (reviews.length === 0) {
    return (
      <div className="card text-sm text-content-muted">
        還沒有評價。第一個留下心得吧。
        <p className="text-xs text-content-muted mt-2">
          或
          <Link to="/schools" className="text-brand-burgundy mx-1">
            查看其他學校的評價
          </Link>
          參考看看
        </p>
      </div>
    );
  }

  const handleDelete = async (id: number) => {
    if (!confirm('確定刪除這則評價？此動作無法復原。')) return;
    const { error } = await supabase.from('school_reviews').delete().eq('id', id);
    if (error) {
      const f = translateError(error);
      push('error', f.message);
      // eslint-disable-next-line no-console
      console.error('[ReviewList] delete failed:', f.raw);
      return;
    }
    onDeleted?.();
  };

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="card">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <UserAvatar
                avatarUrl={r.profile?.avatar_url}
                displayName={r.profile?.display_name}
                badges={badgesMap.get(r.user_id) ?? []}
                size="sm"
              />
              <div className="min-w-0">
                <div className="text-sm text-content-primary truncate">
                  {r.profile?.display_name ?? '匿名使用者'}
                </div>
                <div className="text-xs text-content-muted">
                  {new Date(r.created_at).toLocaleDateString('zh-Hant')}
                </div>
              </div>
              <FollowButton targetUserId={r.user_id} size="sm" />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {typeof r.stars.overall === 'number' && (
                <span className="text-sm font-semibold text-brand-gold">
                  {r.stars.overall.toFixed(1)} ★
                </span>
              )}
              <ReportButton targetType="review" targetId={String(r.id)} />
              {user?.id === r.user_id && (
                <button
                  onClick={() => handleDelete(r.id)}
                  className="btn-danger text-xs px-2 py-1"
                >
                  刪除
                </button>
              )}
            </div>
          </div>

          <div className="mt-3">
            <RatingBreakdown stars={r.stars} compact />
          </div>

          <p className="mt-3 text-sm text-content-secondary whitespace-pre-wrap">
            {r.comment_text}
          </p>
        </div>
      ))}
    </div>
  );
}
