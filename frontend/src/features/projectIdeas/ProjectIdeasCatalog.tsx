import React, { useState, useEffect } from 'react';
import { researchApi } from '../../services/api/researchApi';
import { IProjectIdea, IResearchDomain } from '../../types';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';
import { Search, Lightbulb, Bookmark, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProjectIdeasCatalog: React.FC = () => {
  const toast = useToast();
  const [ideas, setIdeas] = useState<IProjectIdea[]>([]);
  const [domains, setDomains] = useState<IResearchDomain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    researchApi.getDomains().then(setDomains).catch(() => {});
  }, []);

  const loadIdeas = () => {
    setIsLoading(true);
    researchApi
      .getProjectIdeas({
        domainId: selectedDomain || undefined,
        difficulty: selectedDifficulty || undefined,
        search: search || undefined,
      })
      .then((data) => setIdeas(data.ideas || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadIdeas();
  }, [selectedDomain, selectedDifficulty]);

  const handleBookmark = async (ideaId: string) => {
    try {
      const res = await researchApi.toggleSaved({ itemType: 'IDEA', itemId: ideaId });
      toast.success(res.isSaved ? 'Idea bookmarked to Saved Research.' : 'Idea removed from bookmarks.');
    } catch {
      toast.error('Failed to save idea.');
    }
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Projects' },
          { label: 'Curated Project Ideas' },
        ]}
      />

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Curated Capstone & Research Ideas
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Explore verified institutional problem statements with structured objectives, tech stacks, and expected deliverables
          </p>
        </div>

        <Link to="/projects/create" className="acr-btn acr-btn-primary">
          <span>Create Custom Project</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="acr-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="acr-input"
              placeholder="Search problem statements or technologies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadIdeas()}
              style={{ paddingLeft: '2.25rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <select
            className="acr-select"
            style={{ flex: 1, minWidth: '180px' }}
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
          >
            <option value="">All Research Domains</option>
            {domains.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            className="acr-select"
            style={{ flex: 1, minWidth: '150px' }}
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            <option value="">All Difficulties</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>

          <Button variant="primary" onClick={loadIdeas}>
            Filter
          </Button>
        </div>
      </div>

      {/* Ideas Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading project ideas...
        </div>
      ) : ideas.length === 0 ? (
        <EmptyState
          title="No project ideas match your criteria"
          description="Try selecting a different domain or clearing your search term."
          actionLabel="Clear Filters"
          onAction={() => {
            setSelectedDomain('');
            setSelectedDifficulty('');
            setSearch('');
          }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {ideas.map((idea) => (
            <div key={idea._id} className="acr-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="acr-card-body" style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="acr-badge acr-badge-info">{idea.domainId?.name}</span>
                  <span
                    className={`acr-badge ${
                      idea.difficulty === 'ADVANCED'
                        ? 'acr-badge-danger'
                        : idea.difficulty === 'INTERMEDIATE'
                        ? 'acr-badge-warning'
                        : 'acr-badge-success'
                    }`}
                  >
                    {idea.difficulty}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                  {idea.title}
                </h3>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {idea.problemStatement}
                </p>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Key Objectives
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {idea.objectives.slice(0, 3).map((obj, oIdx) => (
                      <li key={oIdx}>{obj}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Technologies
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {idea.technologies.map((t, tIdx) => (
                      <span key={tIdx} className="acr-badge acr-badge-neutral" style={{ fontSize: '0.6875rem' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="acr-card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => handleBookmark(idea._id)}
                  className="acr-btn-ghost"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  <Bookmark size={14} />
                  <span>Save</span>
                </button>

                <Link to={`/projects/create?ideaId=${idea._id}`} className="acr-btn acr-btn-primary acr-btn-sm">
                  <span>Start Project</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
