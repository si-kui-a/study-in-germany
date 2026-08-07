import { beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateOverall } from '../src/lib/ratings';
import { EDIT_WINDOW_MINUTES, isWithinEditWindow } from '../src/lib/editWindow';
import { searchAll } from '../src/lib/search';

vi.mock('../src/lib/supabase', () => ({ supabase: {} }));

describe('六維評分', () => {
  it('沒有填寫時為 0', () => expect(calculateOverall({})).toBe(0));
  it('只計算已填維度', () => expect(calculateOverall({ teaching: 5, price: 3 })).toBe(4));
  it('保留一位小數', () => expect(calculateOverall({ teaching: 4, price: 3, admin: 4 })).toBe(3.7));
  it('忽略 0 與負數', () => expect(calculateOverall({ teaching: 0, price: -1, admin: 5 })).toBe(5));
  it('接受六個可選維度', () => expect(calculateOverall({ teaching: 5, environment: 4, material: 3, admin: 2, transport: 1, price: 3 })).toBe(3));
});

describe('15 分鐘編輯窗', () => {
  beforeEach(() => vi.useFakeTimers().setSystemTime(new Date('2026-08-07T12:00:00Z')));
  it('常數維持 15 分鐘', () => expect(EDIT_WINDOW_MINUTES).toBe(15));
  it('建立後 14 分 59 秒仍可編輯', () => expect(isWithinEditWindow('2026-08-07T11:45:01Z')).toBe(true));
  it('剛好 15 分鐘不可編輯', () => expect(isWithinEditWindow('2026-08-07T11:45:00Z')).toBe(false));
  it('超過 15 分鐘不可編輯', () => expect(isWithinEditWindow('2026-08-07T11:00:00Z')).toBe(false));
});

describe('全站搜尋', () => {
  it('空白查詢沒有結果', () => expect(searchAll('  ')).toEqual([]));
  it('可以搜尋城市', () => expect(searchAll('Berlin').some((hit) => hit.kind === 'school')).toBe(true));
  it('可以搜尋中文教學內容', () => expect(searchAll('簽證').some((hit) => hit.kind === 'edu')).toBe(true));
  it('最多回傳 30 筆', () => expect(searchAll('a').length).toBeLessThanOrEqual(30));
});
