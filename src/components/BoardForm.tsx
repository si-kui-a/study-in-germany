import { useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import type { ListingType } from '../lib/types';
import { BOARD_TYPE_LABEL, BOARD_TYPE_HINT, DISCUSSION_TITLE_PREFIX } from '../lib/board';
import type { BoardType } from '../lib/board';
import PrivacyNotice from './PrivacyNotice';
import PhotoUploader from './PhotoUploader';

interface Props {
  onSubmitted?: () => void;
}

const BOARD_TYPES: BoardType[] = ['secondhand', 'rental_offer', 'rental_seek', 'discussion'];

export default function BoardForm({ onSubmitted }: Props) {
  const { user } = useAuth();
  const [type, setType] = useState<BoardType>('secondhand');
  const [region, setRegion] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [contact, setContact] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isDiscussion = type === 'discussion';

  const canSubmit =
    consent &&
    (isDiscussion || region.trim().length > 0) &&
    title.trim().length >= 2 &&
    title.trim().length <= 100 &&
    description.trim().length >= 5 &&
    description.trim().length <= 2000 &&
    contact.trim().length > 0 &&
    !submitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setErr(null);

    // discussion 類·DB listings.type CHECK 只允 3 類·存 DB 時 type 降級為 secondhand·title 加前綴標記（PAT-48）
    const submitType: ListingType = isDiscussion ? 'secondhand' : type;
    const submitTitle = isDiscussion ? `${DISCUSSION_TITLE_PREFIX}${title.trim()}` : title.trim();

    const { error } = await supabase.from('listings').insert({
      user_id: user.id,
      type: submitType,
      region: isDiscussion ? '' : region.trim(),
      title: submitTitle,
      description: description.trim(),
      price: isDiscussion ? null : price.trim() || null,
      contact_info: contact.trim(),
      photo_urls: isDiscussion ? [] : photos,
    });
    setSubmitting(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setTitle(''); setDescription(''); setPrice('');
    setContact(''); setRegion(''); setPhotos([]); setConsent(false);
    onSubmitted?.();
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div className="space-y-2">
        <div className="label">類型</div>
        <div className="grid grid-cols-2 gap-2">
          {BOARD_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                type === t
                  ? 'border-brand-burgundy bg-brand-burgundy-surface text-brand-burgundy'
                  : 'border-border-subtle hover:border-brand-gold text-content-secondary'
              }`}
            >
              <div className="text-sm font-medium">{BOARD_TYPE_LABEL[t]}</div>
              <div className="text-xs text-content-muted mt-0.5">{BOARD_TYPE_HINT[t]}</div>
            </button>
          ))}
        </div>
      </div>

      {!isDiscussion && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="region">城市／區域</label>
            <input
              id="region"
              className="input"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Berlin / München-Schwabing…"
            />
          </div>
          <div>
            <label className="label" htmlFor="price">
              {type === 'rental_seek' ? '預算（選填）' : '價格（選填）'}
            </label>
            <input
              id="price"
              className="input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={type === 'secondhand' ? '€50' : '€600 warm'}
            />
          </div>
        </div>
      )}

      <div>
        <label className="label" htmlFor="title">標題（2–100 字）</label>
        <input
          id="title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="label" htmlFor="desc">內容（5–2000 字）</label>
        <textarea
          id="desc"
          rows={5}
          className="input resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            type === 'secondhand'
              ? '物品狀況、購買時間、面交／寄送方式…'
              : type === 'rental_offer'
              ? '坪數、房型、租期、押金、可搬遷時間、家具家電…'
              : type === 'rental_seek'
              ? '需求區域、房型、預算上限、可入住時間、有無寵物…'
              : '想問的問題、想聊的話題、經驗分享…'
          }
        />
      </div>

      {!isDiscussion && <PhotoUploader value={photos} onChange={setPhotos} />}

      <div>
        <label className="label" htmlFor="contact">聯絡方式（將公開顯示）</label>
        <input
          id="contact"
          className="input"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Telegram @xxx / Email"
        />
      </div>

      <PrivacyNotice checked={consent} onChange={setConsent} variant="listing" />

      {err && <div className="text-sm text-state-danger">送出失敗：{err}</div>}

      <div className="flex items-center justify-between">
        <div className="text-xs text-content-muted">貼文於 60 天後自動下架。</div>
        <button type="submit" disabled={!canSubmit} className="btn-primary">
          {submitting ? '送出中…' : '公開發布'}
        </button>
      </div>
    </form>
  );
}
