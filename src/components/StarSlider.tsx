import { useState } from 'react';

interface Props {
  value: number;
  onChange: (v: number) => void;
  label: string;
  hint?: string;
}

/**
 * 1-5 整星選擇器 · 純 SVG
 * 點星星 → 值改為該星數字
 * 已選相同值 → 清除為 0
 */
export default function StarSlider({ value, onChange, label, hint }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const displayValue = hover ?? value;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-content-primary">
          {label}
        </label>
        <span className="text-xs text-content-muted">
          {value > 0 ? `${value} ★` : '未評'}
        </span>
      </div>
      {hint && (
        <div className="text-xs text-content-muted leading-relaxed">
          {hint}
        </div>
      )}
      <div
        className="flex items-center gap-1.5 pt-1"
        onMouseLeave={() => setHover(null)}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = displayValue >= n;
          return (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onClick={() => onChange(value === n ? 0 : n)}
              className="w-7 h-7 flex items-center justify-center
                         hover:scale-110 transition-transform
                         focus:outline-none focus:ring-2 focus:ring-brand-gold rounded"
              aria-label={`${label} · ${n} 星`}
            >
              <Star filled={filled} />
            </button>
          );
        })}
        {value > 0 && (
          <button
            type="button"
            onClick={() => onChange(0)}
            className="ml-3 text-xs text-content-muted hover:text-content-primary"
          >
            清除
          </button>
        )}
      </div>
    </div>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6"
      fill={filled ? 'rgb(var(--brand-gold))' : 'rgb(var(--border-strong))'}
      stroke={filled ? 'rgb(var(--brand-gold-hover))' : 'transparent'}
      strokeWidth="0.5"
    >
      <path d="M 12 2 L 15.09 8.26 L 22 9.27 L 17 14.14 L 18.18 21.02 L 12 17.77 L 5.82 21.02 L 7 14.14 L 2 9.27 L 8.91 8.26 Z" />
    </svg>
  );
}
