import type { Listing } from '../lib/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import { deletePhoto } from '../lib/storage';
import PhotoGallery from './PhotoGallery';
import UserAvatar from './UserAvatar';
import FollowButton from './FollowButton';
import ReportButton from './ReportButton';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import type { BadgeId } from '../lib/badges';
import { boardTypeOf, isDiscussion, isDiscussionType, stripDiscussionPrefix, BOARD_TYPE_LABEL } from '../lib/board';

interface Props {
  listings: Listing[];
  onDeleted?: () => void;
  badgesMap?: Map<string, BadgeId[]>;
}

export default function BoardList({ listings, onDeleted, badgesMap }: Props) {
  const { user } = useAuth();

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
      alert(`刪除失敗：${error.message}`);
      return;
    }
    onDeleted?.();
  };

  return (
    <div className="space-y-3">
      {listings.map((l) => {
        const kind = boardTypeOf(l);
        const kindIsDiscussion = isDiscussionType(kind);
        const displayTitle = isDiscussion(l) ? stripDiscussionPrefix(l.title) : l.title;

        return (
          <div
            key={l.id}
            className={`card ${kindIsDiscussion ? 'bg-surface-section border-brand-gold/30' : ''}`}
          >
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`px-2 py-0.5 rounded font-medium ${
                  kindIsDiscussion
                    ? 'bg-brand-gold-soft text-brand-gold-hover'
                    : 'bg-brand-gold/15 text-brand-burgundy'
                }`}
              >
                {BOARD_TYPE_LABEL[kind]}
              </span>
              {!kindIsDiscussion && <span className="text-content-muted">{l.region}</span>}
              <span className="text-content-muted">·</span>
              <span className="text-content-muted">
                {new Date(l.created_at).toLocaleDateString('zh-Hant')}
              </span>
              {!kindIsDiscussion && l.price && (
                <span className="ml-auto text-brand-burgundy font-medium">{l.price}</span>
              )}
            </div>

            <h3 className="mt-2 font-semibold text-content-primary">{displayTitle}</h3>
            <p className="mt-1 text-sm text-content-secondary whitespace-pre-wrap">
              {l.description}
            </p>

            {!kindIsDiscussion && l.photo_urls.length > 0 && (
              <div className="mt-3">
                <PhotoGallery photos={l.photo_urls} />
              </div>
            )}

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
                {user?.id === l.user_id && (
                  <button onClick={() => handleDelete(l)} className="btn-danger text-xs px-2 py-1">
                    刪除
                  </button>
                )}
              </div>
            </div>

            <div className="mt-2 text-xs text-content-muted">
              到期：{new Date(l.expires_at).toLocaleDateString('zh-Hant')}
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
