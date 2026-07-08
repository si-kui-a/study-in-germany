import { MOCK_MODE } from '../lib/mockMode';

/** 只在 VITE_MOCK_MODE=1 時顯示，提醒開發者當前資料非真實。 */
export default function MockBanner() {
  if (!MOCK_MODE) return null;
  return (
    <div
      role="status"
      className="bg-brand-gold/20 border-b border-brand-gold/40
                 text-brand-burgundy text-xs text-center py-1.5 font-medium"
    >
      Mock Mode · 顯示的資料來自 <code>src/lib/mockData.ts</code>，寫入功能已停用
    </div>
  );
}
