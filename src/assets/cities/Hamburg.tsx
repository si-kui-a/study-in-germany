export default function HamburgIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"
         className={className} role="img" aria-label="Hamburg · Elbphilharmonie">
      <rect x="20" y="248" width="360" height="4" fill="currentColor" />
      <path d="M 20 260 Q 100 254 200 260 T 380 260" stroke="currentColor"
            strokeWidth="2" fill="none" opacity="0.35" />
      <rect x="60" y="200" width="40" height="48" fill="currentColor" opacity="0.5" />
      <rect x="300" y="205" width="40" height="43" fill="currentColor" opacity="0.5" />
      <rect x="150" y="170" width="100" height="78" fill="currentColor" opacity="0.6" />
      <path d="M 150 170 Q 175 120 200 150 Q 225 115 250 170 Z" fill="currentColor" />
      <rect x="185" y="200" width="30" height="48" fill="currentColor" opacity="0.35" />
    </svg>
  );
}
