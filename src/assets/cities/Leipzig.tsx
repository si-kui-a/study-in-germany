export default function LeipzigIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"
         className={className} role="img" aria-label="Leipzig · Skyline">
      <rect x="20" y="248" width="360" height="4" fill="currentColor" />
      <rect x="40" y="195" width="45" height="53" fill="currentColor" opacity="0.5" />
      <rect x="100" y="160" width="40" height="88" fill="currentColor" opacity="0.65" />
      <rect x="160" y="100" width="42" height="148" fill="currentColor" />
      <rect x="178" y="75" width="6" height="25" fill="currentColor" />
      <rect x="222" y="170" width="38" height="78" fill="currentColor" opacity="0.55" />
      <rect x="275" y="190" width="42" height="58" fill="currentColor" opacity="0.45" />
      <rect x="330" y="210" width="35" height="38" fill="currentColor" opacity="0.35" />
    </svg>
  );
}
