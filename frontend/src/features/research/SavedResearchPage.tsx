import React, { useState, useEffect } from 'react';
import { researchApi } from '../../services/api/researchApi';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../hooks/useToast';
import { Tabs } from '../../components/ui/Tabs';
import { Bookmark, Trash2, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SavedResearchPage: React.FC = () => {
  const toast = useToast();
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PAPER' | 'TOPIC' | 'IDEA'>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadSaved = () => {
    setIsLoading(true);
    researchApi
      .getSavedResearch()
      .then((data) => setSavedItems(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleRemove = async (itemType: 'PAPER' | 'TOPIC' | 'IDEA', itemId: string) => {
    try {
      await researchApi.toggleSaved({ itemType, itemId });
      toast.success('Removed from saved items.');
      setSavedItems((prev) =>
        prev.filter((i) => {
          if (itemType === 'PAPER') return (i.paperId?._id || i.paperId) !== itemId;
          if (itemType === 'TOPIC') return (i.topicId?._id || i.topicId) !== itemId;
          return (i.ideaId?._id || i.ideaId) !== itemId;
        })
      );
    } catch {
      toast.error('Failed to remove item.');
    }
  };

  const filteredItems = savedItems.filter((item) => {
    if (activeTab === 'ALL') return true;
    return item.itemType === activeTab;
  });

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Research' },
          { label: 'Saved Research' },
        ]}
      />

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Saved Research Repository
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Quick access to papers, topics, and problem statement ideas bookmarked for your thesis
        </p>
      </div>

      <Tabs
        tabs={[
          { id: 'ALL', label: 'All Items', count: savedItems.length },
          { id: 'PAPER', label: 'Research Papers', count: savedItems.filter((i) => i.itemType === 'PAPER').length },
          { id: 'TOPIC', label: 'Topics', count: savedItems.filter((i) => i.itemType === 'TOPIC').length },
          { id: 'IDEA', label: 'Project Ideas', count: savedItems.filter((i) => i.itemType === 'IDEA').length },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading saved research...
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No saved research found"
          description="Bookmark papers from the research catalog to organize literature references for your project."
          actionLabel="Explore Papers"
          onAction={() => (window.location.href = '/research/papers')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredItems.map((item) => {
            const paper = item.paperId;
            const topic = item.topicId;
            const idea = item.ideaId;

            return (
              <div key={item._id} className="acr-card" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <Badge variant="neutral">{item.itemType}</Badge>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Saved {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {paper && (
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                          {paper.title}
                        </h3>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                          Authors: {paper.authors?.join(', ')} • {paper.venue}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {paper.abstract?.slice(0, 180)}...
                        </p>
                      </div>
                    )}

                    {topic && (
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                          {topic.title}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {topic.description}
                        </p>
                      </div>
                    )}

                    {idea && (
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                          {idea.title}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                          {idea.problemStatement}
                        </p>
                        <Link to={`/projects/create?ideaId=${idea._id}`} className="acr-btn acr-btn-secondary acr-btn-sm">
                          Start Project from this Idea
                        </Link>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      handleRemove(
                        item.itemType,
                        paper?._id || topic?._id || idea?._id || item.paperId || item.topicId || item.ideaId
                      )
                    }
                    className="acr-btn-ghost"
                    style={{ color: '#dc2626', padding: '0.45rem', cursor: 'pointer' }}
                    title="Remove from saved"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
