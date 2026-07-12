import { useAuth } from '../lib/useAuth';
import { useLikes } from '../lib/useLikes';

export default function LikeButton({ listingId }: { listingId: string }) {
  const { user } = useAuth();
  const { isLiked, likeCount, loading, busy, toggleLike } =
    useLikes(listingId, user?.id ?? null);

  if (loading) return null;

  return (
    <button
      type="button"
      onClick={toggleLike}
      disabled={!user || busy}
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        isLiked
          ? 'text-brand-burgundy'
          : 'text-content-muted hover:text-brand-burgundy'
      }`}
      title={!user ? '請先登入' : undefined}
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4"
           fill={isLiked ? 'currentColor' : 'none'}
           stroke="currentColor" strokeWidth="1.5">
        <path d="M12 21s-6.5-4.35-9.5-8.5C0.5 9 1.5 5 5 4c2-0.5 4 0.5 5 2 1-1.5 3-2.5 5-2 3.5 1 4.5 5 2.5 8.5C18.5 16.65 12 21 12 21z" />
      </svg>
      {likeCount > 0 && <span>{likeCount}</span>}
    </button>
  );
}
