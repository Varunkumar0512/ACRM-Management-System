import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  BookOpen,
  Lightbulb,
  FolderGit2,
  GraduationCap,
  X,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { searchApi } from '../../services/api/otherApis';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchCategory = 'ALL' | 'PAPERS' | 'PROJECTS' | 'TOPICS' | 'IDEAS' | 'FACULTY';

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('ALL');
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
      if (e.key === 'Escape' && isOpen) {
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
        // fail gracefully
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

  const popularSearches = [
    'Deep Learning',
    'Novelty Screening',
    'Autonomous Robotics',
    'IPR Patent Filing',
    'Edge Computing',
  ];

  return (
    <div
      className="acr-modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(7, 20, 38, 0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="acr-modal"
        style={{
          width: '100%',
          maxWidth: '680px',
          marginTop: '6vh',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <Search size={20} color="var(--color-royal-blue)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search papers, topics, ideas, projects, or faculty..."
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
              fontWeight: 500,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.2rem',
                fontSize: '0.75rem',
              }}
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="acr-btn-ghost"
            style={{ padding: '0.35rem', borderRadius: '6px', color: 'var(--text-muted)' }}
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-subtle)',
            overflowX: 'auto',
          }}
        >
          {(['ALL', 'PAPERS', 'PROJECTS', 'TOPICS', 'IDEAS', 'FACULTY'] as SearchCategory[]).map(
            (cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: isActive ? 'var(--color-royal-blue)' : 'var(--border-default)',
                    backgroundColor: isActive ? 'var(--color-royal-blue)' : 'var(--bg-surface)',
                    color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat.charAt(0) + cat.slice(1).toLowerCase()}
                </button>
              );
            }
          )}
        </div>

        {/* Results Body */}
        <div style={{ maxHeight: '440px', overflowY: 'auto', padding: '1rem 1.25rem' }}>
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  border: '3px solid var(--border-default)',
                  borderTopColor: 'var(--color-royal-blue)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 0.75rem',
                }}
              />
              Searching academic repository...
            </div>
          )}

          {!isLoading && query.length < 2 && (
            <div style={{ padding: '0.5rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                <TrendingUp size={13} color="var(--color-royal-blue)" />
                <span>Popular Institutional Searches</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.78rem',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <span>{term}</span>
                    <ArrowRight size={12} color="var(--text-muted)" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isLoading && query.length >= 2 && !hasAnyResults && (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                No matches found
              </div>
              <div style={{ fontSize: '0.8125rem' }}>
                No records matched "{query}". Try checking for spelling or searching for broader topics.
              </div>
            </div>
          )}

          {!isLoading && hasAnyResults && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Projects */}
              {(selectedCategory === 'ALL' || selectedCategory === 'PROJECTS') &&
                results.projects.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                      Projects ({results.projects.length})
                    </div>
                    {results.projects.map((pr) => (
                      <div
                        key={pr._id}
                        onClick={() => handleSelect(`/projects/${pr._id}`)}
                        style={{
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.85rem',
                          transition: 'background-color 0.15s ease',
                          marginBottom: '0.25rem',
                        }}
                        className="acr-search-item"
                      >
                        <div style={{ width: 32, height: 32, borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FolderGit2 size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pr.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            Code: <span style={{ fontFamily: 'var(--font-mono)' }}>{pr.code}</span> • Status: {pr.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {/* Research Papers */}
              {(selectedCategory === 'ALL' || selectedCategory === 'PAPERS') &&
                results.papers.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                      Research Papers ({results.papers.length})
                    </div>
                    {results.papers.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => handleSelect(`/research/papers?id=${p._id}`)}
                        style={{
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.85rem',
                          transition: 'background-color 0.15s ease',
                          marginBottom: '0.25rem',
                        }}
                        className="acr-search-item"
                      >
                        <div style={{ width: 32, height: 32, borderRadius: '6px', backgroundColor: 'rgba(36, 87, 214, 0.1)', color: 'var(--color-royal-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileText size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            {p.authors?.join(', ')} • {p.venue}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {/* Research Topics */}
              {(selectedCategory === 'ALL' || selectedCategory === 'TOPICS') &&
                results.topics.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                      Research Topics ({results.topics.length})
                    </div>
                    {results.topics.map((t) => (
                      <div
                        key={t._id}
                        onClick={() => handleSelect(`/research/topics?slug=${t.slug}`)}
                        style={{
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.85rem',
                          transition: 'background-color 0.15s ease',
                          marginBottom: '0.25rem',
                        }}
                        className="acr-search-item"
                      >
                        <div style={{ width: 32, height: 32, borderRadius: '6px', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <BookOpen size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {t.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            {t.description?.slice(0, 100)}...
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {/* Faculty */}
              {(selectedCategory === 'ALL' || selectedCategory === 'FACULTY') &&
                results.faculty.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                      Faculty Mentors ({results.faculty.length})
                    </div>
                    {results.faculty.map((f) => (
                      <div
                        key={f._id}
                        onClick={() => handleSelect(`/faculty`)}
                        style={{
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.85rem',
                          transition: 'background-color 0.15s ease',
                          marginBottom: '0.25rem',
                        }}
                        className="acr-search-item"
                      >
                        <div style={{ width: 32, height: 32, borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <GraduationCap size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {f.userId?.fullName}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            {f.designation} • Department of {f.department}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>
              <kbd style={{ background: 'var(--bg-surface)', padding: '0.1rem 0.35rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>ESC</kbd> to close
            </span>
            <span>
              <kbd style={{ background: 'var(--bg-surface)', padding: '0.1rem 0.35rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>↵</kbd> to select
            </span>
          </div>
          <span>ACRM Institutional Search</span>
        </div>
      </div>

      <style>{`
        .acr-search-item:hover {
          background-color: var(--bg-subtle);
        }
      `}</style>
    </div>
  );
};
