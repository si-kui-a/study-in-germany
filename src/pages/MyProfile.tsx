import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import { translateError } from '../lib/errorMessages';
import { useToast } from '../lib/toast';
import type { UserProfile, DisplayNameOption } from '../lib/profile';
import { computeDisplayName } from '../lib/profile';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * DS v4.2 · 個人資料頁
 * 使用者可自訂 display_name · avatar_url · 查看 registration_seq
 */
export default function MyProfile() {
  const { user, loading: authLoading } = useAuth();
  const { push } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayOption, setDisplayOption] = useState<DisplayNameOption>('google');
  const [customName, setCustomName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const googleName = (user?.user_metadata?.full_name as string | undefined) ?? null;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        const f = translateError(error);
        push('error', f.message);
        // eslint-disable-next-line no-console
        console.error('[MyProfile] fetch failed:', f.raw);
        setLoading(false);
        return;
      }

      const p = data as UserProfile;
      setProfile(p);
      setAvatarUrl(p.avatar_url ?? '');
      setCustomName(p.display_name ?? '');
      setLoading(false);
    })();
  }, [user, push]);

  const handleAvatarChange = (file: File | null) => {
    if (file && file.size > MAX_AVATAR_BYTES) {
      push('error', `檔案過大（上限 ${MAX_AVATAR_BYTES / 1024 / 1024} MB）`);
      return;
    }
    setAvatarFile(file);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setSaving(true);

    let finalAvatarUrl = avatarUrl;

    // 上傳新 avatar
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop();
      const filename = `${user.id}/avatar-${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(filename, avatarFile, { upsert: true });

      if (uploadErr) {
        const f = translateError(uploadErr);
        push('error', f.message);
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filename);

      finalAvatarUrl = urlData.publicUrl;
    }

    // 計算 display_name
    const finalDisplayName = computeDisplayName(
      displayOption,
      profile,
      googleName,
      customName
    );

    // update profile
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        display_name: finalDisplayName,
        avatar_url: finalAvatarUrl,
      })
      .eq('id', user.id);

    setSaving(false);

    if (updateErr) {
      const f = translateError(updateErr);
      push('error', f.message);
      // eslint-disable-next-line no-console
      console.error('[MyProfile] update failed:', f.raw);
      return;
    }

    push('success', '個人資料已更新');
    setProfile({ ...profile, display_name: finalDisplayName, avatar_url: finalAvatarUrl });
    setAvatarUrl(finalAvatarUrl);
    setAvatarFile(null);
  };

  if (authLoading || loading) {
    return <div className="py-16 text-center text-content-muted">載入中…</div>;
  }

  if (!user) {
    return (
      <div className="py-16 text-center text-content-secondary">
        請先登入
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-16 text-center text-content-secondary">
        找不到個人資料
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <div className="text-xs text-content-muted uppercase tracking-wider mb-2">
          My Profile
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold">個人資料</h1>
      </div>

      {/* 目前資訊 */}
      <div className="card space-y-3">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="頭像"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-brand-gold-soft
                            flex items-center justify-center text-brand-gold">
              👤
            </div>
          )}
          <div>
            <div className="text-lg font-semibold text-content-primary">
              {profile.display_name ?? '匿名'}
            </div>
            {profile.registration_seq !== null && (
              <div className="text-xs text-content-muted mt-1">
                第 {profile.registration_seq} 位註冊使用者
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 編輯 form */}
      <form onSubmit={submit} className="card space-y-5">
        <div className="space-y-3">
          <label className="text-sm font-medium text-content-primary">顯示名稱</label>
          <div className="space-y-2">
            {(['google', 'anonymous', 'custom'] as DisplayNameOption[]).map((opt) => (
              <label
                key={opt}
                className="flex items-start gap-3 p-3 rounded-lg border
                           border-border-subtle hover:border-brand-gold
                           cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  checked={displayOption === opt}
                  onChange={() => setDisplayOption(opt)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="text-sm text-content-primary">
                    {opt === 'google' && `使用 Google 帳號名（${googleName ?? '目前無'}）`}
                    {opt === 'anonymous' && `匿名編號（用戶-${profile.registration_seq ?? '?'}）`}
                    {opt === 'custom' && '自訂名稱'}
                  </div>
                  {opt === 'custom' && displayOption === 'custom' && (
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      maxLength={30}
                      placeholder="輸入你想顯示的名稱"
                      className="mt-2 w-full px-3 py-2 rounded-lg text-sm
                                 border border-border-subtle bg-surface-canvas"
                    />
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-content-primary">頭像</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleAvatarChange(e.target.files?.[0] ?? null)}
            className="text-sm text-content-secondary"
          />
          <p className="text-xs text-content-muted">
            留空即保留現行頭像 · 若原為 Google 頭像則繼續使用 · 檔案上限 5 MB
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full disabled:opacity-50"
        >
          {saving ? '儲存中…' : '儲存'}
        </button>
      </form>

      {/* 貢獻統計 · Phase K-2 顯示 · Phase K-1 為 placeholder */}
      <div className="card">
        <div className="text-sm text-content-muted italic">
          🏆 貢獻統計與徽章將於後續版本上線
        </div>
      </div>
    </div>
  );
}
