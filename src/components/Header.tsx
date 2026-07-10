import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import { useTheme } from '../lib/theme';
import SearchIcon from '../assets/icons/SearchIcon';
import SearchModal from './SearchModal';
import Logo from '../assets/branding/Logo';

export default function Header() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const { preference, setPreference } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm px-3 py-1.5 rounded-lg transition-colors ${
      isActive
        ? 'text-brand-burgundy'
        : 'text-content-secondary hover:text-content-primary hover:bg-surface-hover'
    }`;

  const cycleTheme = () => {
    const next = preference === 'light' ? 'dark' : preference === 'dark' ? 'system' : 'light';
    setPreference(next);
  };

  const themeIcon = preference === 'light' ? '☀' : preference === 'dark' ? '☾' : '⌂';
  const themeLabel = preference === 'light' ? '淺色' : preference === 'dark' ? '深色' : '系統';

  return (
    <>
      <header className="border-b border-border-subtle bg-surface-card">
        <div className="container-content h-14 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 hover:no-underline
                       transition-transform duration-150 hover:scale-[1.02]"
            aria-label="留德資訊首頁"
          >
            <Logo className="w-8 h-8 shrink-0" />
            <span className="hidden sm:inline font-semibold text-content-primary tracking-tight">
              留德資訊
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            <NavLink to="/schools" className={navClass}>語校</NavLink>
            <NavLink to="/board" className={navClass}>佈告欄</NavLink>
            <NavLink to="/edu" className={navClass}>學用</NavLink>
            <NavLink to="/recommendation" className={navClass}>推薦</NavLink>
            <NavLink to="/faq" className={navClass}>FAQ</NavLink>
            <NavLink to="/my-posts" className={navClass}>我的</NavLink>
            <NavLink to="/privacy" className={navClass}>隱私</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="搜尋（Cmd/Ctrl+K）"
              title="搜尋（Cmd/Ctrl+K）"
              className="btn-ghost text-xs px-2.5 py-1.5"
            >
              <SearchIcon className="w-4 h-4" />
            </button>
            <button
              onClick={cycleTheme}
              aria-label={`主題：${themeLabel}`}
              title={`主題：${themeLabel}`}
              className="btn-ghost text-xs px-2.5 py-1.5"
            >
              <span aria-hidden>{themeIcon}</span>
            </button>
            {loading ? (
              <div className="text-xs text-content-muted">…</div>
            ) : user ? (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  {user.user_metadata?.avatar_url && (
                    <img
                      src={user.user_metadata.avatar_url as string}
                      alt=""
                      className="w-6 h-6 rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <span className="text-xs text-content-secondary max-w-[10rem] truncate">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
                <button onClick={() => signOut()} className="btn-ghost text-xs px-3 py-1.5">
                  登出
                </button>
              </>
            ) : (
              <button onClick={() => signInWithGoogle()} className="btn-primary text-xs px-3 py-1.5">
                Google 登入
              </button>
            )}
          </div>
        </div>
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
