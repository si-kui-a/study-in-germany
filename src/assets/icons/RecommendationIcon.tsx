export default function RecommendationIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
         strokeLinejoin="round" className={className}>
      {/* 星形推薦 · 五角星 */}
      <path d="M 12 3 L 14.5 9 L 21 9.5 L 16 14 L 17.5 20.5 L 12 17 L 6.5 20.5 L 8 14 L 3 9.5 L 9.5 9 Z" />
      {/* 光芒線 */}
      <line x1="12" y1="1" x2="12" y2="2.5" opacity="0.5" />
      <line x1="22" y1="9" x2="23" y2="8.5" opacity="0.5" />
      <line x1="21" y1="20" x2="22" y2="21" opacity="0.5" />
      <line x1="3" y1="20" x2="2" y2="21" opacity="0.5" />
      <line x1="2" y1="9" x2="1" y2="8.5" opacity="0.5" />
    </svg>
  );
}
