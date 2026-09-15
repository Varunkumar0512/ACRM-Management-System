import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { notificationApi } from '../../services/api/otherApis';
import { Search, Bell, Sun, Moon, LogOut, User as UserIcon, BookOpen } from 'lucide-react';
import { INotification } from '../../types';

interface NavbarProps {
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const { user, signOut } = useAuth();
  const { theme, setTheme, activeTheme } = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      notificationApi
        .getNotifications()
        .then((data) => {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    await notificationApi.markAllAsRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
      }}
    >
      {/* Left: Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <img src="/logo.svg" alt="ACRM Logo" style={{ width: 32, height: 32, borderRadius: '6px' }} />
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              ACRM
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Automated Campus Research Management
            </div>
          </div>
        </Link>
      </div>

      {/* Center: Global Search Bar Trigger */}
      <button
        onClick={onOpenSearch}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.45rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem',
          width: '320px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        aria-label="Search research and projects"
      >
        <Search size={15} />
        <span style={{ flex: 1, textAlign: 'left' }}>Search papers, topics, projects, faculty...</span>
        <kbd
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            padding: '0.1rem 0.35rem',
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          ⌘K
        </kbd>
      </button>

      {/* Right Actions: Theme Toggle, Notifications, User Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(activeTheme === 'dark' ? 'light' : 'dark')}
          className="acr-btn-ghost"
          style={{ padding: '0.45rem', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
          title={`Switch to ${activeTheme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle color theme"
        >
          {activeTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Dropdown */}
        {user && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="acr-btn-ghost"
              style={{ padding: '0.45rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', position: 'relative' }}
              aria-label="View notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  width: '360px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 100,
                  maxHeight: '400px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--primary-600)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div style={{ overflowY: 'auto', flex: 1, padding: '0.5rem 0' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        style={{
                          padding: '0.65rem 1rem',
                          borderBottom: '1px solid var(--border-subtle)',
                          background: n.isRead ? 'transparent' : 'var(--bg-subtle)',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setShowNotifications(false);
                          if (n.linkUrl) navigate(n.linkUrl);
                        }}
                      >
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          {n.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Profile Menu */}
        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--primary-100)',
                  color: 'var(--primary-700)',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--primary-500)',
                }}
              >
                {user.fullName.charAt(0)}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.fullName}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  {user.role}
                </div>
              </div>
            </button>

            {showProfileMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  width: '200px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 100,
                  padding: '0.5rem 0',
                }}
              >
                <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{user.fullName}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 1rem',
                    fontSize: '0.8125rem',
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                  }}
                  className="acr-btn-ghost"
                >
                  <UserIcon size={14} />
                  <span>Profile & Settings</span>
                </Link>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    signOut();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 1rem',
                    fontSize: '0.8125rem',
                    color: '#dc2626',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/sign-in" className="acr-btn acr-btn-secondary acr-btn-sm">
              Sign In
            </Link>
            <Link to="/sign-up" className="acr-btn acr-btn-primary acr-btn-sm">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
