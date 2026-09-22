import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { projectApi } from '../../services/api/projectApi';
import { researchApi } from '../../services/api/researchApi';
import { iprApi } from '../../services/api/iprApi';
import { IProject } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  FolderGit2,
  BookOpen,
  Sparkles,
  Bookmark,
  PlusCircle,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [myProjects, setMyProjects] = useState<IProject[]>([]);
  const [recommendations, setRecommendations] = useState<{ recommendedPapers: any[]; recommendedIdeas: any[] }>({
    recommendedPapers: [],
    recommendedIdeas: [],
  });
  const [savedCount, setSavedCount] = useState<number>(0);
  const [iprCount, setIprCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      projectApi.listProjects({ filterType: 'my' }).catch(() => ({ projects: [] })),
      researchApi.getRecommendations().catch(() => ({ recommendedPapers: [], recommendedIdeas: [] })),
      researchApi.getSavedResearch().catch(() => []),
      iprApi.getDisclosures({ limit: 5 }).catch(() => ({ disclosures: [] })),
    ]).then(([projectsData, recsData, savedData, iprData]) => {
      setMyProjects(projectsData.projects || []);
      setRecommendations(recsData);
      setSavedCount(Array.isArray(savedData) ? savedData.length : 0);
      setIprCount(iprData?.disclosures?.length || 0);
      setIsLoading(false);
    });
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
      case 'UNDER_REVIEW':
        return 'info';
      case 'CHANGES_REQUESTED':
        return 'warning';
      case 'REJECTED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const activeProjectsCount = myProjects.filter((p) => p.status !== 'COMPLETED').length;
  const completedProjectsCount = myProjects.filter((p) => p.status === 'COMPLETED').length;

  return (
    <div>
      {/* Enterprise Welcome Banner */}
      <div
        style={{
          padding: '1.75rem 2rem',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0B1220', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
              Welcome back, {user?.fullName}
            </h1>
            <span className="acr-badge acr-badge-primary">
              {profile?.studentId || 'Student Scholar'}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Department of {profile?.department || 'Engineering'} • Year {profile?.yearOfStudy || 4} • Capstone Research Workspace
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/projects/create" className="acr-btn acr-btn-primary">
            <PlusCircle size={15} />
            <span>Create Research Project</span>
          </Link>
          <Link to="/ipr/novelty" className="acr-btn acr-btn-secondary">
            <Sparkles size={15} color="#7C3AED" />
            <span>AI Novelty Screening</span>
          </Link>
          <Link to="/research/papers" className="acr-btn acr-btn-secondary">
            <BookOpen size={15} />
            <span>Explore Literature</span>
          </Link>
        </div>
      </div>

      {/* Enterprise KPI Metrics Bar with Subtle Gradient Accents */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* KPI 1: Active Projects */}
        <div className="acr-kpi-card" style={{ borderTop: '3px solid #2457D6' }}>
          <div className="acr-kpi-header">
            <span className="acr-kpi-title">ACTIVE PROJECTS</span>
            <FolderGit2 size={16} color="var(--color-royal-blue)" />
          </div>
          <div className="acr-kpi-value">{activeProjectsCount}</div>
          <div className="acr-kpi-sub">
            {myProjects.filter((p) => p.status === 'IN_PROGRESS' || p.status === 'APPROVED').length} in active sprint milestone
          </div>
        </div>

        {/* KPI 2: Completed */}
        <div className="acr-kpi-card" style={{ borderTop: '3px solid #10B981' }}>
          <div className="acr-kpi-header">
            <span className="acr-kpi-title">COMPLETED</span>
            <CheckCircle2 size={16} color="#10B981" />
          </div>
          <div className="acr-kpi-value">{completedProjectsCount < 10 ? `0${completedProjectsCount}` : completedProjectsCount}</div>
          <div className="acr-kpi-sub">Faculty verified & archived deliverables</div>
        </div>

        {/* KPI 3: AI Assessments */}
        <div className="acr-kpi-card" style={{ borderTop: '3px solid #7C3AED' }}>
          <div className="acr-kpi-header">
            <span className="acr-kpi-title">AI ASSESSMENTS</span>
            <Sparkles size={16} color="#7C3AED" />
          </div>
          <div className="acr-kpi-value">
            {recommendations.recommendedPapers.length < 10 ? `0${recommendations.recommendedPapers.length}` : recommendations.recommendedPapers.length}
          </div>
          <div className="acr-kpi-sub">Preliminary novelty & citation screenings</div>
        </div>

        {/* KPI 4: IPR Requests */}
        <div className="acr-kpi-card" style={{ borderTop: '3px solid #22D3EE' }}>
          <div className="acr-kpi-header">
            <span className="acr-kpi-title">IPR REQUESTS</span>
            <ShieldCheck size={16} color="#0284C7" />
          </div>
          <div className="acr-kpi-value">{iprCount < 10 ? `0${iprCount}` : iprCount}</div>
          <div className="acr-kpi-sub">Institutional disclosures & filings</div>
        </div>
      </div>

      {/* Main Content Grid: Projects on Left, Recommendations & Ideas on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.85fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Active Projects Container */}
        <div className="acr-card">
          <div className="acr-card-header">
            <div>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0B1220' }}>Your Academic Projects</h2>
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Track deliverables, faculty guidance, and sprint milestones
              </p>
            </div>
            <Link to="/projects?filter=my" className="acr-btn acr-btn-ghost acr-btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="acr-card-body" style={{ padding: 0 }}>
            {myProjects.length === 0 ? (
              <div style={{ padding: '2.5rem' }}>
                <EmptyState
                  title="No research projects registered yet"
                  description="Begin by proposing your capstone research problem statement or browse curated topics."
                  actionLabel="Create First Project"
                  onAction={() => (window.location.href = '/projects/create')}
                />
              </div>
            ) : (
              myProjects.map((p) => (
                <div
                  key={p._id}
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                    transition: 'background var(--transition-fast)',
                  }}
                  className="acr-project-item"
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>
                        {p.code}
                      </span>
                      <Badge variant={getStatusBadgeVariant(p.status)}>
                        {p.status.replace(/_/g, ' ')}
                      </Badge>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {p.domainId?.name}
                      </span>
                    </div>

                    <Link
                      to={`/projects/${p._id}`}
                      style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0B1220', textDecoration: 'none' }}
                    >
                      {p.title}
                    </Link>

                    {/* Milestone Progress Bar */}
                    <div style={{ marginTop: '0.65rem', maxWidth: '360px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#64748B', marginBottom: '0.25rem' }}>
                        <span>Sprint Progress</span>
                        <span style={{ fontWeight: 700, color: '#0B1220' }}>{p.progressPercentage}%</span>
                      </div>
                      <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${p.progressPercentage}%`,
                            background: 'linear-gradient(90deg, #2457D6 0%, #3B82F6 100%)',
                            borderRadius: '9999px',
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <Link to={`/projects/${p._id}`} className="acr-btn acr-btn-secondary acr-btn-sm">
                    Enter Workspace
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar: Recommendations & Curated Ideas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Recommended Literature */}
          <div className="acr-card">
            <div className="acr-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} color="var(--color-royal-blue)" />
                <h3 style={{ fontSize: '0.875rem', fontWeight: 800 }}>Recommended Literature</h3>
              </div>
              <Link to="/research/recommendations" style={{ fontSize: '0.75rem', color: 'var(--color-royal-blue)', fontWeight: 700 }}>
                View All
              </Link>
            </div>
            <div className="acr-card-body" style={{ padding: '0.85rem 1.25rem' }}>
              {recommendations.recommendedPapers.length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: '#64748B', padding: '1rem 0', textAlign: 'center' }}>
                  No recommendations yet. Update your technical skills to receive suggestions.
                </div>
              ) : (
                recommendations.recommendedPapers.slice(0, 3).map((item: any) => (
                  <div
                    key={item.paper?._id}
                    style={{
                      padding: '0.75rem 0',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <Link
                      to={`/research/papers?id=${item.paper?._id}`}
                      style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0B1220', textDecoration: 'none', display: 'block', lineHeight: 1.4 }}
                    >
                      {item.paper?.title}
                    </Link>
                    <div style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '0.25rem' }}>
                      {item.recommendationReasons?.[0] || 'Matches departmental criteria'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Curated Capstone Project Ideas */}
          <div className="acr-card">
            <div className="acr-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={16} color="#D97706" />
                <h3 style={{ fontSize: '0.875rem', fontWeight: 800 }}>Curated Project Ideas</h3>
              </div>
              <Link to="/projects/ideas" style={{ fontSize: '0.75rem', color: 'var(--color-royal-blue)', fontWeight: 700 }}>
                Browse Catalog
              </Link>
            </div>
            <div className="acr-card-body" style={{ padding: '0.85rem 1.25rem' }}>
              {recommendations.recommendedIdeas.length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: '#64748B', padding: '1rem 0', textAlign: 'center' }}>
                  Browse our institutional idea repository.
                </div>
              ) : (
                recommendations.recommendedIdeas.slice(0, 2).map((item: any) => (
                  <div
                    key={item.idea?._id}
                    style={{
                      padding: '0.75rem 0',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="acr-badge acr-badge-warning" style={{ fontSize: '0.625rem' }}>
                        {item.idea?.difficulty}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: '#64748B' }}>
                        {item.idea?.domainId?.name}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0B1220', lineHeight: 1.4 }}>
                      {item.idea?.title}
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <Link
                        to={`/projects/create?ideaId=${item.idea?._id}`}
                        className="acr-btn acr-btn-ghost acr-btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--color-royal-blue)' }}
                      >
                        Start Project from Idea →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
