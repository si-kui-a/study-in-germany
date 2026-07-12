export default function BremenIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"
         className={className} role="img" aria-label="Bremen · Stadtmusikanten">
      <rect x="20" y="248" width="360" height="4" fill="currentColor" />
      <rect x="40" y="190" width="45" height="58" fill="currentColor" opacity="0.45" />
      <rect x="315" y="190" width="45" height="58" fill="currentColor" opacity="0.45" />
      <rect x="150" y="150" width="100" height="98" fill="currentColor" opacity="0.6" />
      {/* 不萊梅樂隊(驢-狗-貓-雞疊羅漢剪影) */}
      <ellipse cx="200" cy="225" rx="20" ry="16" fill="currentColor" />
      <ellipse cx="200" cy="195" rx="15" ry="13" fill="currentColor" />
      <ellipse cx="200" cy="170" rx="11" ry="10" fill="currentColor" />
      <ellipse cx="200" cy="150" rx="7" ry="7" fill="currentColor" />
    </svg>
  );
}
