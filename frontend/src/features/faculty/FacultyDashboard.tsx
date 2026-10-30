import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { facultyApi } from '../../services/api/otherApis';
import { projectApi } from '../../services/api/projectApi';
import { iprApi } from '../../services/api/iprApi';
import { useToast } from '../../hooks/useToast';
import {
  GraduationCap,
  FolderGit2,
  Users,
  Check,
  X,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Layers,
  FileCheck2,
  CheckCircle2,
} from 'lucide-react';
import {
  PageHeader,
  StatCard,
  DashboardSection,
  CapacityBar,
  DeadlineList,
  DeadlineItem,
  DashboardSkeleton,
  ErrorState,
} from '../../components/dashboard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';

export const FacultyDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const toast = useToast();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [iprReviews, setIprReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setHasError(false);
      const [facData, iprData] = await Promise.all([
        facultyApi.getDashboard().catch(() => null),
        iprApi.getDisclosures({ status: 'INITIAL_REVIEW', limit: 4 }).catch(() => ({ disclosures: [] })),
      ]);

      if (!facData) {
        setHasError(true);
      } else {
        setDashboardData(facData);
      }
      setIprReviews(iprData?.disclosures || []);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRespondToRequest = async (projectId: string, status: 'ACCEPTED' | 'REJECTED') => {
    setProcessingRequestId(projectId);
    try {
      await projectApi.respondToGuideRequest(projectId, status);
      toast.success(`Mentorship request successfully ${status === 'ACCEPTED' ? 'accepted' : 'declined'}.`);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to update mentorship request.');
    } finally {
      setProcessingRequestId(null);
    }
  };

  if (isLoading) {
    return <DashboardSkeleton kpiCount={4} />;
  }

  if (hasError || !dashboardData) {
    return (
      <ErrorState
        title="Faculty Mentorship Workspace Unavailable"
        message="Could not load your assigned projects and pending mentorship requests. Please verify your connection."
        onRetry={() => {
          setIsRetrying(true);
          loadData();
        }}
        isRetrying={isRetrying}
      />
    );
  }

  const { stats, pendingRequests = [], activeProjects = [] } = dashboardData;

  // Upcoming review checkpoints computed from active guided projects
  const upcomingReviews: DeadlineItem[] = activeProjects
    .filter((item: any) => item.projectId?.expectedCompletionDate)
    .map((item: any) => ({
      id: item.projectId._id,
      title: `Sprint Evaluation: ${item.projectId.title}`,
      dueDate: item.projectId.expectedCompletionDate,
      projectCode: item.projectId.code,
      projectId: item.projectId._id,
      category: item.role?.replace(/_/g, ' ') || 'Primary Guide',
    }))
    .slice(0, 4);

  return (
    <div>
      {/* 1. Header Banner */}
      <PageHeader
        title={`Faculty Mentorship & Supervision — ${user?.fullName}`}
        subtitle={`Department of ${profile?.department || 'Engineering'} • ${profile?.designation || 'Faculty Mentor'} • Cabin: ${profile?.cabinLocation || 'Academic Complex'}`}
        badge={
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#059669',
              letterSpacing: '0.04em',
            }}
          >
            {profile?.designation || 'Research Faculty'}
          </span>
        }
        actions={
          <>
            <Link to="/projects?filter=guided" className="acr-btn acr-btn-primary">
              <FolderGit2 size={15} />
              <span>Supervised Projects ({activeProjects.length})</span>
            </Link>
            <Link to="/ipr/reviews" className="acr-btn acr-btn-secondary">
              <ShieldCheck size={15} color="#4169E1" />
              <span>IPR Reviews</span>
            </Link>
          </>
        }
      />

      {/* 2. Faculty KPI Stats */}
      <div className="acr-kpi-grid">
        <StatCard
          title="ACTIVE GUIDED PROJECTS"
          value={stats?.activeGuidedProjects || activeProjects.length}
          subtitle="Teams under active mentorship"
          icon={<FolderGit2 size={18} />}
          accent="blue"
          linkTo="/projects?filter=guided"
        />
        <StatCard
          title="PENDING REQUESTS"
          value={stats?.pendingRequestsCount || pendingRequests.length}
          subtitle="Proposals awaiting response"
          icon={<AlertCircle size={18} />}
          accent={pendingRequests.length > 0 ? 'amber' : 'emerald'}
          badge={pendingRequests.length > 0 ? 'Action Needed' : undefined}
        />
        <StatCard
          title="AVAILABLE SLOTS"
          value={`${stats?.availableSlots ?? 0} / ${stats?.capacityLimit ?? 5}`}
          subtitle="Institutional policy quota"
          icon={<GraduationCap size={18} />}
          accent="emerald"
        />
        <StatCard
          title="IPR REVIEWS"
          value={iprReviews.length < 10 ? `0${iprReviews.length}` : iprReviews.length}
          subtitle="Disclosures under committee review"
          icon={<ShieldCheck size={18} />}
          accent="purple"
          linkTo="/ipr/reviews"
        />
      </div>

      {/* 3. Mentorship Capacity Visual Card */}
      <div
        className="acr-card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <CapacityBar
          current={stats?.activeGuidedProjects || activeProjects.length}
          max={stats?.capacityLimit || 5}
          label="Institutional Mentorship Quota Utilization"
        />
      </div>

      {/* 4. Main Two-Column Grid */}
      <div className="acr-dashboard-split">
        {/* Left Column: Pending Guidance Requests & Guided Projects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Pending Guidance Requests Section */}
          {pendingRequests.length > 0 && (
            <DashboardSection
              title="Pending Student Mentorship Requests"
              subtitle="Review capstone problem statements and decide to accept or decline supervision"
              icon={<AlertCircle size={18} color="#D97706" />}
              noPadding
            >
              {pendingRequests.map((req: any) => {
                const proj = req.projectId;
                if (!proj) return null;
                const isProcessing = processingRequestId === proj._id;

                return (
                  <div
                    key={req._id}
                    style={{
                      padding: '1.25rem 1.5rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1.25rem',
                      backgroundColor: 'rgba(245, 158, 11, 0.03)',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                          {proj.code}
                        </span>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: 'rgba(245, 158, 11, 0.12)',
                            color: '#D97706',
                          }}
                        >
                          {req.role?.replace(/_/g, ' ') || 'PRIMARY GUIDE'}
                        </span>
                        {proj.domainId?.name && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            • {proj.domainId.name}
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/projects/${proj._id}`}
                        style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}
                      >
                        {proj.title}
                      </Link>

                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.45 }}>
                        {proj.problemStatement?.slice(0, 180)}...
                      </p>

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                        Proposed by:{' '}
                        <strong style={{ color: 'var(--text-secondary)' }}>
                          {proj.ownerId?.fullName}
                        </strong>{' '}
                        ({proj.ownerId?.studentId ? `${proj.ownerId.studentId} • ` : ''}{proj.ownerId?.email})
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleRespondToRequest(proj._id, 'ACCEPTED')}
                        disabled={isProcessing}
                        isLoading={isProcessing}
                        icon={<Check size={14} />}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRespondToRequest(proj._id, 'REJECTED')}
                        disabled={isProcessing}
                        icon={<X size={14} />}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                );
              })}
            </DashboardSection>
          )}

          {/* Active Guided Projects */}
          <DashboardSection
            title="Active Guided Student Projects"
            subtitle="Student research teams currently supervised under your mentorship"
            icon={<FolderGit2 size={18} />}
            noPadding
            action={
              <Link to="/projects?filter=guided" className="acr-btn acr-btn-ghost acr-btn-sm">
                <span>All Guided ({activeProjects.length})</span>
                <ArrowRight size={13} />
              </Link>
            }
          >
            {activeProjects.length === 0 ? (
              <div style={{ padding: '2.5rem' }}>
                <EmptyState
                  title="No active guided projects assigned"
                  description="When student teams propose research and you accept their mentorship request, their workspace will be accessible here."
                />
              </div>
            ) : (
              activeProjects.map((item: any) => {
                const p = item.projectId;
                if (!p) return null;
                const progress = p.progressPercentage || 0;

                return (
                  <div key={item._id} className="acr-list-item-interactive">
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          {p.code}
                        </span>
                        <Badge variant={p.status === 'APPROVED' || p.status === 'COMPLETED' ? 'success' : 'info'}>
                          {p.status.replace(/_/g, ' ')}
                        </Badge>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {item.role?.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <Link
                        to={`/projects/${p._id}`}
                        style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}
                      >
                        {p.title}
                      </Link>

                      {/* Progress bar */}
                      <div style={{ marginTop: '0.5rem', maxWidth: '340px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                          <span>Milestone Velocity</span>
                          <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{progress}%</span>
                        </div>
                        <div className="acr-progress-bar-track">
                          <div
                            className="acr-progress-bar-fill"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: progress >= 100 ? '#10B981' : '#4169E1',
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
                        Student Lead: <strong style={{ color: 'var(--text-secondary)' }}>{p.ownerId?.fullName}</strong> ({p.ownerId?.studentId ? `${p.ownerId.studentId} • ` : ''}{p.ownerId?.email})
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Link to={`/projects/${p._id}`} className="acr-btn acr-btn-secondary acr-btn-sm">
                        <span>Evaluate & Review</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </DashboardSection>
        </div>

        {/* Right Column: Deadlines, IPR Reviews, Directory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Upcoming Review Deadlines */}
          <DashboardSection
            title="Review Checkpoints"
            subtitle="Scheduled project evaluations and defense milestones"
            icon={<Clock size={16} />}
          >
            <DeadlineList
              items={upcomingReviews}
              emptyMessage="No immediate review checkpoints pending for your guided projects."
            />
          </DashboardSection>

          {/* IPR Committee Disclosures Awaiting Faculty Input */}
          <DashboardSection
            title="IPR Committee Reviews"
            subtitle="Campus invention disclosures assigned for committee review"
            icon={<ShieldCheck size={16} />}
            action={
              <Link to="/ipr/reviews" style={{ fontSize: '0.75rem', color: 'var(--color-royal-blue)', fontWeight: 700 }}>
                View All
              </Link>
            }
          >
            {iprReviews.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '1rem 0', textAlign: 'center' }}>
                No invention disclosures currently assigned for your review.
              </div>
            ) : (
              iprReviews.slice(0, 3).map((d: any) => (
                <div
                  key={d._id}
                  style={{
                    padding: '0.75rem 0',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      {d.iprNumber}
                    </span>
                    <Badge variant="warning">{d.category}</Badge>
                  </div>
                  <Link
                    to={`/ipr/disclosures/${d._id}`}
                    style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none', display: 'block', lineHeight: 1.4 }}
                  >
                    {d.title}
                  </Link>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Inventor: {d.primaryInventorId?.fullName || 'Campus Scholar'}
                  </div>
                </div>
              ))
            )}
          </DashboardSection>

          {/* Institutional Faculty Directory Link Card */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Faculty Mentorship Directory
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Browse peer faculty profiles and collaborative domains
              </div>
            </div>
            <Link to="/faculty" className="acr-btn acr-btn-secondary acr-btn-sm">
              Explore
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
