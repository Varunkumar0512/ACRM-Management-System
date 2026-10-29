import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { projectApi } from '../../services/api/projectApi';
import { researchApi } from '../../services/api/researchApi';
import { iprApi } from '../../services/api/iprApi';
import { IProject, IIPRDisclosure } from '../../types';
import {
  FolderGit2,
  BookOpen,
  Sparkles,
  Bookmark,
  PlusCircle,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  GraduationCap,
  FileText,
  Lightbulb,
} from 'lucide-react';
import {
  PageHeader,
  StatCard,
  DashboardSection,
  ProjectProgressCard,
  DeadlineList,
  DeadlineItem,
  QuickActionCard,
  DashboardSkeleton,
  ErrorState,
} from '../../components/dashboard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';

export const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [myProjects, setMyProjects] = useState<IProject[]>([]);
  const [recommendations, setRecommendations] = useState<{ recommendedPapers: any[]; recommendedIdeas: any[] }>({
    recommendedPapers: [],
    recommendedIdeas: [],
  });
  const [savedCount, setSavedCount] = useState<number>(0);
  const [disclosures, setDisclosures] = useState<IIPRDisclosure[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setHasError(false);
      const [projectsData, recsData, savedData, iprData] = await Promise.all([
        projectApi.listProjects({ filterType: 'my' }).catch(() => ({ projects: [] })),
        researchApi.getRecommendations().catch(() => ({ recommendedPapers: [], recommendedIdeas: [] })),
        researchApi.getSavedResearch().catch(() => []),
        iprApi.getDisclosures({ limit: 5 }).catch(() => ({ disclosures: [] })),
      ]);

      setMyProjects(projectsData.projects || []);
      setRecommendations(recsData || { recommendedPapers: [], recommendedIdeas: [] });
      setSavedCount(Array.isArray(savedData) ? savedData.length : 0);
      setDisclosures(iprData?.disclosures || []);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRetry = () => {
    setIsRetrying(true);
    fetchDashboardData();
  };

  if (isLoading) {
    return <DashboardSkeleton kpiCount={4} />;
  }

  if (hasError) {
    return (
      <ErrorState
        title="Student Research Workspace Unavailable"
        message="Unable to connect to the campus research backend. Please verify your connection or retry."
        onRetry={handleRetry}
        isRetrying={isRetrying}
      />
    );
  }

  const activeProjects = myProjects.filter((p) => p.status !== 'COMPLETED');
  const completedProjects = myProjects.filter((p) => p.status === 'COMPLETED');
  const inProgressProjects = myProjects.filter(
    (p) => p.status === 'IN_PROGRESS' || p.status === 'APPROVED'
  );

  // Compute upcoming milestone deadlines
  const upcomingDeadlines: DeadlineItem[] = myProjects
    .filter((p) => p.expectedCompletionDate)
    .map((p) => ({
      id: p._id,
      title: `Final Deliverable: ${p.title}`,
      dueDate: p.expectedCompletionDate!,
      projectCode: p.code,
      projectId: p._id,
      category: p.domainId?.name || 'Research Sprint',
    }))
    .slice(0, 4);

  return (
    <div>
      {/* 1. Personalized Header */}
      <PageHeader
        title={`Welcome back, ${user?.fullName || 'Scholar'}`}
        subtitle={`Department of ${profile?.department || 'Computer Science & Engineering'} • Year ${profile?.yearOfStudy || 4} • Capstone Research Workspace`}
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
            {profile?.studentId || 'Undergraduate Scholar'}
          </span>
        }
        actions={
          <>
            <Link to="/projects/create" className="acr-btn acr-btn-primary">
              <PlusCircle size={15} />
              <span>Create Project</span>
            </Link>
            <Link to="/ipr/novelty" className="acr-btn acr-btn-secondary">
              <Sparkles size={15} color="#8B5CF6" />
              <span>Novelty Screening</span>
            </Link>
            <Link to="/research/papers" className="acr-btn acr-btn-ghost">
              <BookOpen size={15} />
              <span>Explore Literature</span>
            </Link>
          </>
        }
      />

      {/* 2. KPI Metrics Bar */}
      <div className="acr-kpi-grid">
        <StatCard
          title="TOTAL PROJECTS"
          value={myProjects.length}
          subtitle={`${activeProjects.length} currently active`}
          icon={<FolderGit2 size={18} />}
          accent="blue"
          linkTo="/projects?filter=my"
        />
        <StatCard
          title="ACTIVE SPRINT"
          value={inProgressProjects.length}
          subtitle="In progress deliverables"
          icon={<Layers size={18} />}
          accent="emerald"
        />
        <StatCard
          title="COMPLETED DELIVERABLES"
          value={completedProjects.length}
          subtitle="Verified by faculty guide"
          icon={<CheckCircle2 size={18} />}
          accent="purple"
        />
        <StatCard
          title="IPR DISCLOSURES"
          value={disclosures.length}
          subtitle="Campus inventions recorded"
          icon={<ShieldCheck size={18} />}
          accent="cyan"
          linkTo="/ipr/my"
        />
      </div>

      {/* 3. Main Dashboard Layout Split */}
      <div className="acr-dashboard-split">
        {/* Left Column: Projects, Deadlines, Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Projects Section */}
          <DashboardSection
            title="Your Academic Research Projects"
            subtitle="Track milestone deliverables, faculty guidance, and sprint velocity"
            icon={<FolderGit2 size={18} />}
            noPadding
            action={
              <Link to="/projects?filter=my" className="acr-btn acr-btn-ghost acr-btn-sm">
                <span>View All ({myProjects.length})</span>
                <ArrowRight size={13} />
              </Link>
            }
          >
            {myProjects.length === 0 ? (
              <div style={{ padding: '2.5rem' }}>
                <EmptyState
                  title="No research projects registered yet"
                  description="Begin by proposing your capstone problem statement, or browse curated research ideas."
                  actionLabel="Create First Project"
                  onAction={() => (window.location.href = '/projects/create')}
                />
              </div>
            ) : (
              myProjects.map((project) => (
                <ProjectProgressCard
                  key={project._id}
                  project={project}
                  nextMilestoneTitle={
                    project.progressPercentage < 50
                      ? 'Literature Survey & Design'
                      : project.progressPercentage < 100
                      ? 'Implementation & Validation'
                      : 'Final Report & Defense'
                  }
                />
              ))
            )}
          </DashboardSection>

          {/* Upcoming Milestone Deadlines */}
          <DashboardSection
            title="Upcoming Deadlines & Project Milestones"
            subtitle="Scheduled submission deadlines and faculty review checkpoints"
            icon={<Clock size={18} />}
          >
            <DeadlineList
              items={upcomingDeadlines}
              emptyMessage="No immediate deadlines pending. All project milestones are currently on schedule."
            />
          </DashboardSection>

          {/* Quick Workflows Grid */}
          <div className="acr-grid-2col">
            <QuickActionCard
              title="AI Novelty Assessment"
              description="Analyze your project's problem statement and solution against global literature and patents."
              to="/ipr/novelty"
              icon={<Sparkles size={20} />}
              accentColor="#8B5CF6"
              badge="AI Advisory"
            />
            <QuickActionCard
              title="Institutional IPR Disclosure"
              description="File an official disclosure with the campus Intellectual Property office for institutional review."
              to="/ipr/submit"
              icon={<ShieldCheck size={20} />}
              accentColor="var(--color-royal-blue)"
              badge="Patent Office"
            />
          </div>
        </div>

        {/* Right Column: Recommended Literature & Curated Ideas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Recommended Literature */}
          <DashboardSection
            title="Recommended Literature"
            subtitle="Matched to your department and research focus"
            icon={<Sparkles size={16} />}
            action={
              <Link
                to="/research/recommendations"
                style={{ fontSize: '0.75rem', color: 'var(--color-royal-blue)', fontWeight: 700 }}
              >
                View All
              </Link>
            }
          >
            {recommendations.recommendedPapers.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '1rem 0', textAlign: 'center' }}>
                No paper recommendations yet. Browse the literature catalog to seed suggestions.
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
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      display: 'block',
                      lineHeight: 1.4,
                    }}
                  >
                    {item.paper?.title}
                  </Link>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {item.recommendationReasons?.[0] || 'Matches departmental criteria'}
                  </div>
                </div>
              ))
            )}
          </DashboardSection>

          {/* Curated Capstone Project Ideas */}
          <DashboardSection
            title="Curated Project Ideas"
            subtitle="Faculty-endorsed research topics and challenges"
            icon={<Lightbulb size={16} />}
            action={
              <Link
                to="/projects/ideas"
                style={{ fontSize: '0.75rem', color: 'var(--color-royal-blue)', fontWeight: 700 }}
              >
                Catalog
              </Link>
            }
          >
            {recommendations.recommendedIdeas.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '1rem 0', textAlign: 'center' }}>
                Browse our institutional repository for faculty-curated capstone challenges.
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
                    <span
                      style={{
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.45rem',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor:
                          item.idea?.difficulty === 'ADVANCED'
                            ? 'rgba(239, 68, 68, 0.12)'
                            : item.idea?.difficulty === 'INTERMEDIATE'
                            ? 'rgba(245, 158, 11, 0.12)'
                            : 'rgba(16, 185, 129, 0.12)',
                        color:
                          item.idea?.difficulty === 'ADVANCED'
                            ? '#EF4444'
                            : item.idea?.difficulty === 'INTERMEDIATE'
                            ? '#D97706'
                            : '#059669',
                      }}
                    >
                      {item.idea?.difficulty}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      {item.idea?.domainId?.name}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {item.idea?.title}
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <Link
                      to={`/projects/create?ideaId=${item.idea?._id}`}
                      className="acr-btn acr-btn-ghost acr-btn-sm"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: 'var(--color-royal-blue)' }}
                    >
                      Start Project from Idea →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </DashboardSection>

          {/* Research Library Shortcut */}
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
                Saved Research Assets
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                {savedCount} papers and topics bookmarked
              </div>
            </div>
            <Link to="/research/saved" className="acr-btn acr-btn-secondary acr-btn-sm">
              Open Library
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
