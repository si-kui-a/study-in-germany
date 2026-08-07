import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/supabase', () => ({ supabase: {} }));
vi.mock('../src/lib/fetchWithRetry', () => ({ fetchWithRetry: vi.fn() }));

import { getNextPendingStep, getStepStatus, markStep, unmarkStep } from '../src/lib/workflowProgress';

describe('作戰手冊進度', () => {
  it('沒有紀錄時為 pending', () => expect(getStepStatus({}, 'visa', 1)).toBe('pending'));
  it('可以標記完成', () => expect(getStepStatus(markStep({}, 'visa', 1, 'completed'), 'visa', 1)).toBe('completed'));
  it('完成改為跳過時不會同時存在', () => {
    const progress = markStep(markStep({}, 'visa', 1, 'completed'), 'visa', 1, 'skipped');
    expect(progress.visa).toEqual({ completed: [], skipped: [1] });
  });
  it('重複標記不會產生重複值', () => {
    const once = markStep({}, 'visa', 1, 'completed');
    expect(markStep(once, 'visa', 1, 'completed').visa.completed).toEqual([1]);
  });
  it('取消標記會回到 pending', () => {
    const progress = unmarkStep(markStep({}, 'visa', 1, 'completed'), 'visa', 1);
    expect(getStepStatus(progress, 'visa', 1)).toBe('pending');
  });
  it('取得下一個未處理步驟', () => {
    const progress = markStep(markStep({}, 'visa', 1, 'completed'), 'visa', 2, 'skipped');
    expect(getNextPendingStep(progress, 'visa', 3)).toBe(3);
  });
  it('全部處理完畢回傳 null', () => {
    const progress = markStep(markStep({}, 'visa', 1, 'completed'), 'visa', 2, 'skipped');
    expect(getNextPendingStep(progress, 'visa', 2)).toBeNull();
  });
});
