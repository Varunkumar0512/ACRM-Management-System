import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { notificationApi } from '../../services/api/otherApis';
import {
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Shield,
  HelpCircle,
  Menu,
  X,
  CheckCircle,
  Clock,
  Sparkles,
  Compass,
} from 'lucide-react';
import { INotification } from '../../types';

interface NavbarProps {
  onOpenSearch: () => void;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onToggleMobileSidebar,
  isMobileSidebarOpen = false,
}) => {
  const { user, signOut } = useAuth();
  const { setTheme, activeTheme } = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate('/sign-in');
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
        padding: '0 1.25rem',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Left: Mobile Toggle & Institutional Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Mobile menu hamburger button */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="acr-btn-ghost"
            style={{
              padding: '0.45rem',
              borderRadius: 'var(--radius-md)',
              display: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
            id="acr-mobile-menu-btn"
            aria-label="Toggle navigation menu"
          >
            {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}

        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          {/* Institutional Emblem */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '8px',
              backgroundColor: '#4268E8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(66, 104, 232, 0.25)',
              flexShrink: 0,
            }}
          >
            <Compass size={18} color="#FFFFFF" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  fontFamily: 'var(--font-display)',
                  color: 'var(--text-primary)',
                }}
              >
                ACRM
              </span>
            </div>
            <span
              style={{
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                fontWeight: 500,
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
              }}
              className="acr-brand-sub"
            >
              Automated Campus Research Management
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Global Search Bar Trigger */}
      <button
        onClick={onOpenSearch}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.5rem 0.85rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem',
          width: '100%',
          maxWidth: '380px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          margin: '0 1rem',
        }}
        aria-label="Search research literature, topics, projects, and faculty"
        className="acr-search-trigger"
      >
        <Search size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Search papers, topics, projects, faculty...
        </span>
        <kbd
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            padding: '0.1rem 0.35rem',
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
            flexShrink: 0,
          }}
        >
          ⌘K
        </kbd>
      </button>

      {/* Right: Theme Toggle, Notifications, User Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(activeTheme === 'dark' ? 'light' : 'dark')}
          className="acr-btn-ghost"
          style={{
            padding: '0.45rem',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
          }}
          title={`Switch to ${activeTheme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle color theme"
        >
          {activeTheme === 'dark' ? <Sun size={18} color="#FBBF24" /> : <Moon size={18} />}
        </button>

        {/* Notifications Dropdown */}
        {user && (
          <div style={{ position: 'relative' }} ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="acr-btn-ghost"
              style={{
                padding: '0.45rem',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                position: 'relative',
                color: showNotifications ? 'var(--color-royal-blue)' : 'var(--text-secondary)',
                backgroundColor: showNotifications ? 'var(--bg-subtle)' : 'transparent',
              }}
              aria-label="View notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    backgroundColor: '#EF4444',
                    color: '#ffffff',
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    boxShadow: '0 0 6px rgba(239, 68, 68, 0.4)',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '340px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  zIndex: 60,
                  overflow: 'hidden',
                  animation: 'fadeIn 0.15s ease-out',
                }}
              >
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--bg-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span
                        style={{
                          fontSize: '0.625rem',
                          padding: '0.1rem 0.4rem',
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          color: '#EF4444',
                          fontWeight: 800,
                          borderRadius: 'var(--radius-pill)',
                        }}
                      >
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '0.72rem',
                        color: 'var(--color-royal-blue)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <CheckCircle size={28} color="#10B981" style={{ margin: '0 auto 0.5rem' }} />
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        All caught up
                      </div>
                      <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                        No unread alerts in your institutional inbox.
                      </div>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        style={{
                          padding: '0.85rem 1rem',
                          borderBottom: '1px solid var(--border-subtle)',
                          backgroundColor: n.isRead ? 'transparent' : 'rgba(36, 87, 214, 0.04)',
                          display: 'flex',
                          gap: '0.75rem',
                          alignItems: 'flex-start',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: n.isRead ? 'transparent' : 'var(--color-royal-blue)',
                            marginTop: '6px',
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.8125rem', fontWeight: n.isRead ? 600 : 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                            {n.message}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={11} />
                            {new Date(n.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div
                  style={{
                    padding: '0.65rem 1rem',
                    borderTop: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-subtle)',
                    textAlign: 'center',
                  }}
                >
                  <Link
                    to="/support"
                    onClick={() => setShowNotifications(false)}
                    style={{ fontSize: '0.75rem', color: 'var(--color-royal-blue)', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Open Institutional Support Center →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Profile Avatar & Dropdown */}
        {user ? (
          <div style={{ position: 'relative' }} ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: 'var(--radius-pill)',
              }}
              aria-label="User account menu"
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2457D6 0%, #3B82F6 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  boxShadow: '0 2px 6px rgba(36, 87, 214, 0.3)',
                }}
              >
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            </button>

            {/* Profile Popover Menu */}
            {showProfileMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '240px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  zIndex: 60,
                  overflow: 'hidden',
                  animation: 'fadeIn 0.15s ease-out',
                }}
              >
                {/* User Info Header */}
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-subtle)',
                  }}
                >
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.fullName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.1rem' }}>
                    {user.email}
                  </div>
                  <div style={{ marginTop: '0.4rem' }}>
                    <span
                      style={{
                        fontSize: '0.625rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: 'rgba(36, 87, 214, 0.12)',
                        color: 'var(--color-royal-blue)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Menu items */}
                <div style={{ padding: '0.35rem 0' }}>
                  <Link
                    to="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.6rem 1rem',
                      fontSize: '0.8125rem',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                    }}
                    className="acr-dropdown-item"
                  >
                    <UserIcon size={15} color="var(--text-secondary)" />
                    <span>Profile & Settings</span>
                  </Link>

                  <Link
                    to="/support"
                    onClick={() => setShowProfileMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.6rem 1rem',
                      fontSize: '0.8125rem',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                    }}
                    className="acr-dropdown-item"
                  >
                    <HelpCircle size={15} color="var(--text-secondary)" />
                    <span>Institutional Support</span>
                  </Link>

                  <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '0.35rem 0' }} />

                  <button
                    onClick={handleSignOut}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.6rem 1rem',
                      fontSize: '0.8125rem',
                      color: '#EF4444',
                      background: 'none',
                      border: 'none',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                    className="acr-dropdown-item"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link to="/sign-in" className="acr-btn acr-btn-primary acr-btn-sm">
            Sign In
          </Link>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          #acr-mobile-menu-btn {
            display: flex !important;
          }
          .acr-brand-sub {
            display: none !important;
          }
          .acr-search-trigger {
            max-width: 160px !important;
            padding: 0.4rem 0.6rem !important;
          }
          .acr-search-trigger kbd {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .acr-search-trigger span {
            display: none !important;
          }
          .acr-search-trigger {
            width: auto !important;
            max-width: none !important;
            margin: 0 0.5rem !important;
          }
        }
        .acr-dropdown-item:hover {
          background-color: var(--bg-subtle);
        }
      `}</style>
    </header>
  );
};
