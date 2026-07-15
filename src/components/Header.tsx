import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import { useTheme } from '../lib/theme';
import SearchIcon from '../assets/icons/SearchIcon';
import SearchModal from './SearchModal';
import Logo from '../assets/branding/Logo';

export default function Header() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const { preference, setPreference } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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

  // 路由變化時自動關閉 mobile 選單（PAT-89）
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm px-3 py-1.5 rounded-lg transition-colors ${
      isActive
        ? 'text-brand-burgundy'
        : 'text-content-secondary hover:text-content-primary hover:bg-surface-hover'
    }`;

  const dropdownLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-lg text-sm no-underline transition-colors ${
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
      <header className="relative border-b border-border-subtle bg-surface-card">
        <div className="container-content h-14 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 hover:no-underline
                       transition-transform duration-150 hover:scale-[1.02]"
            aria-label="留德華首頁"
          >
            <Logo className="w-8 h-8 shrink-0" />
            <span className="hidden sm:inline font-semibold text-content-primary tracking-tight">
              留德華
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            <NavLink to="/board" className={navClass}>討論區</NavLink>
            <NavLink to="/recommendation" className={navClass}>資源</NavLink>
            <NavLink to="/faq" className={navClass}>常見問答</NavLink>

            {/* Phase AQ：資源 dropdown（語校 + 作戰手冊 收合，PAT-141）*/}
            <div className="relative group">
              <button type="button" className={navClass({ isActive: false })}>
                資源 ▾
              </button>
              <div className="absolute right-0 top-full pt-1 hidden group-hover:block group-focus-within:block z-50">
                <div className="min-w-[10rem] rounded-lg border border-border-subtle
                                bg-surface-card shadow-lg p-1.5">
                  <NavLink to="/schools" className={dropdownLinkClass}>語校</NavLink>
                  <NavLink to="/edu" className={dropdownLinkClass}>作戰手冊</NavLink>
                </div>
              </div>
            </div>

            {/* 更多：隱私政策 / 支持本站（Phase X 起移出常見問答，升為一級導覽；
                推薦專區移出一級導覽、併入學用 Hub 次要入口，見 Edu.tsx） */}
            <div className="relative group">
              <button type="button" className={navClass({ isActive: false })}>
                更多 ▾
              </button>
              <div className="absolute right-0 top-full pt-1 hidden group-hover:block group-focus-within:block z-50">
                <div className="min-w-[10rem] rounded-lg border border-border-subtle
                                bg-surface-card shadow-lg p-1.5">
                  <NavLink to="/privacy" className={dropdownLinkClass}>隱私政策</NavLink>
                  <NavLink to="/support" className={dropdownLinkClass}>支持本站</NavLink>
                </div>
              </div>
            </div>

            {/* 我的：貼文 / 編輯個人資料（登入後才顯示，PAT-88） */}
            {user && (
              <div className="relative group">
                <button type="button" className={navClass({ isActive: false })}>
                  我的 ▾
                </button>
                <div className="absolute right-0 top-full pt-1 hidden group-hover:block group-focus-within:block z-50">
                  <div className="min-w-[10rem] rounded-lg border border-border-subtle
                                  bg-surface-card shadow-lg p-1.5">
                    <NavLink to="/board?view=mine&sub=posts" className={dropdownLinkClass}>我的貼文</NavLink>
                    <NavLink to="/my-profile" className={dropdownLinkClass}>編輯個人資料</NavLink>
                  </div>
                </div>
              </div>
            )}
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

            {/* Mobile hamburger button · 只在 sm 以下顯示（PAT-89） */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg hover:bg-surface-hover transition-colors"
              aria-label={mobileMenuOpen ? '關閉選單' : '開啟選單'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile 選單面板（PAT-89） */}
        {mobileMenuOpen && (
          <div className="sm:hidden absolute top-full left-0 right-0
                          bg-surface-canvas border-b border-border-subtle
                          shadow-lg z-50">
            <nav className="flex flex-col p-4 gap-1">
              <NavLink
                to="/board"
                className="px-3 py-2.5 rounded-lg hover:bg-surface-hover
                           text-content-primary no-underline"
              >
                討論區
              </NavLink>
              <NavLink
                to="/recommendation"
                className="px-3 py-2.5 rounded-lg hover:bg-surface-hover
                           text-content-primary no-underline"
              >
                資源
              </NavLink>
              <NavLink
                to="/faq"
                className="px-3 py-2.5 rounded-lg hover:bg-surface-hover
                           text-content-primary no-underline"
              >
                常見問答
              </NavLink>

              <div className="my-2 border-t border-border-subtle" />

              {/* Phase AQ：資源（語校 + 作戰手冊 收合，PAT-141） */}
              <NavLink
                to="/schools"
                className="px-3 py-2.5 rounded-lg hover:bg-surface-hover
                           text-content-primary no-underline"
              >
                語校
              </NavLink>
              <NavLink
                to="/edu"
                className="px-3 py-2.5 rounded-lg hover:bg-surface-hover
                           text-content-primary no-underline"
              >
                作戰手冊
              </NavLink>

              <div className="my-2 border-t border-border-subtle" />

              <NavLink
                to="/privacy"
                className="px-3 py-2.5 rounded-lg hover:bg-surface-hover
                           text-content-secondary text-sm no-underline"
              >
                隱私政策
              </NavLink>
              <NavLink
                to="/support"
                className="px-3 py-2.5 rounded-lg hover:bg-surface-hover
                           text-content-secondary text-sm no-underline"
              >
                支持本站
              </NavLink>

              {user && (
                <>
                  <div className="my-2 border-t border-border-subtle" />
                  <NavLink
                    to="/board?view=mine&sub=posts"
                    className="px-3 py-2.5 rounded-lg hover:bg-surface-hover
                               text-content-secondary text-sm no-underline"
                  >
                    我的貼文
                  </NavLink>
                  <NavLink
                    to="/my-profile"
                    className="px-3 py-2.5 rounded-lg hover:bg-surface-hover
                               text-content-secondary text-sm no-underline"
                  >
                    編輯個人資料
                  </NavLink>
                </>
              )}
            </nav>
          </div>
        )}
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
