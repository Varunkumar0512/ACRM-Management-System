import React, { useState, useEffect } from 'react';
import { researchApi } from '../../services/api/researchApi';
import { IResearchTopic, IResearchDomain } from '../../types';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Badge } from '../../components/ui/Badge';
import { Search, BookOpen, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TopicsCatalog: React.FC = () => {
  const [topics, setTopics] = useState<IResearchTopic[]>([]);
  const [domains, setDomains] = useState<IResearchDomain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    researchApi.getDomains().then(setDomains).catch(() => {});
  }, []);

  useEffect(() => {
    setIsLoading(true);
    researchApi
      .getTopics({ domainId: selectedDomain || undefined, search: search || undefined })
      .then((data) => setTopics(data.topics || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [selectedDomain, search]);

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Research' },
          { label: 'Research Topics & Taxonomies' },
        ]}
      />

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Research Topics & Academic Domains
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Standardized taxonomy classifications and emerging investigation areas within the campus research network
        </p>
      </div>

      {/* Filter and Search */}
      <div className="acr-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="acr-input"
              placeholder="Search topics by keywords or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <select
            className="acr-select"
            style={{ flex: 1, minWidth: '200px' }}
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
        </div>
      </div>

      {/* Topics Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading research taxonomy...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {topics.map((topic) => (
            <div key={topic._id} className="acr-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <Badge variant="info">{topic.domainId?.name}</Badge>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Trending Score: {topic.trendingScore}
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {topic.title}
              </h3>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, marginBottom: '1rem' }}>
                {topic.description}
              </p>

              {topic.keywords && topic.keywords.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                  {topic.keywords.map((k, i) => (
                    <span key={i} className="acr-badge acr-badge-neutral" style={{ fontSize: '0.6875rem' }}>
                      {k}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link
                  to={`/research/papers?domainId=${topic.domainId?._id}`}
                  style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 600 }}
                >
                  View Related Literature →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
