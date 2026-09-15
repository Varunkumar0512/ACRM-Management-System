import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { researchApi } from '../../services/api/researchApi';
import { IResearchDomain, IResearchPaper } from '../../types';
import {
  BookOpen,
  FolderGit2,
  GraduationCap,
  Users,
  Archive,
  Award,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [domains, setDomains] = useState<IResearchDomain[]>([]);
  const [recentPapers, setRecentPapers] = useState<IResearchPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      researchApi.getDomains().catch(() => []),
      researchApi.getPapers({ limit: 4 }).catch(() => ({ papers: [] })),
    ]).then(([domainsData, papersData]) => {
      setDomains(domainsData || []);
      setRecentPapers(papersData.papers || []);
      setIsLoading(false);
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
      {/* Public Top Navigation */}
      <header
        style={{
          height: '68px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none', color: 'inherit' }}>
            <img src="/logo.svg" alt="ACRM Crest" style={{ width: 34, height: 34 }} />
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                ACRM
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Automated Campus Research Management
              </div>
            </div>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
            <a href="#domains" style={{ color: 'var(--text-secondary)' }}>Research Domains</a>
            <a href="#papers" style={{ color: 'var(--text-secondary)' }}>Recent Publications</a>
            <a href="#capabilities" style={{ color: 'var(--text-secondary)' }}>Platform Capabilities</a>
            <a href="#governance" style={{ color: 'var(--text-secondary)' }}>Academic Governance</a>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/sign-in" className="acr-btn acr-btn-secondary acr-btn-sm">
            SIGN IN
          </Link>
          <Link to="/sign-up" className="acr-btn acr-btn-primary acr-btn-sm">
            SIGN UP
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          padding: '4.5rem 2rem 4rem',
        }}
      >
        <div className="container" style={{ maxWidth: '1080px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--primary-50)',
              border: '1px solid var(--primary-100)',
              color: 'var(--primary-700)',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1.5rem',
            }}
          >
            University Research Ecosystem
          </div>

          <h1
            style={{
              fontSize: '2.75rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: 'var(--text-primary)',
              marginBottom: '1rem',
            }}
          >
            AUTOMATED CAMPUS RESEARCH MANAGEMENT
          </h1>

          <p
            style={{
              fontSize: '1.25rem',
              fontWeight: 500,
              color: 'var(--primary-600)',
              marginBottom: '1.5rem',
            }}
          >
            Intelligent Research & Knowledge Discovery Platform
          </p>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              maxWidth: '780px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.6,
            }}
          >
            A centralized academic platform for discovering research, managing student projects,
            connecting students with faculty mentors, reviewing project progress, and maintaining
            institutional research knowledge.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/sign-up" className="acr-btn acr-btn-primary acr-btn-lg">
              <span>Register Academic Account</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/sign-in" className="acr-btn acr-btn-secondary acr-btn-lg">
              <span>Enter Institutional Portal</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem',
              marginTop: '4rem',
              paddingTop: '2.5rem',
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'left',
            }}
          >
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>18+</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Organized Research Domains</div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>100%</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Faculty-Guided Milestones</div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Zero-Trust</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Enterprise Security & RBAC</div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Audited</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Evaluation & Rubric Scoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Institutional Capabilities */}
      <section id="capabilities" style={{ padding: '4.5rem 2rem', backgroundColor: 'var(--bg-page)' }}>
        <div className="container" style={{ maxWidth: '1120px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Institutional Capabilities
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              Standardized lifecycles uniting undergraduate researchers, postgraduates, faculty mentors, and academic administrators.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <div className="acr-card acr-card-body">
              <BookOpen size={24} color="var(--primary-600)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' }}>Research Discovery</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Explore 18+ university research domains, taxonomy classifications, and state-of-the-art publications with verifiable citations and DOI references.
              </p>
            </div>

            <div className="acr-card acr-card-body">
              <FolderGit2 size={24} color="var(--primary-600)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' }}>Project Management</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Comprehensive multi-step proposal submission, automated progress calculation from validated milestones, and structured deliverable tracking.
              </p>
            </div>

            <div className="acr-card acr-card-body">
              <GraduationCap size={24} color="var(--primary-600)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' }}>Faculty Mentorship</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Structured guidance request workflows pairing student groups with Associate Professors and Co-Guides respecting departmental capacity rules.
              </p>
            </div>

            <div className="acr-card acr-card-body">
              <Users size={24} color="var(--primary-600)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' }}>Academic Collaboration</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Inter-departmental student team formation, contextual milestone discussions, and secure collaborative document versioning.
              </p>
            </div>

            <div className="acr-card acr-card-body">
              <Award size={24} color="var(--primary-600)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' }}>Rubric Project Reviews</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Rigorous evaluation system recording criteria scores, qualitative recommendations, and formal approval decisions with immutable audit trails.
              </p>
            </div>

            <div className="acr-card acr-card-body">
              <Archive size={24} color="var(--primary-600)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' }}>Institutional Repository</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Permanent preservation of completed research outputs, design documents, and project presentations across successive academic cohorts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Research Domains Spotlight */}
      <section id="domains" style={{ padding: '4.5rem 2rem', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ maxWidth: '1120px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Academic Research Domains
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
                Systematized research areas supported across engineering, computational sciences, and sustainable technologies.
              </p>
            </div>
            <Link to="/sign-in" className="acr-btn acr-btn-ghost acr-btn-sm">
              Explore All 18 Domains <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {domains.slice(0, 8).map((d) => (
              <div
                key={d._id}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-subtle)',
                }}
              >
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {d.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', gap: '0.75rem' }}>
                  <span>{d.paperCount || 0} Papers</span>
                  <span>•</span>
                  <span>{d.ideaCount || 0} Project Ideas</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {d.description.length > 90 ? `${d.description.slice(0, 90)}...` : d.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Publications Spotlight */}
      <section id="papers" style={{ padding: '4.5rem 2rem', backgroundColor: 'var(--bg-page)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ maxWidth: '1120px' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Recent Institutional Publications
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              Peer-reviewed contributions authored by faculty investigators and student research scholars.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentPapers.map((paper) => (
              <div key={paper._id} className="acr-card acr-card-body">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <span className="acr-badge acr-badge-info" style={{ marginBottom: '0.5rem' }}>
                      {paper.domainId?.name || paper.department}
                    </span>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                      {paper.title}
                    </h3>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Authors: <strong>{paper.authors?.join(', ')}</strong> • Venue: <em>{paper.venue}</em>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                      {paper.abstract}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Citations: {paper.citationsCount}</span>
                      <span>•</span>
                      <span>Published: {new Date(paper.publicationDate).toLocaleDateString()}</span>
                      {paper.doi && (
                        <>
                          <span>•</span>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>DOI: {paper.doi}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer
        style={{
          marginTop: 'auto',
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          padding: '3rem 2rem 2rem',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: '1120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              ACRM — Automated Campus Research Management
            </div>
            <div>Institutional Academic Research, Capstone & IPR Innovation Platform</div>
          </div>

          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link to="/sign-in" style={{ color: 'var(--text-secondary)' }}>Sign In</Link>
            <Link to="/sign-up" style={{ color: 'var(--text-secondary)' }}>Sign Up</Link>
            <Link to="/support" style={{ color: 'var(--text-secondary)' }}>Campus Helpdesk</Link>
          </div>
        </div>
        <div className="container" style={{ maxWidth: '1120px', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center', fontSize: '0.75rem' }}>
          © {new Date().getFullYear()} Automated Campus Research Management (ACRM). All rights reserved. Built for institutional research governance.
        </div>
      </footer>
    </div>
  );
};
