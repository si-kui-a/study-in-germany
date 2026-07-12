export default function KarlsruheIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"
         className={className} role="img" aria-label="Karlsruhe · Skyline">
      <rect x="20" y="248" width="360" height="4" fill="currentColor" />
      <rect x="50" y="195" width="42" height="53" fill="currentColor" opacity="0.5" />
      <rect x="150" y="170" width="100" height="78" fill="currentColor" opacity="0.6" />
      <rect x="188" y="120" width="24" height="128" fill="currentColor" />
      <polygon points="188,120 200,95 212,120" fill="currentColor" />
      <rect x="308" y="195" width="42" height="53" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
