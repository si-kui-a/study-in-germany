export default function EssenIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"
         className={className} role="img" aria-label="Essen · Zeche Zollverein">
      <rect x="20" y="248" width="360" height="4" fill="currentColor" />
      <rect x="40" y="200" width="60" height="48" fill="currentColor" opacity="0.5" />
      <rect x="300" y="195" width="60" height="53" fill="currentColor" opacity="0.5" />
      <rect x="160" y="170" width="80" height="78" fill="currentColor" opacity="0.65" />
      {/* 豎井輪塔剪影 */}
      <rect x="195" y="90" width="10" height="90" fill="currentColor" />
      <rect x="175" y="80" width="50" height="10" fill="currentColor" />
      <circle cx="185" cy="70" r="14" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="215" cy="70" r="14" fill="none" stroke="currentColor" strokeWidth="4" />
    </svg>
  );
}
