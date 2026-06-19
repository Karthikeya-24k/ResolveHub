import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmail, getRole, getName, removeToken } from '../services/auth';
import useDarkMode from '../hooks/useDarkMode';
import { useSearchContext } from '../context/SearchContext';
import { getNotifications, markNotificationsRead } from '../services/api';

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const email = getEmail();
  const role  = getRole();
  const name  = getName();
  const [dark, toggleDark] = useDarkMode();
  const { query, setQuery } = useSearchContext();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs]         = useState([]);
  const notifRef = useRef(null);

  useEffect(() => {
    getNotifications()
      .then((res) => setNotifs(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    markNotificationsRead()
      .then(() => setNotifs((prev) => prev.map((n) => ({ ...n, read: true }))))
      .catch(() => {});
  };

  const handleNotifClick = (notif) => {
    navigate(`/issues/${notif.issueId}`);
    setShowNotifs(false);
    if (!notif.read) {
      markNotificationsRead()
        .then(() => setNotifs((prev) => prev.map((n) => ({ ...n, read: true }))))
        .catch(() => {});
    }
  };

  const logout = () => {
    removeToken();
    navigate('/login');
  };

  return (
    <header
      className="flex items-center justify-between px-3 sm:px-4 py-2.5 w-full sticky top-0 z-40 gap-2"
      style={{ backgroundColor: 'var(--navbar-bg)', borderBottom: '1px solid var(--surface-border)', backdropFilter: 'blur(20px)' }}
    >
      {/* ── Left: hamburger + logo ── */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-token-secondary hover:bg-token-raised shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg primary-gradient flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-white text-base sm:text-lg">shield_person</span>
          </div>
          <h1
            className="text-base sm:text-lg font-black font-headline tracking-tight text-indigo-600 shrink-0 leading-none"
          >
            ResolveHub
          </h1>
        </div>
      </div>

      {/* ── Center: search (hidden on mobile) ── */}
      <div className="relative flex-1 max-w-md mx-4 hidden sm:block">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none text-token-faint z-10">
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search issues, IDs or users..."
          style={{ paddingLeft: '2.25rem' }}
          className="field pr-4 text-sm w-full"
        />
      </div>

      {/* ── Right: actions ── */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        {/* Dark mode */}
        <button
          onClick={toggleDark}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-lg transition-colors text-token-secondary hover:bg-token-raised min-w-[40px] min-h-[40px] flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[20px]">{dark ? 'light_mode' : 'dark_mode'}</span>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs((v) => !v)}
            className="relative p-2 rounded-lg transition-colors text-token-secondary hover:bg-token-raised min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-0.5 rounded-full bg-red-500 flex items-center justify-center text-white text-[9px] font-black">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div
              className="absolute right-0 mt-2 rounded-xl shadow-2xl z-50 overflow-hidden"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--surface-border)',
                width: 'min(320px, calc(100vw - 1rem))',
                maxWidth: '320px',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold hover:underline"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-72 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="flex flex-col items-center py-10 gap-2" style={{ color: 'var(--text-faint)' }}>
                    <span className="material-symbols-outlined text-3xl">notifications_off</span>
                    <p className="text-xs">No notifications yet</p>
                  </div>
                ) : (
                  notifs.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
                      style={{ backgroundColor: !notif.read ? 'var(--surface-raised)' : 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-soft)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = !notif.read ? 'var(--surface-raised)' : 'transparent'}
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-300 text-sm">chat</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold leading-snug break-words" style={{ color: 'var(--text-primary)' }}>
                          {notif.message}
                        </p>
                        <p className="text-[11px] mt-1 truncate" style={{ color: 'var(--text-faint)' }}>
                          {notif.issueTitle} · {timeAgo(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifs.length > 0 && (
                <div style={{ borderTop: '1px solid var(--surface-border)' }}>
                  <button
                    onClick={() => { navigate('/issues'); setShowNotifs(false); }}
                    className="w-full py-2.5 text-xs font-bold transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-raised)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    View all issues
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider — hidden on very small screens */}
        <div className="hidden sm:block h-8 w-px mx-1" style={{ backgroundColor: 'var(--surface-border)' }} />

        {/* Avatar + actions */}
        <div className="flex items-center gap-1 sm:gap-2 pl-1">
          {/* Email/role — desktop only */}
          <div className="hidden lg:block text-right">
            <p className="text-sm font-bold leading-none text-token-primary truncate max-w-[140px]">{email}</p>
            <p className="text-[10px] uppercase font-semibold mt-1 text-token-muted">{role}</p>
          </div>

          {/* Avatar */}
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full primary-gradient flex items-center justify-center shrink-0 text-white font-bold text-sm select-none"
            title={name || email}
          >
            {(name || email || '?')[0].toUpperCase()}
          </div>

          {/* Password + Logout */}
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => navigate('/profile/change-password')}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-colors text-token-secondary hover:bg-token-raised min-h-[32px]"
            >
              <span className="material-symbols-outlined text-sm">lock_reset</span>
              <span className="hidden sm:inline">Password</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-colors text-token-secondary hover:bg-token-raised min-h-[32px]"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
