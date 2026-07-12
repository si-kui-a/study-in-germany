export default function HannoverIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"
         className={className} role="img" aria-label="Hannover · Skyline">
      <rect x="20" y="248" width="360" height="4" fill="currentColor" />
      <path d="M 20 260 Q 100 254 200 260 T 380 260" stroke="currentColor"
            strokeWidth="2" fill="none" opacity="0.3" />
      <rect x="50" y="190" width="40" height="58" fill="currentColor" opacity="0.5" />
      <rect x="110" y="150" width="35" height="98" fill="currentColor" opacity="0.65" />
      <rect x="165" y="185" width="70" height="63" fill="currentColor" opacity="0.5" />
      <ellipse cx="200" cy="175" rx="20" ry="14" fill="currentColor" opacity="0.7" />
      <rect x="260" y="170" width="38" height="78" fill="currentColor" opacity="0.55" />
      <rect x="315" y="200" width="36" height="48" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
