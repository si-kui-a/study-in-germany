export type PersonaStage = 'visa_prep' | 'landing' | 'settled' | 'leaving';

export const PERSONA_STAGE_LABELS: Record<PersonaStage, { label: string; hint: string }> = {
  visa_prep: { label: '準備簽證', hint: '還在台灣，準備申請簽證' },
  landing: { label: '剛落地', hint: '剛到德國，處理落地手續' },
  settled: { label: '穩定期', hint: '已經安頓好，日常生活中' },
  leaving: { label: '準備離開', hint: '即將結束留德生活' },
};

/** persona_stage 對應到 Edu Hub 的推薦模組 slug */
export const PERSONA_MODULE_MAP: Record<PersonaStage, string> = {
  visa_prep: 'visa',
  landing: 'arrival',
  settled: 'policy',
  leaving: 'exit',
};

const STORAGE_KEY = 'onboarding_completed';
const LOCAL_STAGE_KEY = 'persona_stage_local';
/** Phase BA：略過導覽（非選定階段完成）的永久旗標，不可逆，見 PAT-161 */
const SKIPPED_KEY = 'has_skipped_onboarding_before';

export function isOnboardingCompleted(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function markOnboardingCompleted(): void {
  localStorage.setItem(STORAGE_KEY, 'true');
}

/** Phase BA：導覽視窗顯示與否已改綁定登入狀態（見 Home.tsx），此旗標僅供
 * 其他既有邏輯（如 MyProfile「重新設定我的階段」）沿用，不再作為顯示判斷依據 */
export function hasSkippedOnboardingBefore(): boolean {
  return localStorage.getItem(SKIPPED_KEY) === 'true';
}

export function markSkippedOnboardingBefore(): void {
  localStorage.setItem(SKIPPED_KEY, 'true');
}

export function getLocalPersonaStage(): PersonaStage | null {
  const v = localStorage.getItem(LOCAL_STAGE_KEY);
  return (v as PersonaStage) || null;
}

export function setLocalPersonaStage(stage: PersonaStage | null): void {
  if (stage) {
    localStorage.setItem(LOCAL_STAGE_KEY, stage);
  } else {
    localStorage.removeItem(LOCAL_STAGE_KEY);
  }
}

/** 重新觸發導覽（供「我的資料」頁「重新設定我的階段」使用） */
export function resetOnboarding(): void {
  localStorage.removeItem(STORAGE_KEY);
}
