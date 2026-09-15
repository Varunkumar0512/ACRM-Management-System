import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Sparkles,
  Bookmark,
  Lightbulb,
  PlusCircle,
  FolderGit2,
  Users,
  GraduationCap,
  LifeBuoy,
  Settings,
  ShieldCheck,
  History,
  Layers,
  Award,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { user } = useAuth();
  if (!user) return null;

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.55rem 0.85rem',
    borderRadius: 'var(--radius-md)',
    color: isActive ? 'var(--primary-600)' : 'var(--text-secondary)',
    background: isActive ? 'var(--primary-50)' : 'transparent',
    fontWeight: isActive ? 600 : 500,
    fontSize: '0.8125rem',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
    marginBottom: '0.2rem',
  });

  const sectionHeadingStyle: React.CSSProperties = {
    fontSize: '0.6875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
    fontWeight: 700,
    padding: '0.75rem 0.85rem 0.35rem',
  };

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        height: 'calc(100vh - 64px)',
        position: 'sticky',
        top: '64px',
        overflowY: 'auto',
        padding: '1rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Role specific links */}
      {user.role === 'STUDENT' && (
        <>
          <NavLink to="/dashboard" style={linkStyle}>
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </NavLink>

          <div style={sectionHeadingStyle}>Research Discovery</div>
          <NavLink to="/research/topics" style={linkStyle}>
            <BookOpen size={16} />
            <span>Research Topics</span>
          </NavLink>
          <NavLink to="/research/papers" style={linkStyle}>
            <FileText size={16} />
            <span>Research Papers</span>
          </NavLink>
          <NavLink to="/research/recommendations" style={linkStyle}>
            <Sparkles size={16} />
            <span>Recommendations</span>
          </NavLink>
          <NavLink to="/research/saved" style={linkStyle}>
            <Bookmark size={16} />
            <span>Saved Research</span>
          </NavLink>

          <div style={sectionHeadingStyle}>Projects & Teams</div>
          <NavLink to="/projects/ideas" style={linkStyle}>
            <Lightbulb size={16} />
            <span>Project Ideas</span>
          </NavLink>
          <NavLink to="/projects/create" style={linkStyle}>
            <PlusCircle size={16} />
            <span>Create Project</span>
          </NavLink>
          <NavLink to="/projects?filter=my" style={linkStyle}>
            <FolderGit2 size={16} />
            <span>My Projects</span>
          </NavLink>
          <NavLink to="/projects?filter=team" style={linkStyle}>
            <Users size={16} />
            <span>Team Projects</span>
          </NavLink>

          <div style={sectionHeadingStyle}>Faculty Mentors</div>
          <NavLink to="/faculty" style={linkStyle}>
            <GraduationCap size={16} />
            <span>Faculty Guides</span>
          </NavLink>
        </>
      )}

      {user.role === 'FACULTY' && (
        <>
          <NavLink to="/faculty/dashboard" style={linkStyle}>
            <LayoutDashboard size={16} />
            <span>Faculty Dashboard</span>
          </NavLink>

          <div style={sectionHeadingStyle}>Mentorship & Reviews</div>
          <NavLink to="/projects?filter=guided" style={linkStyle}>
            <FolderGit2 size={16} />
            <span>Assigned Projects</span>
          </NavLink>
          <NavLink to="/faculty" style={linkStyle}>
            <GraduationCap size={16} />
            <span>Faculty Directory</span>
          </NavLink>

          <div style={sectionHeadingStyle}>Research Catalog</div>
          <NavLink to="/research/topics" style={linkStyle}>
            <BookOpen size={16} />
            <span>Topics</span>
          </NavLink>
          <NavLink to="/research/papers" style={linkStyle}>
            <FileText size={16} />
            <span>Research Papers</span>
          </NavLink>
          <NavLink to="/projects/ideas" style={linkStyle}>
            <Lightbulb size={16} />
            <span>Project Ideas</span>
          </NavLink>
        </>
      )}

      {user.role === 'ADMIN' && (
        <>
          <NavLink to="/admin/dashboard" style={linkStyle}>
            <LayoutDashboard size={16} />
            <span>Admin Overview</span>
          </NavLink>

          <div style={sectionHeadingStyle}>Institutional Ops</div>
          <NavLink to="/admin/users" style={linkStyle}>
            <Users size={16} />
            <span>User Management</span>
          </NavLink>
          <NavLink to="/projects" style={linkStyle}>
            <FolderGit2 size={16} />
            <span>All Projects</span>
          </NavLink>
          <NavLink to="/admin/taxonomy" style={linkStyle}>
            <Layers size={16} />
            <span>Research Taxonomy</span>
          </NavLink>
          <NavLink to="/admin/audit-logs" style={linkStyle}>
            <History size={16} />
            <span>Audit Logs</span>
          </NavLink>

          <div style={sectionHeadingStyle}>Directory</div>
          <NavLink to="/faculty" style={linkStyle}>
            <GraduationCap size={16} />
            <span>Faculty Directory</span>
          </NavLink>
          <NavLink to="/research/papers" style={linkStyle}>
            <FileText size={16} />
            <span>Research Papers</span>
          </NavLink>
        </>
      )}

      {/* Common IPR & Innovation Tree */}
      <div style={sectionHeadingStyle}>IPR & Innovation</div>
      <NavLink to="/ipr/dashboard" style={linkStyle}>
        <ShieldCheck size={16} />
        <span>IPR Dashboard</span>
      </NavLink>
      <NavLink to="/ipr/submit" style={linkStyle}>
        <PlusCircle size={16} />
        <span>Submit IPR</span>
      </NavLink>
      <NavLink to="/ipr/my" style={linkStyle}>
        <FileText size={16} />
        <span>My IPR</span>
      </NavLink>
      <NavLink to="/ipr/reviews" style={linkStyle}>
        <Sparkles size={16} />
        <span>IPR Reviews</span>
      </NavLink>
      <NavLink to="/ipr/category/patent" style={linkStyle}>
        <Award size={16} />
        <span>Patent</span>
      </NavLink>
      <NavLink to="/ipr/category/copyright" style={linkStyle}>
        <Bookmark size={16} />
        <span>Copyright</span>
      </NavLink>
      <NavLink to="/ipr/category/trademark" style={linkStyle}>
        <Layers size={16} />
        <span>Trademark</span>
      </NavLink>
      <NavLink to="/ipr/category/invention" style={linkStyle}>
        <Lightbulb size={16} />
        <span>Invention</span>
      </NavLink>
      <NavLink to="/ipr/documents" style={linkStyle}>
        <FolderGit2 size={16} />
        <span>IPR Documents</span>
      </NavLink>
      <NavLink to="/ipr/activity" style={linkStyle}>
        <History size={16} />
        <span>IPR Activity</span>
      </NavLink>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
        <NavLink to="/support" style={linkStyle}>
          <LifeBuoy size={16} />
          <span>Support Center</span>
        </NavLink>
        <NavLink to="/settings" style={linkStyle}>
          <Settings size={16} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};
