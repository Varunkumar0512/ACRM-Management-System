import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api/otherApis';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Badge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  FolderGit2,
  FileText,
  LifeBuoy,
  History,
  ArrowRight,
  BarChart2,
  ShieldCheck,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getAnalytics()
      .then(setAnalytics)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Loading institutional operations analytics...
      </div>
    );
  }

  const { metrics, projectsByStatus = {}, ticketsByStatus = {}, domainDistribution = [], recentAuditLogs = [] } =
    analytics || {};

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Portal', path: '/' },
          { label: 'System Administration' },
          { label: 'Operational Overview' },
        ]}
      />

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Institutional Operations & Governance
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Real-time metrics, user oversight, capstone compliance, and security audit logs
        </p>
      </div>

      {/* Real Platform Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="acr-card acr-card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Enrolled Students
            </span>
            <Users size={18} color="var(--primary-600)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {metrics?.totalStudents || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Active student scholars
          </div>
        </div>

        <div className="acr-card acr-card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Faculty Mentors
            </span>
            <GraduationCap size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {metrics?.totalFaculty || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Professors & Associate Professors
          </div>
        </div>

        <div className="acr-card acr-card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Total Projects
            </span>
            <FolderGit2 size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {metrics?.totalProjects || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Across all academic statuses
          </div>
        </div>

        <div className="acr-card acr-card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Published Papers
            </span>
            <FileText size={18} color="#7c3aed" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {metrics?.totalResearchPapers || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Preserved institutional literature
          </div>
        </div>
      </div>

      {/* Grid: Project Status Distribution & Research Domain Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Projects by Status */}
        <div className="acr-card">
          <div className="acr-card-header">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Project Status Lifecycle Distribution</h3>
          </div>
          <div className="acr-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.entries(projectsByStatus).map(([st, count]) => (
                <div key={st} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="acr-dot" style={{ backgroundColor: 'var(--primary-600)' }} />
                    <span>{st.replace(/_/g, ' ')}</span>
                  </div>
                  <strong>{count as number}</strong>
                </div>
              ))}
              {Object.keys(projectsByStatus).length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No projects registered yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Top Research Domains */}
        <div className="acr-card">
          <div className="acr-card-header">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Active Project Domain Breakdown</h3>
          </div>
          <div className="acr-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {domainDistribution.map((d: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span>{d.domainName}</span>
                  <span className="acr-badge acr-badge-info">{d.count} Projects</span>
                </div>
              ))}
              {domainDistribution.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Awaiting project domain registrations</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Security & Operational Audit Trail */}
      <div className="acr-card">
        <div className="acr-card-header">
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>System Security & Audit Activity Log</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Immutable record of logins, status transitions, and administrative operations
            </p>
          </div>
          <Link to="/admin/audit-logs" className="acr-btn acr-btn-ghost acr-btn-sm">
            Full Explorer <ArrowRight size={14} />
          </Link>
        </div>

        <div className="acr-table-container">
          <table className="acr-table">
            <thead>
              <tr>
                <th>Action Event</th>
                <th>Resource</th>
                <th>User / Operator</th>
                <th>IP Context</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentAuditLogs.slice(0, 6).map((log: any) => (
                <tr key={log._id}>
                  <td>
                    <span className="acr-badge acr-badge-neutral" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.resourceType}</td>
                  <td>{log.userId?.fullName || 'System Event'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{log.ipAddress || '127.0.0.1'}</td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
