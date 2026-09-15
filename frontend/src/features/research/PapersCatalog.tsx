import React, { useState, useEffect } from 'react';
import { researchApi } from '../../services/api/researchApi';
import { IResearchPaper, IResearchDomain } from '../../types';
import { PaperDetailModal } from './PaperDetailModal';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';
import { Search, Filter, Bookmark, ExternalLink, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

export const PapersCatalog: React.FC = () => {
  const toast = useToast();

  const [papers, setPapers] = useState<IResearchPaper[]>([]);
  const [domains, setDomains] = useState<IResearchDomain[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'citations' | 'saved'>('date');
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  // Modal
  const [selectedPaper, setSelectedPaper] = useState<IResearchPaper | null>(null);
  const [relatedIdeas, setRelatedIdeas] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    researchApi.getDomains().then(setDomains).catch(() => {});
  }, []);

  const loadPapers = async () => {
    setIsLoading(true);
    try {
      const data = await researchApi.getPapers({
        domainId: selectedDomain || undefined,
        department: selectedDepartment || undefined,
        search: search || undefined,
        sortBy,
        skip: (page - 1) * limit,
        limit,
      });
      setPapers(data.papers || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load research papers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPapers();
  }, [page, selectedDomain, selectedDepartment, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadPapers();
  };

  const handleOpenDetail = async (paper: IResearchPaper) => {
    setSelectedPaper(paper);
    setIsModalOpen(true);
    try {
      const details = await researchApi.getPaperDetails(paper._id);
      setRelatedIdeas(details?.relatedIdeas || []);
    } catch {
      setRelatedIdeas([]);
    }
  };

  const handleBookmark = async (e: React.MouseEvent, paperId: string) => {
    e.stopPropagation();
    try {
      const res = await researchApi.toggleSaved({ itemType: 'PAPER', itemId: paperId });
      toast.success(res.isSaved ? 'Paper bookmarked to Saved Research.' : 'Paper removed from bookmarks.');
      // Refresh count locally
      setPapers((prev) =>
        prev.map((p) => (p._id === paperId ? { ...p, savedCount: p.savedCount + (res.isSaved ? 1 : -1) } : p))
      );
    } catch {
      toast.error('Could not bookmark paper.');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Research' },
          { label: 'Research Papers Catalog' },
        ]}
      />

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Research Papers Catalog
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Peer-reviewed papers, faculty publications, and academic references across university departments
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="acr-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 2, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="acr-input"
              placeholder="Search by keywords, title, abstract, or authors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <select
            className="acr-select"
            style={{ flex: 1, minWidth: '180px' }}
            value={selectedDomain}
            onChange={(e) => {
              setSelectedDomain(e.target.value);
              setPage(1);
            }}
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
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="date">Sort by Date (Newest)</option>
            <option value="citations">Sort by Most Citations</option>
            <option value="saved">Sort by Most Bookmarked</option>
          </select>

          <Button type="submit" variant="primary">
            Filter Results
          </Button>
        </form>
      </div>

      {/* Papers Listing */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading academic research papers...
        </div>
      ) : papers.length === 0 ? (
        <EmptyState
          title="No research papers matched your filters"
          description="Try broadening your search query or selecting a different research domain."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setSelectedDomain('');
            setSelectedDepartment('');
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {papers.map((paper) => (
            <div
              key={paper._id}
              className="acr-card"
              style={{ padding: '1.25rem 1.5rem', cursor: 'pointer' }}
              onClick={() => handleOpenDetail(paper)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <Badge variant="info">{paper.domainId?.name || paper.department}</Badge>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Published {new Date(paper.publicationDate).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {paper.title}
                  </h3>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Authors: <strong>{paper.authors?.join(', ')}</strong> • Venue: <em>{paper.venue}</em>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    {paper.abstract.length > 220 ? `${paper.abstract.slice(0, 220)}...` : paper.abstract}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{paper.citationsCount} Citations</span>
                    <span>•</span>
                    <span>{paper.savedCount} Bookmarks</span>
                    {paper.doi && (
                      <>
                        <span>•</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>DOI: {paper.doi}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleBookmark(e, paper._id)}
                  className="acr-btn-ghost"
                  style={{ padding: '0.45rem', borderRadius: '4px', cursor: 'pointer' }}
                  title="Bookmark Paper"
                >
                  <Bookmark size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Showing page {page} of {totalPages} ({total} papers)
          </span>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              icon={<ChevronLeft size={14} />}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      <PaperDetailModal
        paper={selectedPaper}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        relatedIdeas={relatedIdeas}
      />
    </div>
  );
};
