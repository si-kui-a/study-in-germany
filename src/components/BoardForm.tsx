import { useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import { BOARD_TYPE_LABEL, BOARD_TYPE_HINT, isDiscussionType, EXPIRING_TYPES, EXPIRY_DAYS } from '../lib/board';
import type { BoardType } from '../lib/board';
import PrivacyNotice from './PrivacyNotice';
import PhotoUploader from './PhotoUploader';

interface Props {
  onSubmitted?: () => void;
}

const MAIN_CATEGORIES: BoardType[] = ['secondhand', 'rental_offer', 'rental_seek', 'discussion'];

const DISCUSSION_SUBCATEGORIES: BoardType[] = [
  'discussion',
  'discussion_study',
  'discussion_longterm',
  'discussion_food',
  'discussion_taiwan_restaurant',
];

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

  const isDiscussion = isDiscussionType(type);
  const isExpiringType = EXPIRING_TYPES.includes(type);

  const canSubmit =
    consent &&
    (isDiscussion || region.trim().length > 0) &&
    title.trim().length >= 2 &&
    title.trim().length <= 100 &&
    description.trim().length >= 5 &&
    description.trim().length <= 2000 &&
    !submitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setErr(null);

    // Phase J-3 起 listings.type CHECK 已含 discussion 子類，直接存真實 type，
    // 不再需要 Phase V 的 title prefix hack（PAT-72）
    // Phase R 起顯式設定 expires_at：商業類 90 天到期、討論全類 null（永久，
    // 需搭配 schema.sql 本輪修正過的 listings_public_read policy 才能正確顯示，
    // 見 PAT-101）
    const expiresAt = isExpiringType
      ? new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { error } = await supabase.from('listings').insert({
      user_id: user.id,
      type,
      region: isDiscussion ? '' : region.trim(),
      title: title.trim(),
      description: description.trim(),
      price: isDiscussion ? null : price.trim() || null,
      contact_info: contact.trim() || null,
      photo_urls: isDiscussion ? [] : photos,
      expires_at: expiresAt,
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
          {MAIN_CATEGORIES.map((t) => {
            const isThisSelected = t === type || (t === 'discussion' && isDiscussion);
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  isThisSelected
                    ? 'border-brand-burgundy bg-brand-burgundy-surface text-brand-burgundy'
                    : 'border-border-subtle hover:border-brand-gold text-content-secondary'
                }`}
              >
                <div className="text-sm font-medium">
                  {t === 'discussion' ? '討論' : BOARD_TYPE_LABEL[t]}
                </div>
                <div className="text-xs text-content-muted mt-0.5">
                  {t === 'discussion' ? '話題交流、經驗分享、疑難雜症' : BOARD_TYPE_HINT[t]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {isDiscussion && (
        <div className="space-y-2 pt-2 pl-4 border-l-2 border-brand-gold/30">
          <label className="text-sm text-content-muted">討論子類</label>
          <div className="space-y-1.5">
            {DISCUSSION_SUBCATEGORIES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`w-full text-left p-2.5 rounded-lg border transition-colors ${
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
      )}

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
        <label className="label" htmlFor="contact">
          聯絡方式 <span className="text-content-muted">（選填 · 例如 email / IG / Telegram）</span>
        </label>
        <input
          id="contact"
          className="input"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="留空表示不留聯絡方式（討論類貼文常見）"
        />
      </div>

      <PrivacyNotice checked={consent} onChange={setConsent} variant="listing" />

      {err && <div className="text-sm text-state-danger">送出失敗：{err}</div>}

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-content-muted">
          {isExpiringType
            ? `此類型貼文將於 ${EXPIRY_DAYS} 天後自動下架（可於「我的貼文」續期）`
            : '討論類貼文永久保留，不會自動下架'}
        </div>
        <button type="submit" disabled={!canSubmit} className="btn-primary shrink-0">
          {submitting ? '送出中…' : '公開發布'}
        </button>
      </div>
    </form>
  );
}
