export default function KoelnIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"
         className={className} role="img" aria-label="Köln · Kölner Dom">
      <rect x="20" y="248" width="360" height="4" fill="currentColor" />
      <rect x="30" y="190" width="45" height="58" fill="currentColor" opacity="0.45" />
      <rect x="330" y="190" width="45" height="58" fill="currentColor" opacity="0.45" />
      <rect x="150" y="90" width="26" height="158" fill="currentColor" />
      <rect x="224" y="90" width="26" height="158" fill="currentColor" />
      <polygon points="150,90 163,40 176,90" fill="currentColor" />
      <polygon points="224,90 237,40 250,90" fill="currentColor" />
      <rect x="176" y="130" width="48" height="118" fill="currentColor" opacity="0.7" />
      <rect x="190" y="170" width="20" height="30" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
