import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  User,
  FolderGit2,
  Trophy,
  BookOpen,
  FileText,
  Sparkles,
  ShieldCheck,
  LifeBuoy,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Users,
  Layers,
  History,
  Bookmark,
  FileCheck2,
  X,
  Shield,
  Compass,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  if (!user) return null;

  const currentRole = ((user.role || '') as string).toUpperCase();

  const dashboardRoute =
    currentRole === 'FACULTY'
      ? '/faculty/dashboard'
      : currentRole === 'ADMIN'
      ? '/admin/dashboard'
      : '/student/dashboard';

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: collapsed ? '0.7rem 0' : '0.62rem 0.9rem',
    justifyContent: collapsed ? 'center' : 'flex-start',
    borderRadius: '8px',
    color: isActive ? '#FFFFFF' : '#94A3B8',
    background: isActive
      ? 'rgba(65, 105, 225, 0.18)'
      : 'transparent',
    fontWeight: isActive ? 700 : 500,
    fontSize: '0.8125rem',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
    marginBottom: '0.2rem',
    borderLeft: isActive ? '3px solid #4268E8' : '3px solid transparent',
    boxShadow: isActive ? '0 1px 6px rgba(66, 104, 232, 0.25)' : 'none',
    position: 'relative' as const,
  });

  const sectionHeadingStyle: React.CSSProperties = {
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#64748B',
    fontWeight: 800,
    padding: '0.9rem 0.85rem 0.35rem',
    display: collapsed ? 'none' : 'block',
  };

  const navContent = (
    <>
      {/* Sidebar Header & Collapse Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: '0.35rem 0.4rem 0.75rem',
          marginBottom: '0.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '6px',
                backgroundColor: '#4268E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Compass size={14} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.05em', color: '#FFFFFF' }}>
              ACRM PLATFORM
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="acr-sidebar-mobile-close"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                cursor: 'pointer',
                color: '#94A3B8',
                padding: '0.35rem',
                borderRadius: '6px',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close menu"
            >
              <X size={15} />
            </button>
          )}

          {/* Desktop Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="acr-sidebar-collapse-btn"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              color: '#94A3B8',
              padding: '0.35rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>
      </div>

      {/* Nav List */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {/* Core Navigation */}
        <div style={sectionHeadingStyle}>Overview</div>
        <NavLink to={dashboardRoute} style={linkStyle} title={collapsed ? 'Dashboard' : undefined} onClick={onCloseMobile}>
          <LayoutDashboard size={17} style={{ flexShrink: 0, color: '#22D3EE' }} />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink to="/projects" style={linkStyle} title={collapsed ? 'Projects' : undefined} onClick={onCloseMobile}>
          <FolderGit2 size={17} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Projects</span>}
        </NavLink>

        <NavLink to="/projects/ideas" style={linkStyle} title={collapsed ? 'Ideation & Hackathons' : undefined} onClick={onCloseMobile}>
          <Trophy size={17} style={{ flexShrink: 0, color: '#FBBF24' }} />
          {!collapsed && <span>Ideation & Challenges</span>}
        </NavLink>

        {/* Knowledge & Research */}
        <div style={sectionHeadingStyle}>Knowledge & Literature</div>
        <NavLink to="/research/topics" style={linkStyle} title={collapsed ? 'Research Topics' : undefined} onClick={onCloseMobile}>
          <BookOpen size={17} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Research Topics</span>}
        </NavLink>

        <NavLink to="/research/papers" style={linkStyle} title={collapsed ? 'Papers Catalog' : undefined} onClick={onCloseMobile}>
          <FileText size={17} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Papers Catalog</span>}
        </NavLink>

        <NavLink to="/research/saved" style={linkStyle} title={collapsed ? 'Saved Research' : undefined} onClick={onCloseMobile}>
          <Bookmark size={17} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Saved Research</span>}
        </NavLink>

        {/* Innovation & IPR */}
        <div style={sectionHeadingStyle}>Innovation & IPR</div>
        <NavLink to="/ipr/novelty" style={linkStyle} title={collapsed ? 'AI Novelty Screening' : undefined} onClick={onCloseMobile}>
          <Sparkles size={17} style={{ flexShrink: 0, color: '#C084FC' }} />
          {!collapsed && <span>AI Novelty Screening</span>}
        </NavLink>

        <NavLink to="/ipr/dashboard" style={linkStyle} title={collapsed ? 'IPR Office' : undefined} onClick={onCloseMobile}>
          <ShieldCheck size={17} style={{ flexShrink: 0, color: '#22D3EE' }} />
          {!collapsed && <span>IPR Disclosures</span>}
        </NavLink>

        <NavLink to="/ipr/documents" style={linkStyle} title={collapsed ? 'IPR Documents' : undefined} onClick={onCloseMobile}>
          <FileCheck2 size={17} style={{ flexShrink: 0 }} />
          {!collapsed && <span>IPR Documents</span>}
        </NavLink>

        {/* Faculty Specific Mentorship Section */}
        {user.role === 'FACULTY' && (
          <>
            <div style={sectionHeadingStyle}>Mentorship & Review</div>
            <NavLink to="/projects?filter=guided" style={linkStyle} title={collapsed ? 'Guided Projects' : undefined} onClick={onCloseMobile}>
              <GraduationCap size={17} style={{ flexShrink: 0, color: '#34D399' }} />
              {!collapsed && <span>Guided Projects</span>}
            </NavLink>
            <NavLink to="/faculty" style={linkStyle} title={collapsed ? 'Faculty Directory' : undefined} onClick={onCloseMobile}>
              <Users size={17} style={{ flexShrink: 0 }} />
              {!collapsed && <span>Faculty Directory</span>}
            </NavLink>
            <NavLink to="/ipr/reviews" style={linkStyle} title={collapsed ? 'IPR Committee Reviews' : undefined} onClick={onCloseMobile}>
              <ShieldCheck size={17} style={{ flexShrink: 0, color: '#FBBF24' }} />
              {!collapsed && <span>IPR Reviews</span>}
            </NavLink>
          </>
        )}

        {/* Admin Specific Governance Section */}
        {user.role === 'ADMIN' && (
          <>
            <div style={sectionHeadingStyle}>Institutional Governance</div>
            <NavLink to="/admin/users" style={linkStyle} title={collapsed ? 'User Governance' : undefined} onClick={onCloseMobile}>
              <Users size={17} style={{ flexShrink: 0, color: '#60A5FA' }} />
              {!collapsed && <span>User Directory</span>}
            </NavLink>
            <NavLink to="/admin/taxonomy" style={linkStyle} title={collapsed ? 'Research Taxonomy' : undefined} onClick={onCloseMobile}>
              <Layers size={17} style={{ flexShrink: 0 }} />
              {!collapsed && <span>Taxonomy & Domains</span>}
            </NavLink>
            <NavLink to="/admin/audit-logs" style={linkStyle} title={collapsed ? 'Security Audit Logs' : undefined} onClick={onCloseMobile}>
              <History size={17} style={{ flexShrink: 0, color: '#F87171' }} />
              {!collapsed && <span>Audit & Security Logs</span>}
            </NavLink>
          </>
        )}
      </div>

      {/* Footer Area: Support, Settings & User Chip */}
      <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <NavLink to="/support" style={linkStyle} title={collapsed ? 'Support Desk' : undefined} onClick={onCloseMobile}>
          <LifeBuoy size={17} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Support Desk</span>}
        </NavLink>

        <NavLink to="/settings" style={linkStyle} title={collapsed ? 'Settings' : undefined} onClick={onCloseMobile}>
          <Settings size={17} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        {/* Compact User Profile Chip */}
        <div
          style={{
            marginTop: '0.65rem',
            padding: '0.65rem 0.75rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(11, 31, 58, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2457D6 0%, #3B82F6 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.78rem',
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.fullName}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                <span>{user.role}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="acr-sidebar-overlay"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        style={{
          width: collapsed ? '72px' : '260px',
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          backgroundColor: '#101B35',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          height: 'calc(100vh - 64px)',
          position: 'sticky',
          top: '64px',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '0.85rem 0.65rem',
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none',
          zIndex: 40,
          color: '#FFFFFF',
        }}
        className={`acr-sidebar ${isMobileOpen ? 'acr-sidebar-mobile-open' : ''}`}
      >
        {navContent}
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          .acr-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            height: 100vh !important;
            z-index: 55 !important;
            transform: translateX(-100%);
            box-shadow: var(--shadow-xl);
          }
          .acr-sidebar.acr-sidebar-mobile-open {
            transform: translateX(0) !important;
          }
          .acr-sidebar-mobile-close {
            display: flex !important;
          }
          .acr-sidebar-collapse-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};
