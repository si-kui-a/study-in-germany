export default function AachenIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"
         className={className} role="img" aria-label="Aachen · Aachener Dom">
      <rect x="20" y="248" width="360" height="4" fill="currentColor" />
      <rect x="40" y="195" width="45" height="53" fill="currentColor" opacity="0.45" />
      <rect x="315" y="195" width="45" height="53" fill="currentColor" opacity="0.45" />
      <polygon points="200,80 250,130 250,180 150,180 150,130" fill="currentColor" opacity="0.75" />
      <rect x="150" y="180" width="100" height="68" fill="currentColor" opacity="0.6" />
      <rect x="196" y="55" width="8" height="30" fill="currentColor" />
      <circle cx="200" cy="50" r="6" fill="currentColor" />
      <rect x="120" y="150" width="20" height="98" fill="currentColor" opacity="0.4" />
      <rect x="260" y="150" width="20" height="98" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
