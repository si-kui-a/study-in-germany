import { Link } from 'react-router-dom';

type Variant = 'listing' | 'review' | 'login';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  variant: Variant;
}

const MESSAGE: Record<Variant, string> = {
  listing:
    '我同意將填寫的聯絡方式公開顯示於討論區（任何訪客皆可見），且貼文於 60 天後自動下架。',
  review:
    '我了解此評價將公開顯示，且我的 Google 顯示名稱與頭像會一併公開。',
  // Phase BA：登入前同意勾選，訊息留空，僅呈現後方固定的「我已閱讀並同意隱私政策」
  login: '',
};

/** 發文前的隱私同意勾選。未勾選時表單不得送出。 */
export default function PrivacyNotice({ checked, onChange, variant }: Props) {
  return (
    <label className="flex items-start gap-2 rounded-lg border border-brand-gold/40 bg-brand-gold/10 p-3 text-sm text-content-secondary">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-brand-burgundy"
        required
      />
      <span>
        {MESSAGE[variant]}
        我已閱讀並同意
        <Link to="/privacy" target="_blank" className="mx-1 underline">
          隱私政策
        </Link>
        。
      </span>
    </label>
  );
}
