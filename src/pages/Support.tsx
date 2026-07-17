import { useRegisteredUserCount } from '../lib/useRegisteredUserCount';
import { daysSinceLaunch } from '../lib/siteStats';

/**
 * Phase BK：新增站台統計圖卡（目前已註冊人數／開站天數），「規劃中」
 * 訊息文字維持不動，避免使用者誤以為贊助功能已上線（見 PAT-172）。
 */
export default function Support() {
  const { count, loading } = useRegisteredUserCount();
  const days = daysSinceLaunch();

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-6 text-center">
      <div className="text-4xl">🚧</div>
      <h1 className="text-2xl font-semibold text-content-primary">
        支持本站
      </h1>
      <p className="text-sm text-content-secondary leading-relaxed">
        規劃中。此頁面未來將提供贊助/訂閱入口，
        用於支持本站的長期營運與維護成本。
      </p>
      <p className="text-xs text-content-muted leading-relaxed">
        目前站台仍在早期發展階段。在正式穩定運作、
        並確認需要投入更多維護成本之前，暫不開放此功能。
        感謝你的關注與耐心。
      </p>

      <div className="grid grid-cols-2 gap-3 pt-4">
        <div className="card">
          <div className="text-2xl font-semibold text-brand-burgundy">
            {loading ? '…' : count ?? '—'}
          </div>
          <div className="text-xs text-content-muted mt-1">
            目前已註冊人數
          </div>
        </div>
        <div className="card">
          <div className="text-2xl font-semibold text-brand-burgundy">
            {days}
          </div>
          <div className="text-xs text-content-muted mt-1">
            本站開站天數
          </div>
        </div>
      </div>
    </div>
  );
}
