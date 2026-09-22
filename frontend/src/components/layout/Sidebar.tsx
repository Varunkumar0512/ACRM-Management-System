import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
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
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Users,
  Layers,
  History,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  if (!user) return null;

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: collapsed ? '0.7rem 0' : '0.65rem 0.95rem',
    justifyContent: collapsed ? 'center' : 'flex-start',
    borderRadius: '8px',
    color: isActive ? '#FFFFFF' : '#94A3B8',
    background: isActive
      ? 'linear-gradient(90deg, rgba(36, 87, 214, 0.32) 0%, rgba(36, 87, 214, 0.08) 100%)'
      : 'transparent',
    fontWeight: isActive ? 700 : 500,
    fontSize: '0.8125rem',
    textDecoration: 'none',
    transition: 'all var(--transition-fast)',
    marginBottom: '0.25rem',
    borderLeft: isActive ? '3px solid var(--color-cyan-accent)' : '3px solid transparent',
    boxShadow: isActive ? '0 0 15px rgba(36, 87, 214, 0.25)' : 'none',
  });

  const sectionHeadingStyle: React.CSSProperties = {
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#64748B',
    fontWeight: 800,
    padding: '1rem 0.95rem 0.35rem',
    display: collapsed ? 'none' : 'block',
  };

  return (
    <aside
      style={{
        width: collapsed ? '72px' : '250px',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        backgroundColor: '#071426',
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
    >
      {/* Top Header & Collapse Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: '0.35rem 0.5rem 0.75rem',
          marginBottom: '0.65rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/logo.svg" alt="ACRM Logo" style={{ width: 22, height: 22, borderRadius: '4px' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', color: '#FFFFFF' }}>
              ACRM OS
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            color: '#94A3B8',
            padding: '0.3rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Nav List */}
      <div style={{ flex: 1 }}>
        {/* 1. Dashboard */}
        <NavLink
          to={user.role === 'FACULTY' ? '/faculty/dashboard' : user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}
          style={linkStyle}
          title={collapsed ? 'Dashboard' : undefined}
        >
          <LayoutDashboard size={17} style={{ flexShrink: 0, color: 'var(--color-cyan-accent)' }} />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        {/* 2. Profile */}
        <NavLink
          to="/settings"
          style={linkStyle}
          title={collapsed ? 'Profile' : undefined}
        >
          <User size={17} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Profile</span>}
        </NavLink>

        {/* 3. Projects */}
        <NavLink
          to="/projects"
          style={linkStyle}
          title={collapsed ? 'Projects' : undefined}
        >
          <FolderGit2 size={17} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Projects</span>}
        </NavLink>

        {/* 4. Hackathons */}
        <NavLink
          to="/projects/ideas"
          style={linkStyle}
          title={collapsed ? 'Hackathons & Ideas' : undefined}
        >
          <Trophy size={17} style={{ flexShrink: 0, color: '#FBBF24' }} />
          {!collapsed && <span>Hackathons</span>}
        </NavLink>

        {/* 5. Research */}
        <div style={sectionHeadingStyle}>Knowledge Base</div>
        <NavLink
          to="/research/topics"
          style={linkStyle}
          title={collapsed ? 'Research' : undefined}
        >
          <BookOpen size={17} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Research</span>}
        </NavLink>

        {/* 6. Documents */}
        <NavLink
          to="/ipr/documents"
          style={linkStyle}
          title={collapsed ? 'Documents' : undefined}
        >
          <FileText size={17} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Documents</span>}
        </NavLink>

        {/* 7. AI Assessment */}
        <div style={sectionHeadingStyle}>Innovation & IPR</div>
        <NavLink
          to="/ipr/novelty"
          style={linkStyle}
          title={collapsed ? 'AI Assessment' : undefined}
        >
          <Sparkles size={17} style={{ flexShrink: 0, color: '#C084FC' }} />
          {!collapsed && <span>AI Assessment</span>}
        </NavLink>

        {/* 8. IPR */}
        <NavLink
          to="/ipr/dashboard"
          style={linkStyle}
          title={collapsed ? 'IPR' : undefined}
        >
          <ShieldCheck size={17} style={{ flexShrink: 0, color: 'var(--color-cyan-accent)' }} />
          {!collapsed && <span>IPR</span>}
        </NavLink>

        {/* Admin Specific Links */}
        {user.role === 'ADMIN' && (
          <>
            <div style={sectionHeadingStyle}>Administration</div>
            <NavLink to="/admin/users" style={linkStyle} title={collapsed ? 'Users' : undefined}>
              <Users size={17} style={{ flexShrink: 0 }} />
              {!collapsed && <span>Users</span>}
            </NavLink>
            <NavLink to="/admin/taxonomy" style={linkStyle} title={collapsed ? 'Taxonomy' : undefined}>
              <Layers size={17} style={{ flexShrink: 0 }} />
              {!collapsed && <span>Taxonomy</span>}
            </NavLink>
            <NavLink to="/admin/audit-logs" style={linkStyle} title={collapsed ? 'Audit Logs' : undefined}>
              <History size={17} style={{ flexShrink: 0 }} />
              {!collapsed && <span>Audit Logs</span>}
            </NavLink>
          </>
        )}

        {/* Faculty Specific Links */}
        {user.role === 'FACULTY' && (
          <>
            <div style={sectionHeadingStyle}>Mentorship</div>
            <NavLink to="/projects?filter=guided" style={linkStyle} title={collapsed ? 'Guided Projects' : undefined}>
              <GraduationCap size={17} style={{ flexShrink: 0 }} />
              {!collapsed && <span>Guided Projects</span>}
            </NavLink>
          </>
        )}
      </div>

      {/* Footer Area */}
      <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        {/* 9. Support */}
        <NavLink to="/support" style={linkStyle} title={collapsed ? 'Support Desk' : undefined}>
          <Bell size={17} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Support</span>}
        </NavLink>

        {/* 10. Settings */}
        <NavLink to="/settings" style={linkStyle} title={collapsed ? 'Settings' : undefined}>
          <Settings size={17} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        {/* Compact User Profile Chip */}
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.65rem 0.75rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(11, 31, 58, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2457D6 0%, #3B82F6 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.fullName}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>
                {user.role}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
