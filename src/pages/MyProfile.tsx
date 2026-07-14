import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import { translateError } from '../lib/errorMessages';
import { useToast } from '../lib/toast';
import type { UserProfile, DisplayNameOption } from '../lib/profile';
import { computeDisplayName, formatAnonymousName } from '../lib/profile';
import { useBadges } from '../lib/useBadges';
import { useContributions } from '../lib/useContributions';
import { BadgeChip } from '../components/UserAvatar';
import { ALL_BADGES } from '../lib/badges';
import { deleteAccountData } from '../lib/deleteAccount';
import { resetOnboarding, getLocalPersonaStage, PERSONA_STAGE_LABELS } from '../lib/onboarding';
import { useWorkflowProgressContext } from '../lib/WorkflowProgressContext';
import { getStepStatus } from '../lib/workflowProgress';
import { visaWorkflow } from '../data/edu/visa';
import { arrivalWorkflow } from '../data/edu/arrival';
import { renewalWorkflow } from '../data/edu/renewal';
import { applicationWorkflow } from '../data/edu/application';
import { scholarshipWorkflow } from '../data/edu/scholarship';
import { policyWorkflow } from '../data/edu/policy';
import { exitWorkflow } from '../data/edu/exit';
import type { WorkflowTopic } from '../data/edu/workflow';

const EDU_TOPICS: WorkflowTopic[] = [
  visaWorkflow,
  arrivalWorkflow,
  renewalWorkflow,
  applicationWorkflow,
  scholarshipWorkflow,
  policyWorkflow,
  exitWorkflow,
];

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * DS v4.2 · 個人資料頁
 * 使用者可自訂 display_name · avatar_url · 查看 registration_seq
 */
export default function MyProfile() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { push } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayOption, setDisplayOption] = useState<DisplayNameOption>('google');
  const [customName, setCustomName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const googleName = (user?.user_metadata?.full_name as string | undefined) ?? null;
  const localStage = getLocalPersonaStage();
  const { progress, toggleStep } = useWorkflowProgressContext();

  const { counts } = useContributions(user?.id ?? null);
  const { badges } = useBadges({
    userId: user?.id ?? null,
    registrationSeq: profile?.registration_seq ?? null,
  });

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

      {/* Phase AI：重新觸發新手導覽（PAT-127）· Phase AJ：視覺提升為卡片式按鈕（PAT-128） */}
      <div className="card bg-brand-gold-soft border-brand-gold/30">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-content-primary">
              🎯 你目前設定的階段
            </div>
            <div className="text-xs text-content-muted mt-1">
              {localStage ? PERSONA_STAGE_LABELS[localStage].label : '尚未設定'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              resetOnboarding();
              window.location.href = `${window.location.origin}${window.location.pathname}#/`;
            }}
            className="shrink-0 px-4 py-2 rounded-lg border border-brand-burgundy
                       text-sm font-medium text-brand-burgundy
                       hover:bg-brand-burgundy hover:text-white transition-colors"
          >
            重新設定
          </button>
        </div>
      </div>

      {/* Phase AO：作戰手冊進度總覽 + 手動調整（PAT-136） */}
      <div className="card space-y-3">
        <h2 className="text-lg font-semibold text-content-primary">我的學習進度</h2>
        {EDU_TOPICS.map((topic) => {
          const mod = progress[topic.slug];
          const doneCount = (mod?.completed.length ?? 0) + (mod?.skipped.length ?? 0);
          const totalSteps = topic.steps.length;
          return (
            <details key={topic.slug} className="text-sm">
              <summary className="cursor-pointer flex items-center justify-between">
                <span>{topic.title}</span>
                <span className="text-xs text-content-muted">{doneCount}/{totalSteps}</span>
              </summary>
              <div className="pt-2 pl-4 space-y-1">
                {topic.steps.map((s) => {
                  const status = getStepStatus(progress, topic.slug, s.step);
                  return (
                    <div key={s.step} className="flex items-center justify-between text-xs">
                      <span className="text-content-secondary truncate pr-2">
                        Step {s.step}：{s.title_zh}
                      </span>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleStep(topic.slug, s.step, 'completed')}
                          className={status === 'completed' ? 'text-brand-burgundy font-medium' : 'text-content-muted hover:text-content-secondary'}
                        >
                          完成
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStep(topic.slug, s.step, 'skipped')}
                          className={status === 'skipped' ? 'text-brand-gold-hover font-medium' : 'text-content-muted hover:text-content-secondary'}
                        >
                          跳過
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          );
        })}
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
                    {opt === 'anonymous' && (
                      profile.registration_seq !== null
                        ? `匿名編號（${formatAnonymousName(profile.registration_seq)}）`
                        : '匿名編號（序號未指派）'
                    )}
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
          {avatarUrl && (
            <button
              type="button"
              onClick={async () => {
                if (!confirm('確定要刪除目前的頭像嗎？')) return;
                setAvatarUrl('');
                setAvatarFile(null);
                if (user) {
                  const { error } = await supabase
                    .from('profiles')
                    .update({ avatar_url: null })
                    .eq('id', user.id);
                  if (error) {
                    const f = translateError(error);
                    push('error', f.message);
                  } else {
                    push('success', '頭像已刪除');
                    setProfile((prev) => (prev ? { ...prev, avatar_url: null } : prev));
                  }
                }
              }}
              className="text-xs text-content-muted hover:text-state-danger transition-colors"
            >
              刪除目前頭像
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full disabled:opacity-50"
        >
          {saving ? '儲存中…' : '儲存'}
        </button>
      </form>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-content-primary">
          貢獻統計
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-content-muted">評價</div>
            <div className="text-lg font-semibold text-content-primary">
              {counts.reviews}
            </div>
          </div>
          <div>
            <div className="text-xs text-content-muted">貼文</div>
            <div className="text-lg font-semibold text-content-primary">
              {counts.listings}
            </div>
          </div>
          <div>
            <div className="text-xs text-content-muted">提交</div>
            <div className="text-lg font-semibold text-content-primary">
              {counts.submissions}
            </div>
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-content-primary">
          我的徽章
        </h2>
        {badges.length === 0 ? (
          <p className="text-sm text-content-muted italic">
            尚未獲得徽章 · 開始提交評價、貼文、建議即可累積
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {badges.map((bid) => (
              <BadgeChip key={bid} badgeId={bid} size="lg" />
            ))}
          </div>
        )}

        <details className="pt-3 border-t border-border-subtle">
          <summary className="cursor-pointer text-xs text-content-muted hover:text-content-primary">
            查看所有徽章與條件
          </summary>
          <div className="mt-3 space-y-2">
            {ALL_BADGES.map((b) => (
              <div key={b.id} className="flex items-start gap-3 text-sm">
                <BadgeChip badgeId={b.id} />
                <span className="text-content-muted">{b.description}</span>
              </div>
            ))}
          </div>
        </details>
      </div>

      <div className="card border-state-danger/30 space-y-3">
        <h2 className="text-lg font-semibold text-state-danger">
          刪除帳號
        </h2>
        <p className="text-sm text-content-secondary leading-relaxed">
          刪除後：你的顯示名稱與頭像會立即清空、系統會將你登出。
          你之前發表的評價、貼文、建議內容會保留（但不再顯示與你的關聯），
          因為這些內容對其他使用者仍有參考價值。
        </p>
        <p className="text-xs text-content-muted leading-relaxed">
          💡 <strong>7 天內可恢復</strong>：若你在 7 天內用同一個 Google 帳號重新登入，
          系統會詢問你是否要恢復帳號（使用你的 Google 姓名與頭像重建個人資料）。
          超過 7 天未恢復，此請求將視為定案，不再提示。
        </p>
        <p className="text-xs text-content-muted leading-relaxed">
          ⚠️ 由於技術限制，此動作無法立即刪除你的 Google 登入紀錄本身——
          你之後仍可用同一個 Google 帳號重新登入（但會是全新的空白個人資料）。
          如需徹底刪除所有紀錄（包含登入資料），請{' '}
          <a
            href="https://github.com/si-kui-a/study-in-germany/issues/new?title=%5B%E5%B8%B3%E8%99%9F%E5%88%AA%E9%99%A4%E8%AB%8B%E6%B1%82%5D&labels=account-deletion&body=%E8%AB%8B%E5%91%8A%E7%9F%A5%E4%BD%A0%E7%9A%84%E9%A1%AF%E7%A4%BA%E5%90%8D%E7%A8%B1%E6%88%96%E8%A8%BB%E5%86%8A%E6%99%82%E9%96%93%EF%BC%8C%E4%BB%A5%E4%BE%BF%E6%88%91%E5%80%91%E5%8D%94%E5%8A%A9%E7%A2%BA%E8%AA%8D%E8%BA%AB%E5%88%86%E3%80%82"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-burgundy"
          >
            聯繫我們處理
          </a>
          。
        </p>
        <button
          type="button"
          onClick={async () => {
            const confirmed = confirm(
              '確定要刪除帳號嗎？此動作會清空你的個人資料並登出，且無法復原。'
            );
            if (!confirmed) return;

            if (!user) return;

            const result = await deleteAccountData(user.id);

            if (!result.success) {
              push('error', '刪除失敗，請稍後再試或聯繫我們');
              // eslint-disable-next-line no-console
              console.error('[MyProfile] deleteAccount failed:', result.error);
              return;
            }

            push('success', '帳號已清空，即將登出');

            setTimeout(async () => {
              await signOut();
              window.location.href = `${window.location.origin}${window.location.pathname}#/`;
            }, 1500);
          }}
          className="text-sm px-4 py-2 rounded-lg border border-state-danger
                     text-state-danger hover:bg-state-danger/10 transition-colors"
        >
          刪除我的帳號
        </button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-content-primary">追蹤動態</h2>
          <Link to="/board?view=following" className="text-sm text-brand-burgundy">
            查看全部 →
          </Link>
        </div>
        <p className="text-xs text-content-muted mt-2">
          前往「追蹤動態」頁面查看你追蹤的人的最新內容
        </p>
      </div>
    </div>
  );
}
