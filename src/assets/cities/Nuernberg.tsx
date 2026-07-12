export default function NuernbergIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"
         className={className} role="img" aria-label="Nürnberg · Kaiserburg">
      <rect x="20" y="248" width="360" height="4" fill="currentColor" />
      <path d="M 20 248 Q 130 190 200 210 T 380 220 V 248 Z" fill="currentColor" opacity="0.25" />
      <rect x="140" y="150" width="120" height="98" fill="currentColor" opacity="0.65" />
      <rect x="130" y="110" width="24" height="48" fill="currentColor" />
      <rect x="246" y="110" width="24" height="48" fill="currentColor" />
      <rect x="185" y="90" width="30" height="68" fill="currentColor" />
      <polygon points="130,110 142,88 154,110" fill="currentColor" />
      <polygon points="246,110 258,88 270,110" fill="currentColor" />
      <polygon points="185,90 200,68 215,90" fill="currentColor" />
    </svg>
  );
}
