export default function FreiburgIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"
         className={className} role="img" aria-label="Freiburg · Münster">
      <rect x="20" y="248" width="360" height="4" fill="currentColor" />
      <path d="M 20 248 Q 100 195 180 215 T 380 210 V 248 Z" fill="currentColor" opacity="0.22" />
      <rect x="150" y="160" width="100" height="88" fill="currentColor" opacity="0.6" />
      <rect x="188" y="100" width="24" height="148" fill="currentColor" />
      <polygon points="188,100 200,60 212,100" fill="currentColor" />
      <rect x="196" y="72" width="8" height="28" fill="currentColor" />
      <rect x="165" y="190" width="18" height="58" fill="currentColor" opacity="0.4" />
      <rect x="217" y="190" width="18" height="58" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
