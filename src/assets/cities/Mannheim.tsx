export default function MannheimIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"
         className={className} role="img" aria-label="Mannheim · Wasserturm">
      <rect x="20" y="248" width="360" height="4" fill="currentColor" />
      <rect x="50" y="195" width="45" height="53" fill="currentColor" opacity="0.45" />
      <rect x="305" y="195" width="45" height="53" fill="currentColor" opacity="0.45" />
      <rect x="180" y="150" width="40" height="98" fill="currentColor" />
      <ellipse cx="200" cy="130" rx="45" ry="24" fill="currentColor" opacity="0.85" />
      <rect x="188" y="90" width="24" height="45" fill="currentColor" opacity="0.85" />
      <polygon points="200,60 224,90 176,90" fill="currentColor" />
      <rect x="140" y="200" width="20" height="48" fill="currentColor" opacity="0.4" />
      <rect x="240" y="200" width="20" height="48" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
