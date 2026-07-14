import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  getLocalProgress, setLocalProgress,
  fetchCloudProgress, saveCloudProgress,
  markStep, unmarkStep,
} from './workflowProgress';
import type { WorkflowProgress } from './workflowProgress';

export function useWorkflowProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<WorkflowProgress>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (user) {
        const cloud = await fetchCloudProgress(user.id);
        setProgress(cloud);
      } else {
        setProgress(getLocalProgress());
      }
      setLoading(false);
    })();
  }, [user]);

  const toggleStep = useCallback((moduleSlug: string, step: number, status: 'completed' | 'skipped') => {
    setProgress((prev) => {
      const next = markStep(prev, moduleSlug, step, status);
      if (user) {
        void saveCloudProgress(user.id, next);
      } else {
        setLocalProgress(next);
      }
      return next;
    });
  }, [user]);

  const clearStep = useCallback((moduleSlug: string, step: number) => {
    setProgress((prev) => {
      const next = unmarkStep(prev, moduleSlug, step);
      if (user) {
        void saveCloudProgress(user.id, next);
      } else {
        setLocalProgress(next);
      }
      return next;
    });
  }, [user]);

  return { progress, loading, toggleStep, clearStep };
}
