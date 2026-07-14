import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './toast';
import {
  getLocalProgress, setLocalProgress,
  fetchCloudProgress, saveCloudProgress,
  markStep, unmarkStep,
} from './workflowProgress';
import type { WorkflowProgress } from './workflowProgress';

interface WorkflowProgressContextValue {
  progress: WorkflowProgress;
  loading: boolean;
  toggleStep: (moduleSlug: string, step: number, status: 'completed' | 'skipped') => void;
  clearStep: (moduleSlug: string, step: number) => void;
}

const WorkflowProgressContext = createContext<WorkflowProgressContextValue | null>(null);

/**
 * Phase AP：修復進度勾選跨頁未同步的 bug（PAT-139）。
 *
 * 根因：Phase AO 讓每個消費頁面（EduTopic/MyProfile/Home）各自呼叫
 * useWorkflowProgress()，各自擁有獨立的 state 副本，僅在該元件「掛載當下」
 * fetch 一次。跨頁導覽會卸載舊頁面、掛載新頁面，新頁面重新 fetch 雲端資料——
 * 但雲端寫入（saveCloudProgress）是 fire-and-forget、未等待完成即允許導覽，
 * 若使用者點擊「標記完成」後立即切換頁面，新頁面的 fetch 有機會搶在寫入
 * 完成前執行，讀到尚未更新的舊資料，且此後沒有任何重新 fetch 機制
 * （除非整頁重新整理）。
 *
 * 修法：改為單一 Provider，掛載於 App 層級、跨路由導覽不會卸載，進度狀態
 * 全站只有一份記憶體副本。使用者操作立即同步更新這份共享狀態（同步，
 * 無需等待雲端寫入或重新 fetch），雲端寫入僅作為背景持久化，不再是
 * 「切換頁面後讀到什麼」的依據。
 */
export function WorkflowProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { push } = useToast();
  const [progress, setProgress] = useState<WorkflowProgress>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (user) {
        setProgress(await fetchCloudProgress(user.id));
      } else {
        setProgress(getLocalProgress());
      }
      setLoading(false);
    })();
  }, [user]);

  const persist = useCallback((next: WorkflowProgress) => {
    if (user) {
      saveCloudProgress(user.id, next).catch(() => {
        push('error', '進度儲存失敗，請檢查網路連線後重試');
      });
    } else {
      setLocalProgress(next);
    }
  }, [user, push]);

  const toggleStep = useCallback((moduleSlug: string, step: number, status: 'completed' | 'skipped') => {
    const next = markStep(progress, moduleSlug, step, status);
    setProgress(next);
    persist(next);
  }, [progress, persist]);

  const clearStep = useCallback((moduleSlug: string, step: number) => {
    const next = unmarkStep(progress, moduleSlug, step);
    setProgress(next);
    persist(next);
  }, [progress, persist]);

  return (
    <WorkflowProgressContext.Provider value={{ progress, loading, toggleStep, clearStep }}>
      {children}
    </WorkflowProgressContext.Provider>
  );
}

export function useWorkflowProgressContext(): WorkflowProgressContextValue {
  const ctx = useContext(WorkflowProgressContext);
  if (!ctx) {
    throw new Error('useWorkflowProgressContext must be used within a WorkflowProgressProvider');
  }
  return ctx;
}
