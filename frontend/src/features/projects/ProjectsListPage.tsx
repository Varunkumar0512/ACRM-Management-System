import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { projectApi } from '../../services/api/projectApi';
import { IProject } from '../../types';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Tabs } from '../../components/ui/Tabs';
import { PlusCircle, Search, FolderGit2, ArrowRight } from 'lucide-react';

export const ProjectsListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') || 'my';

  const [activeTab, setActiveTab] = useState<string>(filterParam);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setActiveTab(filterParam);
  }, [filterParam]);

  const loadProjects = () => {
    setIsLoading(true);
    projectApi
      .listProjects({ filterType: activeTab, search: search || undefined })
      .then((data) => setProjects(data.projects || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadProjects();
  }, [activeTab]);

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
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Projects' },
          { label: 'Academic Projects Directory' },
        ]}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Academic Projects Workspace
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Track project lifecycle milestones, faculty mentor reviews, and collaborative deliverables
          </p>
        </div>

        <Link to="/projects/create" className="acr-btn acr-btn-primary">
          <PlusCircle size={16} />
          <span>Create Project</span>
        </Link>
      </div>

      <Tabs
        tabs={[
          { id: 'my', label: 'My Projects' },
          { id: 'team', label: 'Team Collaborations' },
          { id: 'guided', label: 'Mentored Projects' },
          { id: 'all', label: 'All Public Projects' },
        ]}
        activeTab={activeTab}
        onChange={(id) => {
          setActiveTab(id);
          setSearchParams({ filter: id });
        }}
      />

      {/* Filter and Search */}
      <div className="acr-card" style={{ padding: '0.85rem 1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              className="acr-input"
              placeholder="Search projects by title, code, or technology..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadProjects()}
              style={{ paddingLeft: '2.25rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
          <Button variant="primary" onClick={loadProjects}>
            Search
          </Button>
        </div>
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="There are currently no research projects matching your filter."
          actionLabel="Create New Project"
          onAction={() => (window.location.href = '/projects/create')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {projects.map((p) => (
            <div key={p._id} className="acr-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
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
                    style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}
                  >
                    {p.title}
                  </Link>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0.5rem 0' }}>
                    {p.problemStatement?.slice(0, 160)}...
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                    {p.technologies?.slice(0, 4).map((tech, tIdx) => (
                      <span key={tIdx} className="acr-badge acr-badge-neutral" style={{ fontSize: '0.6875rem' }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem', minWidth: '180px' }}>
                  <div style={{ width: '100%', textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Progress: <strong>{p.progressPercentage}%</strong>
                    </div>
                    <div style={{ height: '6px', width: '160px', background: 'var(--bg-muted)', borderRadius: '9999px', overflow: 'hidden', marginLeft: 'auto' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${p.progressPercentage}%`,
                          background: 'var(--primary-600)',
                          borderRadius: '9999px',
                        }}
                      />
                    </div>
                  </div>

                  <Link to={`/projects/${p._id}`} className="acr-btn acr-btn-secondary acr-btn-sm">
                    <span>Open Workspace</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
