import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../services/api/otherApis';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  FolderGit2,
  FileText,
  LifeBuoy,
  History,
  ArrowRight,
  ShieldAlert,
  Layers,
  Settings,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import {
  PageHeader,
  StatCard,
  DashboardSection,
  DonutChart,
  DonutSegment,
  HorizontalBarChart,
  BarItem,
  QuickActionCard,
  DashboardSkeleton,
  ErrorState,
} from '../../components/dashboard';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      setHasError(false);
      const data = await adminApi.getAnalytics();
      setAnalytics(data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleRetry = () => {
    setIsRetrying(true);
    fetchAnalytics();
  };

  if (isLoading) {
    return <DashboardSkeleton kpiCount={4} />;
  }

  if (hasError || !analytics) {
    return (
      <ErrorState
        title="Institutional Analytics Service Unavailable"
        message="Unable to retrieve real-time governance metrics and system audit records. Please retry."
        onRetry={handleRetry}
        isRetrying={isRetrying}
      />
    );
  }

  const {
    metrics,
    projectsByStatus = {},
    ticketsByStatus = {},
    domainDistribution = [],
    recentAuditLogs = [],
  } = analytics;

  // Map projects by status to Donut Segments
  const statusColors: Record<string, string> = {
    DRAFT: '#94A3B8',
    SUBMITTED: '#38BDF8',
    UNDER_REVIEW: '#F59E0B',
    IN_PROGRESS: '#2457D6',
    FINAL_REVIEW: '#8B5CF6',
    COMPLETED: '#10B981',
    REJECTED: '#EF4444',
    CHANGES_REQUESTED: '#F97316',
    ARCHIVED: '#64748B',
  };

  const donutSegments: DonutSegment[] = Object.entries(projectsByStatus).map(([st, count]) => ({
    label: st.replace(/_/g, ' '),
    value: count as number,
    color: statusColors[st] || '#3B82F6',
  }));

  // Map domain distribution to BarItems
  const domainBars: BarItem[] = domainDistribution.map((d: any) => ({
    label: d.domainName,
    value: d.count,
    color: '#2457D6',
    badge: 'Projects',
  }));

  const totalOpenTickets =
    (ticketsByStatus.OPEN || 0) + (ticketsByStatus.IN_PROGRESS || 0);

  return (
    <div>
      {/* 1. Header Banner */}
      <PageHeader
        title="Institutional Governance & Operations"
        subtitle="Real-time campus research metrics, faculty workload, project lifecycle distribution, and security audit logs"
        badge={
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'rgba(36, 87, 214, 0.1)',
              color: 'var(--color-royal-blue)',
              letterSpacing: '0.04em',
            }}
          >
            Institutional Admin
          </span>
        }
        actions={
          <>
            <Link to="/admin/users" className="acr-btn acr-btn-primary">
              <Users size={15} />
              <span>User Directory</span>
            </Link>
            <Link to="/admin/taxonomy" className="acr-btn acr-btn-secondary">
              <Layers size={15} />
              <span>Research Taxonomy</span>
            </Link>
            <Link to="/admin/audit-logs" className="acr-btn acr-btn-ghost">
              <History size={15} />
              <span>Audit Explorer</span>
            </Link>
          </>
        }
      />

      {/* 2. Platform Real Metrics Grid */}
      <div className="acr-kpi-grid">
        <StatCard
          title="ENROLLED STUDENTS"
          value={metrics?.totalStudents || 0}
          subtitle="Registered student scholars"
          icon={<Users size={18} />}
          accent="blue"
          linkTo="/admin/users"
        />
        <StatCard
          title="FACULTY MENTORS"
          value={metrics?.totalFaculty || 0}
          subtitle="Professors & supervisors"
          icon={<GraduationCap size={18} />}
          accent="emerald"
          linkTo="/faculty"
        />
        <StatCard
          title="RESEARCH PROJECTS"
          value={metrics?.totalProjects || 0}
          subtitle="Across all lifecycle phases"
          icon={<FolderGit2 size={18} />}
          accent="amber"
          linkTo="/projects"
        />
        <StatCard
          title="PUBLISHED LITERATURE"
          value={metrics?.totalResearchPapers || 0}
          subtitle="Preserved repository papers"
          icon={<FileText size={18} />}
          accent="purple"
          linkTo="/research/papers"
        />
      </div>

      {/* 3. Visual Data Analytics Grid */}
      <div className="acr-grid-2col">
        {/* Project Lifecycle Distribution (Donut Chart) */}
        <DashboardSection
          title="Project Lifecycle Distribution"
          subtitle="Active project volume segmented by institutional status"
          icon={<FolderGit2 size={18} />}
        >
          {donutSegments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No projects registered yet across departments.
            </div>
          ) : (
            <DonutChart
              data={donutSegments}
              centerLabel="Total Projects"
              centerValue={metrics?.totalProjects || 0}
            />
          )}
        </DashboardSection>

        {/* Domain Distribution (Horizontal Bar Chart) */}
        <DashboardSection
          title="Research Domain Breakdown"
          subtitle="Distribution of student and faculty projects across academic fields"
          icon={<Layers size={18} />}
          action={
            <Link to="/admin/taxonomy" style={{ fontSize: '0.75rem', color: 'var(--color-royal-blue)', fontWeight: 700 }}>
              Manage Taxonomy
            </Link>
          }
        >
          {domainBars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No projects categorized in research domains yet.
            </div>
          ) : (
            <HorizontalBarChart items={domainBars.slice(0, 6)} />
          )}
        </DashboardSection>
      </div>

      {/* 4. Support Tickets Overview & Governance Shortcuts */}
      <div className="acr-grid-3col">
        <QuickActionCard
          title="User Governance & RBAC"
          description="Manage student, faculty, and administrative accounts, toggle activation, and update roles."
          to="/admin/users"
          icon={<Users size={20} />}
          accentColor="var(--color-royal-blue)"
          badge="Access Control"
        />
        <QuickActionCard
          title="Research Taxonomy Config"
          description="Configure institutional domains, trending topics, difficulty levels, and curricular themes."
          to="/admin/taxonomy"
          icon={<Layers size={20} />}
          accentColor="#059669"
          badge="Curriculum"
        />
        <QuickActionCard
          title="Campus Support Helpdesk"
          description={`Review and respond to technical tickets (${totalOpenTickets} active tickets currently unresolved).`}
          to="/support"
          icon={<LifeBuoy size={20} />}
          accentColor="#D97706"
          badge={totalOpenTickets > 0 ? `${totalOpenTickets} Pending` : 'Healthy'}
        />
      </div>

      {/* 5. Security & Operational Audit Log Table */}
      <DashboardSection
        title="Security & Institutional Audit Activity Log"
        subtitle="Cryptographically verified record of system events, authentication attempts, and state transitions"
        icon={<History size={18} />}
        action={
          <Link to="/admin/audit-logs" className="acr-btn acr-btn-ghost acr-btn-sm">
            <span>Full Audit Trail</span>
            <ArrowRight size={13} />
          </Link>
        }
        noPadding
      >
        <div className="acr-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="acr-table">
            <thead>
              <tr>
                <th>Event Action</th>
                <th>Resource Entity</th>
                <th>User / Operator</th>
                <th>IP Context</th>
                <th>Recorded Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentAuditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No audit log events recorded yet.
                  </td>
                </tr>
              ) : (
                recentAuditLogs.slice(0, 7).map((log: any) => (
                  <tr key={log._id}>
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor:
                            log.action?.includes('FAILED') || log.action?.includes('REJECTED')
                              ? 'rgba(239, 68, 68, 0.12)'
                              : log.action?.includes('LOGIN')
                              ? 'rgba(36, 87, 214, 0.1)'
                              : 'var(--bg-subtle)',
                          color:
                            log.action?.includes('FAILED') || log.action?.includes('REJECTED')
                              ? '#EF4444'
                              : log.action?.includes('LOGIN')
                              ? 'var(--color-royal-blue)'
                              : 'var(--text-secondary)',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{log.resourceType}</td>
                    <td>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {log.userId?.fullName || 'System Automated'}
                      </div>
                      {log.userId?.email && (
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          {log.userId.email}
                        </div>
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardSection>
    </div>
  );
};
