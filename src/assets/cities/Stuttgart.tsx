export default function StuttgartIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"
         className={className} role="img" aria-label="Stuttgart · Fernsehturm">
      <rect x="20" y="248" width="360" height="4" fill="currentColor" />
      <rect x="40" y="200" width="50" height="48" fill="currentColor" opacity="0.5" />
      <rect x="100" y="170" width="45" height="78" fill="currentColor" opacity="0.6" />
      <rect x="260" y="185" width="45" height="63" fill="currentColor" opacity="0.55" />
      <rect x="315" y="205" width="45" height="43" fill="currentColor" opacity="0.4" />
      <rect x="196" y="90" width="8" height="158" fill="currentColor" />
      <ellipse cx="200" cy="85" rx="22" ry="26" fill="currentColor" opacity="0.85" />
      <rect x="197" y="30" width="6" height="35" fill="currentColor" />
      <circle cx="200" cy="26" r="5" fill="currentColor" />
    </svg>
  );
}
