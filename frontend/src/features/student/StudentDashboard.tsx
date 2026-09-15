import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { projectApi } from '../../services/api/projectApi';
import { researchApi } from '../../services/api/researchApi';
import { IProject, IResearchPaper, IResearchTopic } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  FolderGit2,
  BookOpen,
  Sparkles,
  Clock,
  MessageSquare,
  ArrowRight,
  Bookmark,
  Calendar,
  PlusCircle,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [myProjects, setMyProjects] = useState<IProject[]>([]);
  const [recommendations, setRecommendations] = useState<{ recommendedPapers: any[]; recommendedIdeas: any[] }>({
    recommendedPapers: [],
    recommendedIdeas: [],
  });
  const [savedCount, setSavedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      projectApi.listProjects({ filterType: 'my' }).catch(() => ({ projects: [] })),
      researchApi.getRecommendations().catch(() => ({ recommendedPapers: [], recommendedIdeas: [] })),
      researchApi.getSavedResearch().catch(() => []),
    ]).then(([projectsData, recsData, savedData]) => {
      setMyProjects(projectsData.projects || []);
      setRecommendations(recsData);
      setSavedCount(Array.isArray(savedData) ? savedData.length : 0);
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

  return (
    <div>
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
              Welcome back, {user?.fullName}
            </h1>
            <span className="acr-badge acr-badge-info">
              {profile?.studentId || 'Student Scholar'}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Department of {profile?.department || 'Engineering'} • Year {profile?.yearOfStudy || 4} • CGPA: {profile?.cgpa || '8.9'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/projects/create" className="acr-btn acr-btn-primary">
            <PlusCircle size={16} />
            <span>Create Research Project</span>
          </Link>
          <Link to="/research/papers" className="acr-btn acr-btn-secondary">
            <BookOpen size={16} />
            <span>Explore Literature</span>
          </Link>
        </div>
      </div>

      {/* Purposeful Metrics */}
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
              Active Projects
            </span>
            <FolderGit2 size={18} color="var(--primary-600)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            {myProjects.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {myProjects.filter((p) => p.status === 'IN_PROGRESS').length} in active development
          </div>
        </div>

        <div className="acr-card acr-card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Saved Bookmarks
            </span>
            <Bookmark size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            {savedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Papers, topics & capstone ideas
          </div>
        </div>

        <div className="acr-card acr-card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Guidance Match
            </span>
            <Sparkles size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            {recommendations.recommendedPapers.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Tailored literature recommendations
          </div>
        </div>
      </div>

      {/* Main Grid: Projects on Left, Recommendations on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Active Projects List */}
        <div className="acr-card">
          <div className="acr-card-header">
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Your Academic Projects</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Track milestones, faculty guidance, and deliverable submissions
              </p>
            </div>
            <Link to="/projects?filter=my" className="acr-btn acr-btn-ghost acr-btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="acr-card-body" style={{ padding: 0 }}>
            {myProjects.length === 0 ? (
              <div style={{ padding: '2rem' }}>
                <EmptyState
                  title="No research projects yet"
                  description="Begin by discovering a problem statement or creating your capstone research proposal."
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
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {p.code}
                      </span>
                      <Badge variant={getStatusBadgeVariant(p.status)}>
                        {p.status.replace(/_/g, ' ')}
                      </Badge>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {p.domainId?.name}
                      </span>
                    </div>

                    <Link
                      to={`/projects/${p._id}`}
                      style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
                    >
                      {p.title}
                    </Link>

                    {/* Real Calculated Progress Bar */}
                    <div style={{ marginTop: '0.75rem', maxWidth: '380px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        <span>Milestone Progress</span>
                        <span>{p.progressPercentage}%</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--bg-muted)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${p.progressPercentage}%`,
                            background: 'var(--primary-600)',
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

        {/* Right Sidebar: Rule-Based Literature Recommendations & Curated Ideas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Recommended Literature */}
          <div className="acr-card">
            <div className="acr-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} color="var(--primary-600)" />
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Recommended for You</h3>
              </div>
              <Link to="/research/recommendations" style={{ fontSize: '0.75rem', color: 'var(--primary-600)' }}>
                View All
              </Link>
            </div>
            <div className="acr-card-body" style={{ padding: '0.75rem 1rem' }}>
              {recommendations.recommendedPapers.slice(0, 3).map((item: any) => (
                <div
                  key={item.paper?._id}
                  style={{
                    padding: '0.65rem 0',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <Link
                    to={`/research/papers?id=${item.paper?._id}`}
                    style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
                  >
                    {item.paper?.title}
                  </Link>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {item.recommendationReasons?.[0] || 'Matches departmental criteria'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Curated Capstone Project Ideas */}
          <div className="acr-card">
            <div className="acr-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={16} color="#d97706" />
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Curated Project Ideas</h3>
              </div>
              <Link to="/projects/ideas" style={{ fontSize: '0.75rem', color: 'var(--primary-600)' }}>
                Browse Catalog
              </Link>
            </div>
            <div className="acr-card-body" style={{ padding: '0.75rem 1rem' }}>
              {recommendations.recommendedIdeas.slice(0, 2).map((item: any) => (
                <div
                  key={item.idea?._id}
                  style={{
                    padding: '0.65rem 0',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className="acr-badge acr-badge-warning" style={{ fontSize: '0.625rem' }}>
                      {item.idea?.difficulty}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      {item.idea?.domainId?.name}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.idea?.title}
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <Link
                      to={`/projects/create?ideaId=${item.idea?._id}`}
                      className="acr-btn acr-btn-ghost acr-btn-sm"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      Start Project from Idea →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
