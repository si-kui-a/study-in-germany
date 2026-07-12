export default function BonnIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"
         className={className} role="img" aria-label="Bonn · Skyline">
      <rect x="20" y="248" width="360" height="4" fill="currentColor" />
      <path d="M 20 260 Q 100 254 200 260 T 380 260" stroke="currentColor"
            strokeWidth="2" fill="none" opacity="0.35" />
      <rect x="45" y="185" width="42" height="63" fill="currentColor" opacity="0.5" />
      <rect x="95" y="150" width="38" height="98" fill="currentColor" opacity="0.7" />
      <rect x="150" y="200" width="45" height="48" fill="currentColor" opacity="0.4" />
      <rect x="210" y="140" width="40" height="108" fill="currentColor" />
      <rect x="228" y="115" width="4" height="25" fill="currentColor" />
      <rect x="265" y="180" width="42" height="68" fill="currentColor" opacity="0.55" />
      <rect x="320" y="205" width="36" height="43" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
