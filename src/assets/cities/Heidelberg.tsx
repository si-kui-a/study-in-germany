export default function HeidelbergIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"
         className={className} role="img" aria-label="Heidelberg · Schloss">
      <rect x="20" y="248" width="360" height="4" fill="currentColor" />
      {/* 山丘輪廓 */}
      <path d="M 20 248 Q 130 150 240 200 T 380 210 V 248 Z" fill="currentColor" opacity="0.25" />
      <rect x="130" y="140" width="120" height="90" fill="currentColor" opacity="0.7" />
      <rect x="120" y="120" width="26" height="60" fill="currentColor" />
      <rect x="234" y="120" width="26" height="60" fill="currentColor" />
      <polygon points="120,120 133,95 146,120" fill="currentColor" />
      <polygon points="234,120 247,95 260,120" fill="currentColor" />
      <rect x="170" y="170" width="20" height="60" fill="currentColor" opacity="0.4" />
      <rect x="210" y="170" width="20" height="60" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
