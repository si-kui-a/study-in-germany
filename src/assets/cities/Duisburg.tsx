export default function DuisburgIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"
         className={className} role="img" aria-label="Duisburg · Skyline">
      <rect x="20" y="248" width="360" height="4" fill="currentColor" />
      <path d="M 20 262 Q 100 256 200 262 T 380 262" stroke="currentColor"
            strokeWidth="2" fill="none" opacity="0.35" />
      <rect x="45" y="200" width="45" height="48" fill="currentColor" opacity="0.5" />
      <rect x="110" y="165" width="35" height="83" fill="currentColor" opacity="0.6" />
      <rect x="165" y="120" width="10" height="128" fill="currentColor" />
      <rect x="150" y="105" width="40" height="12" fill="currentColor" />
      <rect x="230" y="185" width="40" height="63" fill="currentColor" opacity="0.55" />
      <rect x="290" y="205" width="45" height="43" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
