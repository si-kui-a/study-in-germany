import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-section-sm border-t border-border-subtle bg-surface-card">
      <div className="container-content flex flex-col items-center gap-2 py-6 text-sm text-content-muted sm:flex-row sm:justify-between">
        <p>
          留德資訊 MVP — 非官方社群平台，內容由使用者提供
          <span className="ml-2 text-xs text-content-muted">
            build · {__APP_VERSION__ ?? 'dev'}
          </span>
        </p>
        <nav className="flex gap-4">
          <Link to="/privacy">隱私政策</Link>
          <a
            href="https://github.com/lilichen-F/study-in-germany"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
