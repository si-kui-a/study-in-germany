import { Link } from 'react-router-dom';
import { IconSpeakerphone } from '@tabler/icons-react';
import { useHotListings } from '../lib/useHotListings';
import { LISTING_TYPE_LABEL } from '../lib/types';
import { SkeletonBox } from './Skeleton';

/**
 * 首頁「熱門討論區」區塊（Phase BB，見 PAT-162）
 * 比照 HotSchoolsCarousel 視覺結構與卡片密度：scroll-snap 橫向卡片，
 * 無新第三方依賴。排序依 useHotListings（讚數 desc → 留言數 desc → 建立時間 desc）。
 * 討論區目前無單則貼文詳情頁，卡片與區塊標題連結一律導向 /board。
 */
export default function HotBoardCarousel() {
  const { hot, loading } = useHotListings();

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-hidden">
        <SkeletonBox className="h-52 shrink-0 basis-[80%] sm:basis-[45%] lg:basis-[23%]" />
        <SkeletonBox className="h-52 shrink-0 basis-[80%] sm:basis-[45%] lg:basis-[23%]" />
        <SkeletonBox className="h-52 shrink-0 basis-[80%] sm:basis-[45%] lg:basis-[23%]" />
        <SkeletonBox className="h-52 shrink-0 basis-[80%] sm:basis-[45%] lg:basis-[23%]" />
      </div>
    );
  }

  if (hot.length === 0) return null;

  return (
    <div
      className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3
                 scroll-smooth
                 [scrollbar-color:rgb(var(--border-strong))_transparent]
                 [scrollbar-width:thin]"
    >
      {hot.map((l) => (
        <Link
          key={l.id}
          to="/board"
          className="group snap-start no-underline shrink-0
                     basis-[80%] sm:basis-[45%] lg:basis-[23%]
                     card-interactive p-0 overflow-hidden"
        >
          <div className="h-24 bg-surface-section flex items-center justify-center px-6
                          text-module-board overflow-hidden">
            {l.photo_urls?.[0] ? (
              <img src={l.photo_urls[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <IconSpeakerphone className="w-10 h-10 opacity-60" stroke={1.5} />
            )}
          </div>
          <div className="p-4">
            <div className="text-xs text-content-muted mb-1">{LISTING_TYPE_LABEL[l.type]}</div>
            <div className="font-semibold text-content-primary leading-tight
                            line-clamp-2 min-h-[2.5em]">
              {l.title}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              {l.like_count > 0 ? (
                <span className="text-brand-gold font-medium">
                  ♥ {l.like_count}
                </span>
              ) : (
                <span className="text-content-muted">尚無按讚</span>
              )}
              <span className="text-content-secondary">
                {l.comment_count > 0 ? `${l.comment_count} 則留言` : '—'}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
