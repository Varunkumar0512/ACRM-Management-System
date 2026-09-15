import React, { useState, useEffect } from 'react';
import { researchApi } from '../../services/api/researchApi';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PaperDetailModal } from './PaperDetailModal';
import { Sparkles, Info, ArrowRight, Bookmark, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecommendationsPage: React.FC = () => {
  const [data, setData] = useState<{
    recommendedPapers: any[];
    recommendedIdeas: any[];
    algorithmMetadata?: any;
  }>({ recommendedPapers: [], recommendedIdeas: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    researchApi
      .getRecommendations()
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Research' },
          { label: 'Deterministic Academic Recommendations' },
        ]}
      />

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Sparkles size={20} color="var(--primary-600)" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Personalized Academic Recommendations
          </h1>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Rule-based academic matching tailored to your department, declared interests, and active project focus
        </p>
      </div>

      {/* Algorithm Transparency Card */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--info-bg)',
          border: '1px solid var(--info-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--info-text)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          fontSize: '0.8125rem',
          lineHeight: 1.5,
        }}
      >
        <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Transparent Matching Mechanics:</strong> {data.algorithmMetadata?.engine || 'Deterministic Rule-Based Matcher'}.{' '}
          Scores are mathematically calculated from:
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
            <li>Department Alignment (+30 pts)</li>
            <li>Declared Research Interest Keyword Overlap (+20 pts per match)</li>
            <li>Active Project Domain Relevance (+25 pts)</li>
            <li>Citation Impact & Benchmark Factor (+10 pts)</li>
          </ul>
        </div>
      </div>

      {/* Recommended Papers Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Top Matching Research Papers
        </h2>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Calculating recommendations...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.recommendedPapers.map((item, idx) => (
              <div
                key={idx}
                className="acr-card"
                style={{ padding: '1.25rem 1.5rem', cursor: 'pointer' }}
                onClick={() => {
                  setSelectedPaper(item.paper);
                  setIsModalOpen(true);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span
                        style={{
                          backgroundColor: 'var(--primary-50)',
                          color: 'var(--primary-700)',
                          border: '1px solid var(--primary-100)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                        }}
                      >
                        {item.relevanceScore}% Match
                      </span>
                      <Badge variant="info">{item.paper?.domainId?.name || item.paper?.department}</Badge>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                      {item.paper?.title}
                    </h3>

                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Authors: <strong>{item.paper?.authors?.join(', ')}</strong> • Venue: <em>{item.paper?.venue}</em>
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                      {item.paper?.abstract?.slice(0, 200)}...
                    </p>

                    {/* Recommendation Reasons Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {item.recommendationReasons?.map((reason: string, rIdx: number) => (
                        <span
                          key={rIdx}
                          style={{
                            fontSize: '0.6875rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            backgroundColor: 'var(--bg-muted)',
                            color: 'var(--text-secondary)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <CheckCircle2 size={12} color="#059669" />
                          <span>{reason}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button variant="secondary" size="sm" onClick={() => { setSelectedPaper(item.paper); setIsModalOpen(true); }}>
                    Inspect
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Project Ideas Section */}
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Matching Capstone Project Topics
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {data.recommendedIdeas.map((item, idx) => (
            <div key={idx} className="acr-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="acr-badge acr-badge-warning">{item.idea?.difficulty}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-600)' }}>
                  {item.relevanceScore}% Match
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {item.idea?.title}
              </h3>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, marginBottom: '1rem' }}>
                {item.idea?.problemStatement?.slice(0, 140)}...
              </p>

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {item.idea?.domainId?.name}
                </span>
                <Link
                  to={`/projects/create?ideaId=${item.idea?._id}`}
                  className="acr-btn acr-btn-primary acr-btn-sm"
                >
                  Start Project →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PaperDetailModal
        paper={selectedPaper}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
