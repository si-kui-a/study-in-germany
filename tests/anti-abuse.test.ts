import { beforeEach, describe, expect, it } from 'vitest';
import { communityActionBlockReason, recordCommunityAction } from '../src/lib/antiAbuse';

const memory = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => memory.set(key, value),
  },
});

describe('社群提交防重複', () => {
  beforeEach(() => memory.clear());
  it('第一次投稿可送出', () => expect(communityActionBlockReason('submission', 'a', 1_000_000)).toBeNull());
  it('相同投稿被阻擋', () => {
    recordCommunityAction('submission', 'a', 1_000_000);
    expect(communityActionBlockReason('submission', 'a', 1_100_000)).toContain('相同內容');
  });
  it('投稿冷卻時間內阻擋不同內容', () => {
    recordCommunityAction('submission', 'a', 1_000_000);
    expect(communityActionBlockReason('submission', 'b', 1_030_000)).toContain('速度太快');
  });
  it('投稿每日最多五次', () => {
    for (let i = 0; i < 5; i += 1) recordCommunityAction('submission', String(i), 1_000_000 + i * 70_000);
    expect(communityActionBlockReason('submission', 'next', 1_400_000)).toContain('今日已達');
  });
  it('超過一天會自動清除', () => {
    recordCommunityAction('report', 'a', 1_000_000);
    expect(communityActionBlockReason('report', 'a', 1_000_000 + 86_400_001)).toBeNull();
  });
});
