export default function RegensburgIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"
         className={className} role="img" aria-label="Regensburg · Skyline">
      <rect x="20" y="248" width="360" height="4" fill="currentColor" />
      <path d="M 20 258 Q 100 253 200 258 T 380 258" stroke="currentColor"
            strokeWidth="2" fill="none" opacity="0.35" />
      <rect x="60" y="180" width="45" height="68" fill="currentColor" opacity="0.55" />
      <rect x="165" y="110" width="24" height="138" fill="currentColor" />
      <rect x="211" y="110" width="24" height="138" fill="currentColor" />
      <polygon points="165,110 177,85 189,110" fill="currentColor" />
      <polygon points="211,110 223,85 235,110" fill="currentColor" />
      <rect x="295" y="190" width="45" height="58" fill="currentColor" opacity="0.45" />
    </svg>
  );
}
