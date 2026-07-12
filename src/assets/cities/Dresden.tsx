export default function DresdenIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"
         className={className} role="img" aria-label="Dresden · Frauenkirche">
      <rect x="20" y="248" width="360" height="4" fill="currentColor" />
      <rect x="35" y="185" width="50" height="63" fill="currentColor" opacity="0.45" />
      <rect x="315" y="185" width="50" height="63" fill="currentColor" opacity="0.45" />
      <rect x="150" y="150" width="100" height="98" fill="currentColor" opacity="0.65" />
      <path d="M 150 150 A 50 60 0 0 1 250 150 Z" fill="currentColor" />
      <rect x="195" y="95" width="10" height="55" fill="currentColor" />
      <circle cx="200" cy="90" r="6" fill="currentColor" />
      <rect x="180" y="190" width="18" height="58" fill="currentColor" opacity="0.35" />
      <rect x="202" y="190" width="18" height="58" fill="currentColor" opacity="0.35" />
    </svg>
  );
}
