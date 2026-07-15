export default function BoardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"
         className={className} role="img" aria-label="討論區"
         fill="none" stroke="currentColor" strokeWidth="1.5"
         strokeLinecap="round" strokeLinejoin="round">
      {/* 主板 · 實心色塊 */}
      <rect x="10" y="12" width="40" height="36" rx="2"
            fill="currentColor" opacity="0.25" stroke="currentColor" />
      {/* 3 張便利貼 · 更深色塊 */}
      <rect x="16" y="18" width="12" height="10" fill="currentColor" opacity="0.5" stroke="none" />
      <rect x="32" y="18" width="12" height="10" fill="currentColor" opacity="0.4" stroke="none" />
      <rect x="16" y="32" width="12" height="10" fill="currentColor" opacity="0.45" stroke="none" />
      {/* 掛勾線條點綴 */}
      <path d="M 26 12 Q 26 6 30 6 Q 34 6 34 12" />
    </svg>
  );
}
