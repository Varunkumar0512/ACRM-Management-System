import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { researchApi } from '../../services/api/researchApi';
import { IResearchDomain, IResearchPaper } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../services/i18n/I18nContext';
import {
  FolderGit2,
  GraduationCap,
  Users,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Layers,
  ChevronRight,
  FileText,
  Target,
  X,
  Menu,
  Sun,
  Moon,
  Globe,
  Compass,
  Clock,
  BookOpen,
  Award,
  Database,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setTheme, activeTheme } = useTheme();
  const { language, setLanguage } = useTranslation();

  const [domains, setDomains] = useState<IResearchDomain[]>([]);
  const [recentPapers, setRecentPapers] = useState<IResearchPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Native scroll tracking for navbar background transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch real research domains and papers
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

  // Controlled reveal-on-scroll animation using native IntersectionObserver
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal-on-scroll');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [domains, recentPapers, isLoading]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F6F8FC',
        color: '#172033',
        overflowX: 'hidden',
      }}
    >
      {/* =========================================================================
          STICKY NAVIGATION BAR
          ========================================================================= */}
      <header
        style={{
          height: '66px',
          backgroundColor: scrolled ? 'rgba(16, 27, 53, 0.98)' : '#101B35',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          transition: 'all 0.25s ease',
        }}
      >
        {/* Brand Logo & Name */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            color: '#FFFFFF',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: '#4268E8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(66, 104, 232, 0.35)',
            }}
          >
            <Compass size={20} color="#FFFFFF" />
          </div>
          <div>
            <div
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
                lineHeight: 1.1,
              }}
            >
              ACRM
            </div>
            <div
              style={{
                fontSize: '0.6rem',
                color: '#94A3B8',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              CAMPUS RESEARCH MANAGEMENT
            </div>
          </div>
        </Link>

        {/* Center Desktop Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2.25rem',
          }}
          className="desktop-nav"
          aria-label="Main Navigation"
        >
          <a
            href="#home"
            style={{
              fontSize: '0.85rem',
              fontWeight: 500,
              color: '#CBD5E1',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
          >
            Home
          </a>
          <a
            href="#overview"
            style={{
              fontSize: '0.85rem',
              fontWeight: 500,
              color: '#CBD5E1',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
          >
            Features
          </a>
          <a
            href="#projects"
            style={{
              fontSize: '0.85rem',
              fontWeight: 500,
              color: '#CBD5E1',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
          >
            Projects
          </a>
          <a
            href="#knowledge"
            style={{
              fontSize: '0.85rem',
              fontWeight: 500,
              color: '#CBD5E1',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
          >
            Research
          </a>
          <a
            href="#workflow"
            style={{
              fontSize: '0.85rem',
              fontWeight: 500,
              color: '#CBD5E1',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
          >
            About
          </a>
        </nav>

        {/* Right Controls & CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Language Control */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
            className="acr-btn acr-btn-glass-dark acr-btn-sm"
            title="Switch Language"
            style={{ padding: '0.38rem 0.65rem' }}
          >
            <Globe size={14} />
            <span style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>{language}</span>
          </button>

          {/* Theme Control */}
          <button
            onClick={() => setTheme(activeTheme === 'dark' ? 'light' : 'dark')}
            className="acr-btn acr-btn-glass-dark acr-btn-sm"
            title="Toggle Theme"
            style={{ padding: '0.38rem 0.65rem' }}
          >
            {activeTheme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <Link
            to="/sign-in"
            className="acr-btn acr-btn-glass-dark acr-btn-sm"
            style={{ padding: '0.42rem 0.95rem' }}
          >
            Sign In
          </Link>

          <Link
            to="/sign-up"
            className="acr-btn acr-btn-primary acr-btn-sm"
            style={{
              backgroundColor: '#4268E8',
              borderColor: '#4268E8',
              padding: '0.42rem 1.1rem',
            }}
          >
            Get Started
          </Link>

          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="acr-btn acr-btn-glass-dark acr-btn-sm"
            style={{ display: 'none' }}
            id="acr-landing-mobile-toggle"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#101B35',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1.25rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            zIndex: 999,
          }}
        >
          <a href="#home" onClick={() => setMobileMenuOpen(false)} style={{ color: '#FFFFFF', fontSize: '0.9rem' }}>Home</a>
          <a href="#overview" onClick={() => setMobileMenuOpen(false)} style={{ color: '#FFFFFF', fontSize: '0.9rem' }}>Features</a>
          <a href="#projects" onClick={() => setMobileMenuOpen(false)} style={{ color: '#FFFFFF', fontSize: '0.9rem' }}>Projects</a>
          <a href="#knowledge" onClick={() => setMobileMenuOpen(false)} style={{ color: '#FFFFFF', fontSize: '0.9rem' }}>Research</a>
          <a href="#workflow" onClick={() => setMobileMenuOpen(false)} style={{ color: '#FFFFFF', fontSize: '0.9rem' }}>About</a>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Link to="/sign-in" className="acr-btn acr-btn-glass-dark" style={{ flex: 1, textAlign: 'center' }}>Sign In</Link>
            <Link to="/sign-up" className="acr-btn acr-btn-primary" style={{ flex: 1, textAlign: 'center', backgroundColor: '#4268E8' }}>Get Started</Link>
          </div>
        </div>
      )}

      {/* =========================================================================
          1. HERO SECTION (DEEP NAVY #101B35 WITH HIGH-FIDELITY DASHBOARD PREVIEW)
          ========================================================================= */}
      <section
        id="home"
        style={{
          backgroundColor: '#101B35',
          color: '#FFFFFF',
          padding: '5rem 2rem 5.5rem',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Subtle geometric circles */}
        <div
          style={{
            position: 'absolute',
            top: '-140px',
            right: '-140px',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(66, 104, 232, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-120px',
            left: '-120px',
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(54, 191, 250, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.05fr 1fr',
              gap: '3.5rem',
              alignItems: 'center',
            }}
            className="acr-hero-grid"
          >
            {/* Left Hero Column */}
            <div>
              {/* Eyebrow */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.3rem 0.85rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(66, 104, 232, 0.18)',
                  border: '1px solid rgba(66, 104, 232, 0.35)',
                  color: '#36BFFA',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '1.25rem',
                }}
              >
                <span>RESEARCH · COLLABORATION · INNOVATION</span>
              </div>

              {/* Headline */}
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '3rem',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                  color: '#FFFFFF',
                  marginBottom: '1.25rem',
                }}
              >
                Bring Every Research Idea Into Focus.
              </h1>

              {/* Supporting copy */}
              <p
                style={{
                  fontSize: '1.05rem',
                  color: '#CBD5E1',
                  lineHeight: 1.6,
                  marginBottom: '2.25rem',
                  maxWidth: '520px',
                }}
              >
                Manage projects, collaborate with faculty, organize research knowledge
                and track intellectual property workflows through one connected campus platform.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                <Link
                  to="/sign-up"
                  className="acr-btn acr-btn-primary acr-btn-lg"
                  style={{
                    backgroundColor: '#4268E8',
                    borderColor: '#4268E8',
                    borderRadius: '12px',
                    padding: '0.85rem 1.85rem',
                  }}
                >
                  <span>Get Started</span>
                  <ArrowRight size={16} />
                </Link>

                <a
                  href="#overview"
                  className="acr-btn acr-btn-glass-dark acr-btn-lg"
                  style={{ borderRadius: '12px', padding: '0.85rem 1.65rem' }}
                >
                  <span>Explore the Platform</span>
                </a>
              </div>

              {/* 3 Concise Capabilities Below Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.75rem',
                  flexWrap: 'wrap',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#36BFFA" />
                  <span style={{ fontSize: '0.825rem', color: '#E2E8F0', fontWeight: 600 }}>
                    Connected Research Projects
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#36BFFA" />
                  <span style={{ fontSize: '0.825rem', color: '#E2E8F0', fontWeight: 600 }}>
                    Faculty Review Workflows
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#36BFFA" />
                  <span style={{ fontSize: '0.825rem', color: '#E2E8F0', fontWeight: 600 }}>
                    Research & IP Tracking
                  </span>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Illustrative Product UI Preview */}
            <div>
              <div
                style={{
                  backgroundColor: '#172747',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(66, 104, 232, 0.2)',
                  overflow: 'hidden',
                }}
              >
                {/* Preview Window Header */}
                <div
                  style={{
                    backgroundColor: 'rgba(16, 27, 53, 0.85)',
                    padding: '0.85rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#EF4444' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10B981' }} />
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginLeft: '0.5rem', fontWeight: 600 }}>
                      workspace.acrm.edu / project-review
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: '#36BFFA',
                      backgroundColor: 'rgba(54, 191, 250, 0.15)',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Illustrative Product UI
                  </span>
                </div>

                {/* Dashboard Inner Body */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Realistic Research Project Card */}
                  <div
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '1.15rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#36BFFA',
                          backgroundColor: 'rgba(54, 191, 250, 0.12)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                        }}
                      >
                        AI & Edge Computing
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                        Ref: PRJ-2026-0842
                      </span>
                    </div>

                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.35rem' }}>
                      Autonomous Edge Sensor Network for Microclimate Inversion Modeling
                    </div>
                    <div style={{ fontSize: '0.775rem', color: '#94A3B8', lineHeight: 1.45 }}>
                      Team: 4 Scholars · Lead: Sophia Martinez · Faculty Advisor: Dr. Aris Thorne
                    </div>

                    {/* Milestone Progress Bar */}
                    <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.35rem' }}>
                        <span style={{ color: '#CBD5E1', fontWeight: 600 }}>Milestone Sprint 3 of 4: Empirical Data Synthesis</span>
                        <span style={{ color: '#36BFFA', fontWeight: 700 }}>75% Complete</span>
                      </div>
                      <div className="acr-progress-bar-track" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', height: 7 }}>
                        <div
                          className="acr-progress-bar-fill"
                          style={{
                            width: '75%',
                            background: 'linear-gradient(90deg, #4268E8 0%, #36BFFA 100%)',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Two-Column Mini Preview Cards: Faculty Review & Document Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    {/* Faculty Review Status */}
                    <div
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '0.95rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                        <GraduationCap size={15} color="#34D399" />
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34D399', textTransform: 'uppercase' }}>
                          Faculty Review
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FFFFFF' }}>
                        Checkpoint Approved
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                        Dr. Aris Thorne: "Dataset validation rubric passed with distinction."
                      </div>
                    </div>

                    {/* Research Document Info */}
                    <div
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '0.95rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                        <FileText size={15} color="#36BFFA" />
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#36BFFA', textTransform: 'uppercase' }}>
                          Deliverable
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FFFFFF' }}>
                        Dataset_Telemetry_v3.parquet
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                        Size: 18.4 MB · SHA-256 Verified
                      </div>
                    </div>
                  </div>

                  {/* IP Disclosure Workflow Status */}
                  <div
                    style={{
                      backgroundColor: 'rgba(66, 104, 232, 0.1)',
                      border: '1px solid rgba(66, 104, 232, 0.3)',
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '8px',
                          backgroundColor: 'rgba(66, 104, 232, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#36BFFA',
                        }}
                      >
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF' }}>
                          Invention Disclosure: Novelty Screening Complete
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                          Low prior-art conflict · Awaiting IPR Cell Coordinator Signoff
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: '#0D9970',
                        backgroundColor: 'rgba(13, 153, 112, 0.2)',
                        padding: '0.25rem 0.55rem',
                        borderRadius: '6px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      In Queue
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. PLATFORM OVERVIEW (BELOW-THE-FOLD SECTION 1)
          ========================================================================= */}
      <section
        id="overview"
        style={{
          padding: '5.5rem 2rem',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Section Header */}
          <div className="reveal-on-scroll" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#4268E8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              Platform Overview
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.35rem',
                fontWeight: 800,
                color: '#172033',
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
                marginBottom: '1rem',
              }}
            >
              Every Project. One Connected Workspace.
            </h2>
            <p style={{ fontSize: '1rem', color: '#66748B', lineHeight: 1.6 }}>
              Break down institutional silos. ACRM brings scholars, faculty advisors,
              department administrators, and the university IPR cell into a synchronized, transparent ecosystem.
            </p>
          </div>

          {/* 4 Feature Cards Grid */}
          <div className="acr-grid-4col-responsive">
            {/* Card 1 */}
            <div
              className="reveal-on-scroll reveal-delay-1"
              style={{
                backgroundColor: '#F6F8FC',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.85rem 1.6rem',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4268E8';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(66, 104, 232, 0.1)',
                  color: '#4268E8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <FolderGit2 size={22} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#172033', marginBottom: '0.5rem' }}>
                Project Governance
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#66748B', lineHeight: 1.55 }}>
                Manage problem charters, team allocations, sprint deliverables, and defense readiness with unified institutional standards.
              </p>
            </div>

            {/* Card 2 */}
            <div
              className="reveal-on-scroll reveal-delay-2"
              style={{
                backgroundColor: '#F6F8FC',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.85rem 1.6rem',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0D9970';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(13, 153, 112, 0.1)',
                  color: '#0D9970',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Users size={22} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#172033', marginBottom: '0.5rem' }}>
                Faculty Mentorship
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#66748B', lineHeight: 1.55 }}>
                Maintain continuous supervision trails. Conduct rubric evaluations, checkpoint signoffs, and transparent feedback directly inside the project stream.
              </p>
            </div>

            {/* Card 3 */}
            <div
              className="reveal-on-scroll reveal-delay-3"
              style={{
                backgroundColor: '#F6F8FC',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.85rem 1.6rem',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#36BFFA';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(54, 191, 250, 0.15)',
                  color: '#0891B2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <BookOpen size={22} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#172033', marginBottom: '0.5rem' }}>
                Knowledge Taxonomy
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#66748B', lineHeight: 1.55 }}>
                Organize university publications by domain hierarchies. Enable scholars to build directly upon previous findings and benchmark literature.
              </p>
            </div>

            {/* Card 4 */}
            <div
              className="reveal-on-scroll reveal-delay-4"
              style={{
                backgroundColor: '#F6F8FC',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.85rem 1.6rem',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#8B5CF6';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  color: '#8B5CF6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#172033', marginBottom: '0.5rem' }}>
                IPR Disclosure
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#66748B', lineHeight: 1.55 }}>
                Guide discoveries into university intellectual property. Route disclosures through automated novelty screening and institutional committee review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. RESEARCH PROJECT MANAGEMENT (BELOW-THE-FOLD SECTION 2)
          ========================================================================= */}
      <section
        id="projects"
        style={{
          padding: '5.5rem 2rem',
          backgroundColor: '#F6F8FC',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 1fr',
              gap: '4rem',
              alignItems: 'center',
            }}
            className="acr-hero-grid"
          >
            {/* Left: Product preview of Sprint Board & Deliverables */}
            <div className="reveal-on-scroll">
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: 'var(--shadow-md)',
                  padding: '1.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4268E8', textTransform: 'uppercase' }}>
                      Active Milestone Tracker
                    </span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#172033', marginTop: '0.2rem' }}>
                      Edge AI Drone Telemetry
                    </h4>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--success-bg)',
                      color: 'var(--success-solid)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      border: '1px solid var(--success-border)',
                    }}
                  >
                    On Track
                  </span>
                </div>

                {/* Milestone Checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      backgroundColor: '#F6F8FC',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <CheckCircle2 size={18} color="#0D9970" />
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#172033' }}>
                          Phase 1: Problem Formulation & Literature Survey
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#66748B' }}>12 Papers Indexed · Approved by Advisor</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#0D9970' }}>Completed</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      backgroundColor: '#F6F8FC',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <CheckCircle2 size={18} color="#0D9970" />
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#172033' }}>
                          Phase 2: Hardware Testbed & Calibration
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#66748B' }}>Sensor array mounted · Raw calibration verified</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#0D9970' }}>Completed</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      backgroundColor: 'rgba(66, 104, 232, 0.05)',
                      borderRadius: '10px',
                      border: '1px solid rgba(66, 104, 232, 0.3)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Clock size={18} color="#4268E8" />
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#172033' }}>
                          Phase 3: Real-Time Edge Inference Evaluation
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#4268E8' }}>Benchmarking latency and power draw</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4268E8' }}>In Progress</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Copy & Highlights */}
            <div className="reveal-on-scroll reveal-delay-2">
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#4268E8',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                Project Governance
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2.25rem',
                  fontWeight: 800,
                  color: '#172033',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.25,
                  marginBottom: '1rem',
                }}
              >
                Structured Governance from Proposal to Defense.
              </h2>
              <p style={{ fontSize: '0.975rem', color: '#66748B', lineHeight: 1.6, marginBottom: '2rem' }}>
                Eliminate ambiguity from student research. Define clear milestone sprints,
                track deliverable file uploads with cryptographic checksums, and monitor defense readiness automatically.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      backgroundColor: 'rgba(66, 104, 232, 0.1)',
                      color: '#4268E8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Target size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#172033' }}>
                      Milestone Sprints & Deliverables
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#66748B', marginTop: '0.15rem' }}>
                      Organize semester goals into structured sprints with designated submission windows.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      backgroundColor: 'rgba(13, 153, 112, 0.1)',
                      color: '#0D9970',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Layers size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#172033' }}>
                      Role-Based Access & Team Governance
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#66748B', marginTop: '0.15rem' }}>
                      Strict permissions ensure students, advisors, and reviewers see exactly what they need.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. FACULTY COLLABORATION AND REVIEWS (BELOW-THE-FOLD SECTION 3)
          ========================================================================= */}
      <section
        id="collaboration"
        style={{
          padding: '5.5rem 2rem',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.1fr',
              gap: '4rem',
              alignItems: 'center',
            }}
            className="acr-hero-grid"
          >
            {/* Left: Copy & Explanation */}
            <div className="reveal-on-scroll">
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#4268E8',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                Supervision & Reviews
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2.25rem',
                  fontWeight: 800,
                  color: '#172033',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.25,
                  marginBottom: '1rem',
                }}
              >
                Keep Faculty Feedback Close to the Work.
              </h2>
              <p style={{ fontSize: '0.975rem', color: '#66748B', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                Eliminate lost email threads and disjointed review files. Conduct rubric-based
                evaluations, milestone defense scoring, and constructive feedback directly within the connected project stream.
              </p>

              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: '#F6F8FC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                  <Award size={18} color="#4268E8" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#172033' }}>
                    Institutional Rubric Standards
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#66748B', lineHeight: 1.5 }}>
                  Evaluators grade on standardized institutional rubrics covering Technical Rigor, Literature Grounding, and Novelty Proofs.
                </div>
              </div>
            </div>

            {/* Right: Faculty Evaluation Card Preview */}
            <div className="reveal-on-scroll reveal-delay-2">
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: 'var(--shadow-md)',
                  padding: '1.75rem',
                }}
              >
                {/* Advisor Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '10px',
                      backgroundColor: '#101B35',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1rem',
                    }}
                  >
                    MT
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#172033' }}>
                      Prof. Marcus Thorne, Ph.D.
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#66748B' }}>
                      Department of Computer Science & Engineering
                    </div>
                  </div>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(13, 153, 112, 0.1)',
                      color: '#0D9970',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '9999px',
                    }}
                  >
                    Evaluator
                  </span>
                </div>

                {/* Rubric Score Matrix */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: '#F6F8FC', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: '#66748B', fontWeight: 600 }}>Technical Rigor</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4268E8', marginTop: '0.2rem' }}>9.2 / 10</div>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: '#F6F8FC', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: '#66748B', fontWeight: 600 }}>Experimental Design</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0D9970', marginTop: '0.2rem' }}>8.8 / 10</div>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: '#F6F8FC', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: '#66748B', fontWeight: 600 }}>Literature Grounding</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#36BFFA', marginTop: '0.2rem' }}>9.5 / 10</div>
                  </div>
                </div>

                {/* Inline Comment Preview */}
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: '#F6F8FC',
                    borderRadius: '10px',
                    borderLeft: '3px solid #4268E8',
                    fontSize: '0.8125rem',
                    color: '#172033',
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#4268E8' }}>Advisor Note: </span>
                  "The empirical convergence graph in Figure 4 demonstrates solid reproducible rigor. Make sure to record hardware wattage metrics before the Phase 4 defense."
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. RESEARCH KNOWLEDGE ORGANIZATION (BELOW-THE-FOLD SECTION 4)
          ========================================================================= */}
      <section
        id="knowledge"
        style={{
          padding: '5.5rem 2rem',
          backgroundColor: '#F6F8FC',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="reveal-on-scroll" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#4268E8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              Academic Knowledge
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.35rem',
                fontWeight: 800,
                color: '#172033',
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
                marginBottom: '1rem',
              }}
            >
              Make Research Knowledge Easier to Find.
            </h2>
            <p style={{ fontSize: '1rem', color: '#66748B', lineHeight: 1.6 }}>
              Curated taxonomy classifications help researchers explore past publications,
              examine institutional findings, and prevent duplicative discovery efforts.
            </p>
          </div>

          {/* Research Domains Horizontal Scroll / Grid */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#172033', marginBottom: '1rem' }}>
              Academic Domains & Subdisciplines
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
              }}
            >
              {domains.length > 0 ? (
                domains.slice(0, 4).map((domain, idx) => (
                  <div
                    key={domain._id || idx}
                    className={`reveal-on-scroll reveal-delay-${idx + 1}`}
                    style={{
                      padding: '1.25rem',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: 'var(--shadow-xs)',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#4268E8';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#4268E8', textTransform: 'uppercase' }}>
                        {domain.slug ? domain.slug.toUpperCase() : `DOM-0${idx + 1}`}
                      </span>
                      <Database size={14} color="#94A3B8" />
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#172033', marginBottom: '0.25rem' }}>
                      {domain.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#66748B' }}>
                      {domain.topicCount ?? 4} Specialized Topics
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="reveal-on-scroll reveal-delay-1" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#4268E8' }}>CS-AI</div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#172033', marginTop: '0.3rem' }}>Artificial Intelligence & ML</div>
                    <div style={{ fontSize: '0.75rem', color: '#66748B', marginTop: '0.2rem' }}>Deep learning, NLP, computer vision</div>
                  </div>
                  <div className="reveal-on-scroll reveal-delay-2" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0D9970' }}>EE-IOT</div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#172033', marginTop: '0.3rem' }}>Embedded & IoT Systems</div>
                    <div style={{ fontSize: '0.75rem', color: '#66748B', marginTop: '0.2rem' }}>Sensor architectures, edge compute</div>
                  </div>
                  <div className="reveal-on-scroll reveal-delay-3" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#36BFFA' }}>BIO-ENG</div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#172033', marginTop: '0.3rem' }}>Biomedical Engineering</div>
                    <div style={{ fontSize: '0.75rem', color: '#66748B', marginTop: '0.2rem' }}>Biosensors, clinical informatics</div>
                  </div>
                  <div className="reveal-on-scroll reveal-delay-4" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#8B5CF6' }}>ENV-SYS</div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#172033', marginTop: '0.3rem' }}>Environmental Modeling</div>
                    <div style={{ fontSize: '0.75rem', color: '#66748B', marginTop: '0.2rem' }}>Climate simulation, telemetry</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Featured Academic Papers from the Library */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#172033' }}>
                Featured Institutional Publications
              </div>
              <Link to="/sign-in" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4268E8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Explore Full Archive <ChevronRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {recentPapers.length > 0 ? (
                recentPapers.map((paper, idx) => (
                  <div
                    key={paper._id || idx}
                    className={`reveal-on-scroll reveal-delay-${(idx % 3) + 1}`}
                    style={{
                      padding: '1.5rem',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          backgroundColor: 'rgba(66, 104, 232, 0.1)',
                          color: '#4268E8',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                        }}
                      >
                        {paper.domainId?.name || paper.department || 'Research Paper'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                        {paper.publicationDate ? new Date(paper.publicationDate).getFullYear() : 2025}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#172033', marginBottom: '0.45rem', lineHeight: 1.4 }}>
                      {paper.title}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: '#66748B', marginBottom: '1rem', lineHeight: 1.45 }}>
                      Authors: {Array.isArray(paper.authors) ? paper.authors.join(', ') : 'Faculty & Scholar Cohort'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#66748B' }}>
                        Citations: {paper.citationsCount ?? 0}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#66748B' }}>
                        Status: Peer-Reviewed
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="reveal-on-scroll"
                  style={{
                    padding: '1.75rem',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px solid #E2E8F0',
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                  }}
                >
                  <BookOpen size={28} color="#94A3B8" style={{ margin: '0 auto 0.75rem' }} />
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#172033' }}>
                    Institutional Literature Repository Connected
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#66748B', marginTop: '0.25rem' }}>
                    Sign in to search cross-departmental indexed papers, patents, and datasets.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. INTELLECTUAL PROPERTY WORKFLOW (BELOW-THE-FOLD SECTION 5)
          ========================================================================= */}
      <section
        id="ipr"
        style={{
          padding: '5.5rem 2rem',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="reveal-on-scroll" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#4268E8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              Intellectual Property
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.35rem',
                fontWeight: 800,
                color: '#172033',
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
                marginBottom: '1rem',
              }}
            >
              Bring Clarity to the IP Disclosure Process.
            </h2>
            <p style={{ fontSize: '1rem', color: '#66748B', lineHeight: 1.6 }}>
              Guide inventions from lab bench to legal protection. Transparent disclosure pipelines
              keep inventors informed while university coordinators evaluate commercial potential and novelty claims.
            </p>
          </div>

          {/* 4-Stage Disclosure Workflow Diagram */}
          <div className="acr-grid-4col-responsive" style={{ marginBottom: '2.5rem' }}>
            <div
              className="reveal-on-scroll reveal-delay-1"
              style={{
                padding: '1.75rem',
                backgroundColor: '#F6F8FC',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#4268E8', marginBottom: '0.75rem' }}>
                STAGE 01
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#172033', marginBottom: '0.5rem' }}>
                Invention Disclosure
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#66748B', lineHeight: 1.5 }}>
                Team submits core claims, experimental proof, technical specifications, and inventor contribution shares.
              </p>
            </div>

            <div
              className="reveal-on-scroll reveal-delay-2"
              style={{
                padding: '1.75rem',
                backgroundColor: '#F6F8FC',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0D9970', marginBottom: '0.75rem' }}>
                STAGE 02
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#172033', marginBottom: '0.5rem' }}>
                Automated Novelty Check
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#66748B', lineHeight: 1.5 }}>
                Exploratory algorithm indexes literature and global patent records to detect preliminary prior art overlap.
              </p>
            </div>

            <div
              className="reveal-on-scroll reveal-delay-3"
              style={{
                padding: '1.75rem',
                backgroundColor: '#F6F8FC',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#36BFFA', marginBottom: '0.75rem' }}>
                STAGE 03
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#172033', marginBottom: '0.5rem' }}>
                IPR Committee Review
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#66748B', lineHeight: 1.5 }}>
                Campus intellectual property coordinators evaluate commercial viability, institutional funding, and patent eligibility.
              </p>
            </div>

            <div
              className="reveal-on-scroll reveal-delay-4"
              style={{
                padding: '1.75rem',
                backgroundColor: '#F6F8FC',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8B5CF6', marginBottom: '0.75rem' }}>
                STAGE 04
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#172033', marginBottom: '0.5rem' }}>
                Patent Docketing
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#66748B', lineHeight: 1.5 }}>
                Approved disclosures are transitioned to university counsel for provisional drafting and jurisdiction filing.
              </p>
            </div>
          </div>

          {/* Institutional Advisory Notice */}
          <div
            className="reveal-on-scroll"
            style={{
              padding: '1rem 1.35rem',
              backgroundColor: '#F6F8FC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
            }}
          >
            <ShieldCheck size={20} color="#4268E8" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.8125rem', color: '#66748B', lineHeight: 1.5 }}>
              <strong style={{ color: '#172033' }}>Institutional Notice: </strong>
              Automated novelty checks assist researchers in preliminary literature discovery and do not substitute for formal legal patentability opinions conducted by certified patent attorneys.
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. HOW ACRM WORKS (BELOW-THE-FOLD SECTION 6)
          ========================================================================= */}
      <section
        id="workflow"
        style={{
          padding: '5.5rem 2rem',
          backgroundColor: '#F6F8FC',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="reveal-on-scroll" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#4268E8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              End-to-End Workflow
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.35rem',
                fontWeight: 800,
                color: '#172033',
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
                marginBottom: '1rem',
              }}
            >
              A Transparent Path from Hypothesis to Publication.
            </h2>
            <p style={{ fontSize: '1rem', color: '#66748B', lineHeight: 1.6 }}>
              Five standardized milestones ensure institutional research maintains the highest caliber of rigor from initial inception to institutional archive.
            </p>
          </div>

          {/* 5-Step Pipeline Grid */}
          <div className="acr-grid-5col-responsive">
            <div
              className="reveal-on-scroll reveal-delay-1"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '1.5rem',
                border: '1px solid #E2E8F0',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4268E8', marginBottom: '0.65rem' }}>
                01
              </div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#172033', marginBottom: '0.35rem' }}>
                Problem Charter
              </h4>
              <p style={{ fontSize: '0.775rem', color: '#66748B', lineHeight: 1.45 }}>
                Define research questions, hypotheses, team members, and expected semester deliverables.
              </p>
            </div>

            <div
              className="reveal-on-scroll reveal-delay-2"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '1.5rem',
                border: '1px solid #E2E8F0',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4268E8', marginBottom: '0.65rem' }}>
                02
              </div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#172033', marginBottom: '0.35rem' }}>
                Advisor Pairing
              </h4>
              <p style={{ fontSize: '0.775rem', color: '#66748B', lineHeight: 1.45 }}>
                Department chairs assign qualified faculty mentors based on specialization and capacity.
              </p>
            </div>

            <div
              className="reveal-on-scroll reveal-delay-3"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '1.5rem',
                border: '1px solid #E2E8F0',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4268E8', marginBottom: '0.65rem' }}>
                03
              </div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#172033', marginBottom: '0.35rem' }}>
                Milestone Sprints
              </h4>
              <p style={{ fontSize: '0.775rem', color: '#66748B', lineHeight: 1.45 }}>
                Teams submit literature surveys, code repositories, datasets, and prototype benchmarks.
              </p>
            </div>

            <div
              className="reveal-on-scroll reveal-delay-4"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '1.5rem',
                border: '1px solid #E2E8F0',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4268E8', marginBottom: '0.65rem' }}>
                04
              </div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#172033', marginBottom: '0.35rem' }}>
                Defense Evaluation
              </h4>
              <p style={{ fontSize: '0.775rem', color: '#66748B', lineHeight: 1.45 }}>
                Faculty evaluators conduct rubric assessments, examine rigor, and issue milestone signoffs.
              </p>
            </div>

            <div
              className="reveal-on-scroll reveal-delay-5"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '1.5rem',
                border: '1px solid #E2E8F0',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4268E8', marginBottom: '0.65rem' }}>
                05
              </div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#172033', marginBottom: '0.35rem' }}>
                Archive & Disclosure
              </h4>
              <p style={{ fontSize: '0.775rem', color: '#66748B', lineHeight: 1.45 }}>
                Completed projects submit invention disclosures to the IPR cell and publish to the campus library.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FINAL CALL TO ACTION (BELOW-THE-FOLD SECTION 7)
          ========================================================================= */}
      <section
        style={{
          padding: '6rem 2rem',
          backgroundColor: '#101B35',
          color: '#FFFFFF',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(66, 104, 232, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container reveal-on-scroll" style={{ maxWidth: '780px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#36BFFA',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            Campus Innovation
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.6rem',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              marginBottom: '1.25rem',
            }}
          >
            Elevate Your University's Research Ecosystem.
          </h2>
          <p
            style={{
              fontSize: '1.05rem',
              color: '#CBD5E1',
              lineHeight: 1.6,
              marginBottom: '2.5rem',
            }}
          >
            Empower student researchers and faculty advisors with the digital workspace
            engineered specifically for rigorous academic discovery and intellectual property stewardship.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/sign-up"
              className="acr-btn acr-btn-primary acr-btn-lg"
              style={{
                backgroundColor: '#4268E8',
                borderColor: '#4268E8',
                borderRadius: '12px',
                padding: '0.85rem 2rem',
              }}
            >
              <span>Get Started</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/sign-in"
              className="acr-btn acr-btn-glass-dark acr-btn-lg"
              style={{ borderRadius: '12px', padding: '0.85rem 1.85rem' }}
            >
              <span>Sign in to ACRM</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. PROFESSIONAL FOOTER (BELOW-THE-FOLD SECTION 8)
          ========================================================================= */}
      <footer
        style={{
          backgroundColor: '#0A1224',
          color: '#94A3B8',
          padding: '4.5rem 2rem 2.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="acr-footer-grid" style={{ marginBottom: '3.5rem' }}>
            {/* Col 1: Brand & Overview */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: '#4268E8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Compass size={18} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
                    ACRM
                  </div>
                  <div style={{ fontSize: '0.55rem', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.04em' }}>
                    AUTOMATED CAMPUS RESEARCH MANAGEMENT
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#66748B', lineHeight: 1.6, maxWidth: '320px' }}>
                Enterprise campus platform synchronizing project charters, faculty mentorship,
                academic publications, and intellectual property disclosures.
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(13, 153, 112, 0.15)',
                  color: '#34D399',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  marginTop: '1.25rem',
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981' }} />
                <span>Systems Operational · Enterprise Tier</span>
              </div>
            </div>

            {/* Col 2: Platform Links */}
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Platform
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <li><a href="#overview" style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>Platform Overview</a></li>
                <li><a href="#projects" style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>Project Governance</a></li>
                <li><a href="#collaboration" style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>Faculty Reviews</a></li>
                <li><a href="#knowledge" style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>Knowledge Library</a></li>
                <li><a href="#ipr" style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>IPR Disclosures</a></li>
              </ul>
            </div>

            {/* Col 3: Research Governance */}
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Institutional
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <li><a href="#workflow" style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>Workflow Pipeline</a></li>
                <li><Link to="/sign-in" style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>Scholar Portal</Link></li>
                <li><Link to="/sign-in" style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>Faculty Workspace</Link></li>
                <li><Link to="/sign-in" style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>IPR Cell Committee</Link></li>
              </ul>
            </div>

            {/* Col 4: Compliance & Access */}
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Access & Security
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <li><Link to="/sign-in" style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>Institutional Sign In</Link></li>
                <li><Link to="/sign-up" style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>Create Scholar Account</Link></li>
                <li><Link to="/forgot-password" style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>Credential Recovery</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Legal Sub-Footer */}
          <div
            style={{
              paddingTop: '2rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              fontSize: '0.75rem',
              color: '#66748B',
            }}
          >
            <div>
              © 2026 Automated Campus Research Management (ACRM). All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span>Institutional Privacy Standards</span>
              <span>Audit Logging Active</span>
              <span>TLS 1.3 Encryption</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
