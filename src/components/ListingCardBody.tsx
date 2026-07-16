import { useEffect, useRef, useState } from 'react';
import type { Listing } from '../lib/types';
import {
  boardTypeOf, isDiscussion, isDiscussionType, stripDiscussionPrefix, BOARD_TYPE_LABEL,
} from '../lib/board';
import PhotoGallery from './PhotoGallery';

interface Props {
  listing: Listing;
  /** 4 行後以 line-clamp 截斷 + 展開/收合切換（首頁熱門討論區卡片用，見 PAT-163） */
  truncateDescription?: boolean;
  showPhotos?: boolean;
  showExpiry?: boolean;
}

/**
 * 貼文卡片內容（badge/標題/內文/照片）。BoardList.tsx（討論區全頁列表，完整顯示）
 * 與 HotBoardCarousel.tsx（首頁熱門討論區，截斷+精簡）共用同一份渲染邏輯，
 * 避免兩處各自維護一份「貼文長相」（Phase BC）。
 */
export default function ListingCardBody({
  listing: l, truncateDescription = false, showPhotos = true, showExpiry = false,
}: Props) {
  const descRef = useRef<HTMLParagraphElement>(null);
  const [canExpand, setCanExpand] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const kind = boardTypeOf(l);
  const kindIsDiscussion = isDiscussionType(kind);
  const displayTitle = isDiscussion(l) ? stripDiscussionPrefix(l.title) : l.title;

  useEffect(() => {
    if (!truncateDescription) return;
    const el = descRef.current;
    if (el) setCanExpand(el.scrollHeight > el.clientHeight + 1);
    // 僅在掛載/內文變化時於「截斷態」量測一次；expanded 特意不列入依賴，
    // 否則展開後 clientHeight 等於 scrollHeight 會讓按鈕在展開當下就消失
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [truncateDescription, l.description]);

  return (
    <>
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
        {showExpiry && l.expires_at && (() => {
          const daysLeft = Math.ceil(
            (new Date(l.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          if (daysLeft <= 0) {
            return <span className="text-state-danger font-medium">已過期</span>;
          }
          return (
            <span className={daysLeft <= 7 ? 'text-state-danger' : 'text-content-muted'}>
              {daysLeft <= 7 ? `⚠️ 剩 ${daysLeft} 天下架` : `${daysLeft} 天後下架`}
            </span>
          );
        })()}
        {!kindIsDiscussion && l.price && (
          <span className="ml-auto text-brand-burgundy font-medium">{l.price}</span>
        )}
      </div>

      <h3 className="mt-2 font-semibold text-content-primary">{displayTitle}</h3>
      <p
        ref={descRef}
        className={`mt-1 text-sm text-content-secondary whitespace-pre-wrap ${
          truncateDescription && !expanded ? 'line-clamp-4' : ''
        }`}
      >
        {l.description}
      </p>
      {truncateDescription && canExpand && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="mt-1 text-xs text-brand-burgundy hover:text-brand-burgundy-hover"
        >
          {expanded ? '收合' : '展開查看更多'}
        </button>
      )}

      {showPhotos && !kindIsDiscussion && l.photo_urls.length > 0 && (
        <div className="mt-3">
          <PhotoGallery photos={l.photo_urls} />
        </div>
      )}
    </>
  );
}
