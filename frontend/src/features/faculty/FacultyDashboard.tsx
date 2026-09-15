import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { facultyApi } from '../../services/api/otherApis';
import { projectApi } from '../../services/api/projectApi';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';
import {
  GraduationCap,
  FolderGit2,
  Users,
  Check,
  X,
  ArrowRight,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const toast = useToast();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = () => {
    setIsLoading(true);
    facultyApi
      .getDashboard()
      .then(setDashboardData)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRespondToRequest = async (projectId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await projectApi.respondToGuideRequest(projectId, status);
      toast.success(`Guidance request ${status === 'ACCEPTED' ? 'accepted' : 'declined'}.`);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to update request.');
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Loading faculty mentorship dashboard...
      </div>
    );
  }

  const { stats, pendingRequests = [], activeProjects = [] } = dashboardData || {};

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Portal', path: '/' },
          { label: 'Faculty Mentorship Dashboard' },
        ]}
      />

      {/* Welcome Banner */}
      <div
        style={{
          padding: '1.75rem 2rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {user?.fullName}
            </h1>
            <span className="acr-badge acr-badge-info">
              {profile?.designation || 'Associate Professor'}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Department of {profile?.department || 'Engineering'} • {profile?.experienceYears || 12} Years Experience • Cabin: {profile?.cabinLocation || 'Main Block'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/projects?filter=guided" className="acr-btn acr-btn-primary">
            <FolderGit2 size={16} />
            <span>Assigned Projects Workspace</span>
          </Link>
        </div>
      </div>

      {/* Purposeful Mentorship Capacity Metrics */}
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
              Active Guided Projects
            </span>
            <FolderGit2 size={18} color="var(--primary-600)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            {stats?.activeGuidedProjects || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Current institutional mentorship load
          </div>
        </div>

        <div className="acr-card acr-card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Available Slots
            </span>
            <GraduationCap size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            {stats?.availableSlots || 0} / {stats?.capacityLimit || 5}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Capacity per departmental regulations
          </div>
        </div>

        <div className="acr-card acr-card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Pending Guidance Requests
            </span>
            <AlertCircle size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            {stats?.pendingRequestsCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Student teams awaiting your response
          </div>
        </div>
      </div>

      {/* Pending Guidance Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="acr-card" style={{ marginBottom: '2rem', borderLeft: '4px solid #d97706' }}>
          <div className="acr-card-header">
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Pending Student Guidance Requests</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Review project problem statements and accept or decline mentorship requests
              </p>
            </div>
          </div>

          <div className="acr-card-body" style={{ padding: 0 }}>
            {pendingRequests.map((req: any) => {
              const proj = req.projectId;
              if (!proj) return null;
              return (
                <div
                  key={req._id}
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                        {proj.code}
                      </span>
                      <span className="acr-badge acr-badge-warning">{req.role?.replace(/_/g, ' ')}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{proj.domainId?.name}</span>
                    </div>

                    <Link to={`/projects/${proj._id}`} style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {proj.title}
                    </Link>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {proj.problemStatement?.slice(0, 160)}...
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Proposed by: <strong>{proj.ownerId?.fullName}</strong> ({proj.ownerId?.email})
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleRespondToRequest(proj._id, 'ACCEPTED')}
                      icon={<Check size={14} />}
                    >
                      Accept Mentorship
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRespondToRequest(proj._id, 'REJECTED')}
                      icon={<X size={14} />}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Assigned Projects List */}
      <div className="acr-card">
        <div className="acr-card-header">
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Your Active Guided Projects</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Student research teams currently under your primary guidance or co-guidance
            </p>
          </div>
        </div>

        <div className="acr-card-body" style={{ padding: 0 }}>
          {activeProjects.length === 0 ? (
            <div style={{ padding: '2.5rem' }}>
              <EmptyState
                title="No active projects assigned yet"
                description="When student teams request your guidance and you accept, their workspace will be accessible here."
              />
            </div>
          ) : (
            activeProjects.map((item: any) => {
              const p = item.projectId;
              if (!p) return null;
              return (
                <div
                  key={item._id}
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        {p.code}
                      </span>
                      <span className="acr-badge acr-badge-info">{p.status}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.role?.replace(/_/g, ' ')}</span>
                    </div>

                    <Link to={`/projects/${p._id}`} style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {p.title}
                    </Link>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Student Lead: {p.ownerId?.fullName} • Progress: {p.progressPercentage}%
                    </div>
                  </div>

                  <Link to={`/projects/${p._id}`} className="acr-btn acr-btn-secondary acr-btn-sm">
                    <span>Evaluate & Review</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
