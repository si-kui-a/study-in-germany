export default function DortmundIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"
         className={className} role="img" aria-label="Dortmund · Skyline">
      <rect x="20" y="248" width="360" height="4" fill="currentColor" />
      <rect x="45" y="190" width="42" height="58" fill="currentColor" opacity="0.5" />
      <rect x="105" y="150" width="38" height="98" fill="currentColor" opacity="0.65" />
      <rect x="180" y="95" width="12" height="153" fill="currentColor" />
      <circle cx="186" cy="85" r="12" fill="currentColor" opacity="0.85" />
      <rect x="240" y="175" width="40" height="73" fill="currentColor" opacity="0.55" />
      <rect x="295" y="200" width="42" height="48" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
