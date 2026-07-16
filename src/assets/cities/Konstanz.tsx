export default function KonstanzIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"
         className={className} role="img" aria-label="Konstanz · Bodensee & Münster">
      {/* Bodensee 湖岸線，取代其他內陸城市慣用的地平線，呼應康斯坦茨唯一濱湖的定位 */}
      <path d="M 0 252 Q 100 238 200 250 T 400 246 V 300 H 0 Z" fill="currentColor" opacity="0.18" />
      <rect x="20" y="248" width="360" height="4" fill="currentColor" />
      {/* Münster 主塔 */}
      <rect x="170" y="150" width="60" height="98" fill="currentColor" opacity="0.7" />
      <rect x="188" y="95" width="24" height="55" fill="currentColor" />
      <polygon points="188,95 200,65 212,95" fill="currentColor" />
      <rect x="196" y="72" width="8" height="23" fill="currentColor" />
      <rect x="178" y="175" width="16" height="45" fill="currentColor" opacity="0.4" />
      <rect x="206" y="175" width="16" height="45" fill="currentColor" opacity="0.4" />
      {/* 湖畔小屋剪影 */}
      <rect x="120" y="205" width="36" height="43" fill="currentColor" opacity="0.5" />
      <polygon points="120,205 138,185 156,205" fill="currentColor" opacity="0.5" />
      <rect x="250" y="212" width="32" height="36" fill="currentColor" opacity="0.5" />
      <polygon points="250,212 266,194 282,212" fill="currentColor" opacity="0.5" />
      {/* 帆船剪影，強調濱湖城市意象 */}
      <path d="M 70 244 L 70 220 L 90 244 Z" fill="currentColor" opacity="0.35" />
      <rect x="65" y="244" width="10" height="4" fill="currentColor" opacity="0.35" />
    </svg>
  );
}
