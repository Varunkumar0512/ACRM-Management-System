import React, { useState } from 'react';
import { IResearchPaper } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { researchApi } from '../../services/api/researchApi';
import { useToast } from '../../hooks/useToast';
import { Bookmark, ExternalLink, Copy, Check, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PaperDetailModalProps {
  paper: IResearchPaper | null;
  isOpen: boolean;
  onClose: () => void;
  relatedIdeas?: any[];
}

export const PaperDetailModal: React.FC<PaperDetailModalProps> = ({
  paper,
  isOpen,
  onClose,
  relatedIdeas = [],
}) => {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!paper) return null;

  const handleCopyCitation = () => {
    const citation = `${paper.authors?.join(', ')}. "${paper.title}." ${paper.venue} (${new Date(paper.publicationDate).getFullYear()}). DOI: ${paper.doi || 'N/A'}`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    toast.success('Citation copied to clipboard (IEEE / APA format).');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleBookmark = async () => {
    setIsSaving(true);
    try {
      const res = await researchApi.toggleSaved({ itemType: 'PAPER', itemId: paper._id });
      toast.success(res.isSaved ? 'Paper added to your Saved Research.' : 'Paper removed from Saved Research.');
    } catch {
      toast.error('Failed to update bookmark.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Research Paper Overview" maxWidth="720px">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span className="acr-badge acr-badge-info">{paper.domainId?.name || paper.department}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Published {new Date(paper.publicationDate).toLocaleDateString()}
          </span>
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
          {paper.title}
        </h2>

        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          <strong>Authors:</strong> {paper.authors?.join(', ')} <br />
          <strong>Venue:</strong> {paper.venue} <br />
          {paper.doi && (
            <span>
              <strong>DOI:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{paper.doi}</span>
            </span>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Abstract
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6, background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            {paper.abstract}
          </p>
        </div>

        {paper.keywords && paper.keywords.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Keywords
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {paper.keywords.map((k, i) => (
                <span key={i} className="acr-badge acr-badge-neutral">
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}

        {relatedIdeas.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Related Capstone Project Ideas
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {relatedIdeas.map((idea) => (
                <div
                  key={idea._id}
                  style={{
                    padding: '0.65rem 0.85rem',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{idea.title}</span>
                  <Link to={`/projects/create?ideaId=${idea._id}`} className="acr-btn acr-btn-ghost acr-btn-sm" onClick={onClose}>
                    Start Project →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" size="sm" onClick={handleBookmark} isLoading={isSaving} icon={<Bookmark size={14} />}>
              Save Paper
            </Button>
            <Button variant="secondary" size="sm" onClick={handleCopyCitation} icon={copied ? <Check size={14} /> : <Copy size={14} />}>
              {copied ? 'Copied' : 'Copy Citation'}
            </Button>
          </div>

          {paper.externalUrl && (
            <a
              href={paper.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="acr-btn acr-btn-primary acr-btn-sm"
            >
              <span>View Publisher / DOI</span>
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
};
