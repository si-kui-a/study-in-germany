import type { Listing } from '../lib/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import { deletePhoto } from '../lib/storage';
import ListingCardBody from './ListingCardBody';
import UserAvatar from './UserAvatar';
import FollowButton from './FollowButton';
import ReportButton from './ReportButton';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import type { BadgeId } from '../lib/badges';
import { boardTypeOf, isDiscussionType, EXPIRY_DAYS } from '../lib/board';
import { useToast } from '../lib/toast';
import { translateError } from '../lib/errorMessages';

interface Props {
  listings: Listing[];
  onDeleted?: () => void;
  onRenewed?: () => void;
  badgesMap?: Map<string, BadgeId[]>;
}

export default function BoardList({ listings, onDeleted, onRenewed, badgesMap }: Props) {
  const { user } = useAuth();
  const { push } = useToast();

  if (listings.length === 0) {
    return (
      <div className="card text-sm text-content-muted">目前沒有符合條件的貼文。</div>
    );
  }

  const handleDelete = async (l: Listing) => {
    if (!confirm('確定刪除這則貼文？照片會一併移除，此動作無法復原。')) return;
    // 先刪照片（best-effort），再刪 row
    await Promise.all(l.photo_urls.map((u) => deletePhoto(u).catch(() => null)));
    const { error } = await supabase.from('listings').delete().eq('id', l.id);
    if (error) {
      const f = translateError(error);
      push('error', f.message);
      // eslint-disable-next-line no-console
      console.error('[BoardList] delete failed:', f.raw);
      return;
    }
    onDeleted?.();
  };

  const handleRenew = async (l: Listing) => {
    const newExpiresAt = new Date(
      Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();
    const { error } = await supabase
      .from('listings')
      .update({ expires_at: newExpiresAt })
      .eq('id', l.id);
    if (error) {
      push('error', translateError(error).message);
      return;
    }
    push('success', `已續期 ${EXPIRY_DAYS} 天`);
    onRenewed?.();
  };

  return (
    <div className="space-y-3">
      {listings.map((l) => {
        const kindIsDiscussion = isDiscussionType(boardTypeOf(l));

        return (
          <div
            key={l.id}
            className={`card ${kindIsDiscussion ? 'bg-surface-section border-brand-gold/30' : ''}`}
          >
            <ListingCardBody listing={l} showExpiry />

            {l.profile && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border-subtle">
                <UserAvatar
                  avatarUrl={l.profile.avatar_url}
                  displayName={l.profile.display_name}
                  badges={badgesMap?.get(l.user_id) ?? []}
                  size="sm"
                />
                <div className="text-xs text-content-primary">
                  {l.profile.display_name ?? '匿名'}
                </div>
                <FollowButton targetUserId={l.user_id} size="sm" />
              </div>
            )}

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="text-xs">
                <span className="text-content-muted">聯絡：</span>
                <span className="text-content-primary break-all">{l.contact_info}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ReportButton targetType="listing" targetId={String(l.id)} />
                {user?.id === l.user_id && l.expires_at && (
                  <button
                    type="button"
                    onClick={() => handleRenew(l)}
                    className="text-xs text-brand-burgundy hover:text-brand-burgundy-hover"
                  >
                    續期 {EXPIRY_DAYS} 天
                  </button>
                )}
                {user?.id === l.user_id && (
                  <button onClick={() => handleDelete(l)} className="btn-danger text-xs px-2 py-1">
                    刪除
                  </button>
                )}
              </div>
            </div>

            <div className="mt-2 text-xs text-content-muted">
              {l.expires_at
                ? `到期：${new Date(l.expires_at).toLocaleDateString('zh-Hant')}`
                : '永久保留'}
            </div>

            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border-subtle">
              <LikeButton listingId={String(l.id)} />
            </div>
            <CommentSection listingId={String(l.id)} />
          </div>
        );
      })}
    </div>
  );
}
