import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, BookOpen, Lightbulb, FolderGit2, GraduationCap, X } from 'lucide-react';
import { searchApi } from '../../services/api/otherApis';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    papers: any[];
    topics: any[];
    ideas: any[];
    projects: any[];
    faculty: any[];
  }>({ papers: [], topics: [], ideas: [], projects: [], faculty: [] });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent can toggle
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({ papers: [], topics: [], ideas: [], projects: [], faculty: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchApi.search(query);
        setResults(data);
      } catch {
        // fail silently
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (url: string) => {
    onClose();
    navigate(url);
  };

  const hasAnyResults =
    results.papers.length > 0 ||
    results.topics.length > 0 ||
    results.ideas.length > 0 ||
    results.projects.length > 0 ||
    results.faculty.length > 0;

  return (
    <div className="acr-modal-backdrop" onClick={onClose}>
      <div
        className="acr-modal"
        style={{ maxWidth: '640px', marginTop: '10vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Type to search papers, topics, ideas, projects, or faculty..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: 'var(--text-primary)',
            }}
          />
          <button onClick={onClose} className="acr-btn-ghost" style={{ padding: '0.25rem' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '1rem' }}>
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Searching academic repository...
            </div>
          )}

          {!isLoading && query.length >= 2 && !hasAnyResults && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No matches found across institutional research repository.
            </div>
          )}

          {!isLoading && hasAnyResults && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Papers */}
              {results.papers.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Research Papers
                  </div>
                  {results.papers.map((p) => (
                    <div
                      key={p._id}
                      onClick={() => handleSelect(`/research/papers?id=${p._id}`)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                      }}
                      className="acr-card-hover"
                    >
                      <FileText size={16} color="var(--primary-600)" />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{p.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.authors?.join(', ')} • {p.venue}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {results.projects.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Projects
                  </div>
                  {results.projects.map((pr) => (
                    <div
                      key={pr._id}
                      onClick={() => handleSelect(`/projects/${pr._id}`)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                      }}
                    >
                      <FolderGit2 size={16} color="#059669" />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{pr.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: {pr.code} • Status: {pr.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Faculty */}
              {results.faculty.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Faculty Mentors
                  </div>
                  {results.faculty.map((f) => (
                    <div
                      key={f._id}
                      onClick={() => handleSelect(`/faculty`)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                      }}
                    >
                      <GraduationCap size={16} color="#d97706" />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{f.userId?.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.designation} • {f.department}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
