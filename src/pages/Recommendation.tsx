import { Link } from 'react-router-dom';
import RecommendationIcon from '../assets/icons/RecommendationIcon';

/**
 * Phase G · 推薦專區 placeholder
 * 內容於後續 Phase 補完 · 子分類：通用推薦 + 各板塊專門推薦
 */
export default function Recommendation() {
  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs text-content-muted uppercase tracking-wider mb-2">
          Recommendations
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-3">
          <span className="text-brand-gold w-8 h-8 sm:w-10 sm:h-10 inline-flex">
            <RecommendationIcon className="w-full h-full" />
          </span>
          推薦專區
        </h1>
        <p className="text-sm text-content-secondary mt-3 max-w-2xl leading-relaxed">
          蒐集德國 / 歐洲 / 台灣好物、好用工具、方案、優惠。
          分為「通用推薦」與各板塊的專門推薦區。
        </p>
      </div>

      <div className="card bg-brand-gold-soft border-brand-gold/30">
        <div className="text-sm font-medium text-content-primary mb-2">
          🚧 內容正在整理中
        </div>
        <p className="text-sm text-content-secondary leading-relaxed">
          此板塊將於後續版本補完。目前規劃的子分類：
        </p>
        <div className="pt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {[
            { label: '通用推薦', hint: '好物、優惠、工具' },
            { label: '簽證相關', hint: 'Sperrkonto、保險' },
            { label: '落地相關', hint: '銀行、SIM、家具' },
            { label: '學程相關', hint: 'uni-assist、DAAD' },
            { label: '獎學金', hint: '各獎學金資料庫' },
            { label: '台灣海外方案', hint: '銀行、電信、保險' },
          ].map((s) => (
            <div
              key={s.label}
              className="p-3 rounded-lg border border-border-subtle bg-surface-card"
            >
              <div className="font-medium text-content-primary">{s.label}</div>
              <div className="text-content-muted mt-0.5">{s.hint}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card bg-surface-section max-w-2xl">
        <div className="text-sm font-medium text-content-primary mb-2">
          📝 有推薦想貢獻？
        </div>
        <p className="text-sm text-content-secondary leading-relaxed">
          歡迎於{' '}
          <Link to="/board">佈告欄</Link>{' '}
          分享你的推薦，或於 GitHub Issue 提交。留言功能將於後續版本上線。
        </p>
      </div>
    </div>
  );
}
