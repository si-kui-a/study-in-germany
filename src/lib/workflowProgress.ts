import { supabase } from './supabase';
import { fetchWithRetry } from './fetchWithRetry';

export type StepStatus = 'pending' | 'completed' | 'skipped';

export interface ModuleProgress {
  completed: number[];
  skipped: number[];
}

export type WorkflowProgress = Record<string, ModuleProgress>;

const LOCAL_KEY = 'workflow_progress_local';

/** 未登入時的本機暫存，登入後應合併寫入雲端 */
export function getLocalProgress(): WorkflowProgress {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  } catch {
    return {};
  }
}

export function setLocalProgress(progress: WorkflowProgress): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(progress));
}

export function getStepStatus(progress: WorkflowProgress, moduleSlug: string, step: number): StepStatus {
  const mod = progress[moduleSlug];
  if (!mod) return 'pending';
  if (mod.completed?.includes(step)) return 'completed';
  if (mod.skipped?.includes(step)) return 'skipped';
  return 'pending';
}

/** 標記某 step 完成或跳過（跳過視為已處理，用於推進判斷） */
export function markStep(
  progress: WorkflowProgress,
  moduleSlug: string,
  step: number,
  status: 'completed' | 'skipped'
): WorkflowProgress {
  const mod = progress[moduleSlug] ?? { completed: [], skipped: [] };

  return {
    ...progress,
    [moduleSlug]: {
      completed: status === 'completed'
        ? [...new Set([...mod.completed, step])]
        : mod.completed.filter((s) => s !== step),
      skipped: status === 'skipped'
        ? [...new Set([...mod.skipped, step])]
        : mod.skipped.filter((s) => s !== step),
    },
  };
}

/** 取消勾選（回到 pending） */
export function unmarkStep(progress: WorkflowProgress, moduleSlug: string, step: number): WorkflowProgress {
  const mod = progress[moduleSlug];
  if (!mod) return progress;
  return {
    ...progress,
    [moduleSlug]: {
      completed: mod.completed.filter((s) => s !== step),
      skipped: mod.skipped.filter((s) => s !== step),
    },
  };
}

/** 取得某模組下一個未完成/未跳過的 step 編號，全部完成則回傳 null */
export function getNextPendingStep(
  progress: WorkflowProgress,
  moduleSlug: string,
  totalSteps: number
): number | null {
  const mod = progress[moduleSlug];
  const done = new Set([...(mod?.completed ?? []), ...(mod?.skipped ?? [])]);
  for (let i = 1; i <= totalSteps; i++) {
    if (!done.has(i)) return i;
  }
  return null;
}

/** 雲端同步：讀取 */
export async function fetchCloudProgress(userId: string): Promise<WorkflowProgress> {
  const { data, error } = await fetchWithRetry(
    () => supabase
      .from('profiles')
      .select('workflow_progress')
      .eq('id', userId)
      .single()
      .retry(false),
    { table: 'profiles', source: 'fetchCloudProgress' },
  );
  if (error) {
    // eslint-disable-next-line no-console
    console.error('[workflowProgress] fetchCloudProgress failed:', error);
    return {};
  }
  return (data?.workflow_progress as WorkflowProgress) ?? {};
}

/**
 * 雲端同步：寫入。
 * Phase AP：失敗時必須 throw（而非只 console.error 後靜默 resolve），
 * 否則呼叫端的 catch 永遠不會觸發、使用者永遠看不到任何失敗提示（PAT-139）。
 */
export async function saveCloudProgress(userId: string, progress: WorkflowProgress): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ workflow_progress: progress })
    .eq('id', userId);
  if (error) {
    // eslint-disable-next-line no-console
    console.error('[workflowProgress] saveCloudProgress failed:', error);
    throw error;
  }
}
