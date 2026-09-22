import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { researchApi } from '../../services/api/researchApi';
import { IResearchDomain, IResearchPaper } from '../../types';
import {
  BookOpen,
  FolderGit2,
  GraduationCap,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  Award,
  ChevronRight,
  FileText,
  Activity,
  Target,
  Cpu,
  Clock,
  Settings,
  Scale,
  Search,
  X,
  Menu,
  ChevronDown,
  Lock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [domains, setDomains] = useState<IResearchDomain[]>([]);
  const [recentPapers, setRecentPapers] = useState<IResearchPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPortalOverlayOpen, setIsPortalOverlayOpen] = useState(false);
  const [portalSearchQuery, setPortalSearchQuery] = useState('');
  const [isNavigatingToLogin, setIsNavigatingToLogin] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleEnterPortal = (role?: string) => {
    setIsNavigatingToLogin(true);
    setTimeout(() => {
      setIsPortalOverlayOpen(false);
      setIsNavigatingToLogin(false);
      if (role) {
        navigate(`/sign-in?role=${role.toLowerCase()}`);
      } else {
        navigate('/sign-in');
      }
    }, 450);
  };

  const lifecycleStages = [
    { label: 'IDEA', desc: 'Concept submission & problem statement', icon: Target, status: 'Drafted' },
    { label: 'PROJECT', desc: 'Structured charter & deliverables', icon: FolderGit2, status: 'Approved' },
    { label: 'FACULTY MATCHING', desc: 'Institutional guide pairing', icon: GraduationCap, status: 'Matched' },
    { label: 'MILESTONES', desc: 'Sprint & deliverable schedule', icon: Layers, status: 'In Sprint' },
    { label: 'DEVELOPMENT', desc: 'Implementation & experimentation', icon: Cpu, status: 'Active' },
    { label: 'REVIEW', desc: 'Rubric criteria defense & audits', icon: CheckCircle2, status: 'Scheduled' },
    { label: 'AI ASSESSMENT', desc: 'Novelty & innovation score', icon: Sparkles, status: '94% Novel' },
    { label: 'IPR EVALUATION', desc: 'Patent & institutional filing', icon: ShieldCheck, status: 'Protected' },
  ];

  const iprTimeline = [
    { step: '01', title: 'PROJECT COMPLETED', desc: 'Final deliverables & documentation validated by guide', icon: FolderGit2 },
    { step: '02', title: 'AI ASSESSMENT', desc: 'Preliminary novelty screening against international prior art', icon: Sparkles },
    { step: '03', title: 'IPR REQUEST', desc: 'Campus inventor submits disclosure to Institutional IPR cell', icon: FileText },
    { step: '04', title: 'COORDINATOR REVIEW', desc: 'Formal review committee assesses patentability & commercialization', icon: Scale },
    { step: '05', title: 'FILING', desc: 'Provisional/complete application submitted to Patent Authority', icon: ShieldCheck },
  ];

  const portalRoles = [
    { id: 'student', title: 'Student Scholar', roleName: 'student', desc: 'Capstone projects, milestones, documents & team workspace', icon: Users },
    { id: 'faculty', title: 'Faculty Mentor', roleName: 'faculty', desc: 'Guidance requests, milestone reviews & approval audits', icon: GraduationCap },
    { id: 'research', title: 'Research Coordinator', roleName: 'admin', desc: 'Domains, taxonomy, publications & institutional analytics', icon: BookOpen },
    { id: 'ipr', title: 'IPR Coordinator', roleName: 'admin', desc: 'Invention disclosures, novelty screenings & patent filings', icon: ShieldCheck },
    { id: 'admin', title: 'Institutional Admin', roleName: 'admin', desc: 'System configuration, role management & audit logs', icon: Settings },
  ];

  const filteredRoles = portalRoles.filter((r) =>
    r.title.toLowerCase().includes(portalSearchQuery.toLowerCase()) ||
    r.desc.toLowerCase().includes(portalSearchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)', overflowX: 'hidden' }}>
      {/* =========================================================================
          1. Premium Navbar (Transparent Glass -> Dark Solid on Scroll)
          ========================================================================= */}
      <header
        style={{
          height: '68px',
          backgroundColor: scrolled ? 'rgba(7, 20, 38, 0.96)' : 'rgba(7, 20, 38, 0.45)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2.5rem',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Left: Brand Crest */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            textDecoration: 'none',
            color: '#FFFFFF',
          }}
        >
          <img src="/logo.svg" alt="ACRM Emblem" style={{ width: 34, height: 34, borderRadius: '8px' }} />
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF', lineHeight: 1.1, fontFamily: 'var(--font-display)' }}>
              ACRM
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.04em' }}>
              AUTOMATED CAMPUS RESEARCH MANAGEMENT
            </div>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2.25rem',
          }}
          className="desktop-nav"
        >
          <a
            href="#capabilities"
            style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#CBD5E1', transition: 'color var(--transition-fast)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-cyan-accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
          >
            Research
          </a>
          <a
            href="#lifecycle"
            style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#CBD5E1', transition: 'color var(--transition-fast)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-cyan-accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
          >
            Projects
          </a>
          <a
            href="#ai-innovation"
            style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#CBD5E1', transition: 'color var(--transition-fast)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-cyan-accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
          >
            Innovation
          </a>
          <a
            href="#roles"
            style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#CBD5E1', transition: 'color var(--transition-fast)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-cyan-accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
          >
            Faculty
          </a>
          <a
            href="#ipr-workflow"
            style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#CBD5E1', transition: 'color var(--transition-fast)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-cyan-accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
          >
            IPR
          </a>
        </nav>

        {/* Right: Outlined Sign In & Glowing Blue Sign Up */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            onClick={() => setIsPortalOverlayOpen(true)}
            className="acr-btn acr-btn-glass-dark acr-btn-sm"
            style={{ cursor: 'pointer' }}
          >
            Enter Portal
          </button>
          <Link
            to="/sign-in"
            className="acr-btn acr-btn-glass-dark acr-btn-sm"
            style={{ border: '1px solid rgba(59, 130, 246, 0.4)' }}
          >
            Sign In
          </Link>
          <Link
            to="/sign-up"
            className="acr-btn acr-btn-primary acr-btn-sm"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* =========================================================================
          2. Hero Section (Deep Navy Gradient #071426 -> #102A56)
          ========================================================================= */}
      <section
        style={{
          minHeight: '100vh',
          paddingTop: '120px',
          paddingBottom: '80px',
          background: 'linear-gradient(180deg, #071426 0%, #0A1C38 45%, #102A56 100%)',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Subtle Radial Blue & Cyan Glows */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            right: '5%',
            width: '550px',
            height: '550px',
            background: 'radial-gradient(circle, rgba(36, 87, 214, 0.28) 0%, rgba(7, 20, 38, 0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.14) 0%, rgba(7, 20, 38, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Technical Grid Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.15fr 1fr',
              gap: '4rem',
              alignItems: 'center',
            }}
          >
            {/* Left Hero Column */}
            <div>
              {/* Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.95rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(36, 87, 214, 0.18)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  color: '#93C5FD',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '1.5rem',
                }}
              >
                <Sparkles size={13} color="var(--color-cyan-accent)" />
                <span>RESEARCH • INNOVATION • COLLABORATION</span>
              </div>

              {/* Headline */}
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '3.4rem',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.12,
                  color: '#FFFFFF',
                  marginBottom: '1.35rem',
                }}
              >
                Transform Research <br />
                <span className="text-gradient-cyan">Into Innovation.</span>
              </h1>

              {/* Supporting Text */}
              <p
                style={{
                  fontSize: '1.05rem',
                  color: '#94A3B8',
                  lineHeight: 1.65,
                  marginBottom: '2.5rem',
                  maxWidth: '540px',
                }}
              >
                ACRM connects projects, people, research activities, innovation assessment and intellectual property workflows through one intelligent platform.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem', flexWrap: 'wrap' }}>
                <a
                  href="#capabilities"
                  className="acr-btn acr-btn-primary acr-btn-lg"
                  style={{ gap: '0.65rem' }}
                >
                  <span>Explore ACRM</span>
                  <ArrowRight size={17} />
                </a>

                <button
                  onClick={() => setIsPortalOverlayOpen(true)}
                  className="acr-btn acr-btn-glass-dark acr-btn-lg"
                  style={{ cursor: 'pointer' }}
                >
                  <span>Enter Portal</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div
                style={{
                  marginTop: '3rem',
                  paddingTop: '1.75rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem',
                  fontSize: '0.75rem',
                  color: '#94A3B8',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <CheckCircle2 size={16} color="var(--color-cyan-accent)" />
                  <span>Role-Based Governance</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <CheckCircle2 size={16} color="var(--color-cyan-accent)" />
                  <span>AI Novelty Scoring</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <CheckCircle2 size={16} color="var(--color-cyan-accent)" />
                  <span>Institutional IPR Filing</span>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Premium Floating Dashboard Visualization */}
            <div style={{ position: 'relative' }}>
              <div
                className="acr-glass-card"
                style={{
                  padding: '1.5rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Mockup Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '1rem',
                    marginBottom: '1.25rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontFamily: 'var(--font-mono)', marginLeft: '0.35rem' }}>
                      acrm.platform.v2 // live-workspace
                    </span>
                  </div>
                  <span className="acr-badge acr-badge-cyan" style={{ fontSize: '0.625rem' }}>
                    ENTERPRISE VERIFIED
                  </span>
                </div>

                {/* KPI Card: Active Projects */}
                <div
                  style={{
                    background: 'rgba(7, 20, 38, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.15rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      ACTIVE PROJECTS
                    </span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-cyan-accent)', fontFamily: 'var(--font-display)' }}>
                      87%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.25rem' }}>
                    Autonomous Edge-Inference Drone for Forest Fire Early Detection
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                    Faculty Guide: <strong>Dr. Robert Vance</strong> (Associate Professor)
                  </div>

                  {/* Sprint Progress Bar */}
                  <div style={{ marginTop: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#94A3B8', marginBottom: '0.3rem' }}>
                      <span>PROJECT PROGRESS</span>
                      <span style={{ color: '#FFFFFF', fontWeight: 600 }}>Milestone 4 / 5</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: '87%', height: '100%', background: 'linear-gradient(90deg, #2457D6 0%, #22D3EE 100%)', borderRadius: '9999px' }} />
                    </div>
                  </div>
                </div>

                {/* Dual Grid: AI Assessment & IPR Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div
                    style={{
                      background: 'rgba(7, 20, 38, 0.65)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#C084FC', marginBottom: '0.35rem' }}>
                      <Sparkles size={14} />
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase' }}>AI Assessment</span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-display)' }}>
                      94.2% <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 600 }}>High Novelty</span>
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                      0 Prior Art conflicts found
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(7, 20, 38, 0.65)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-cyan-accent)', marginBottom: '0.35rem' }}>
                      <ShieldCheck size={14} />
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase' }}>IPR Status</span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-display)' }}>
                      Provisional
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                      Filing dossier submitted
                    </div>
                  </div>
                </div>

                {/* Recent Activity Feed */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.65rem 0.95rem',
                    backgroundColor: 'rgba(34, 211, 238, 0.08)',
                    border: '1px solid rgba(34, 211, 238, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.75rem',
                    color: '#CBD5E1',
                  }}
                >
                  <Activity size={15} color="var(--color-cyan-accent)" style={{ flexShrink: 0 }} />
                  <span>Recent Activity: <strong>Deliverable #3: Edge Architecture</strong> approved 2h ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. Platform Highlights (Light Section #FFFFFF & #F4F7FB)
          ========================================================================= */}
      <section id="capabilities" style={{ padding: '6rem 2rem', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--color-royal-blue)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Enterprise Core Capabilities
            </span>
            <h2
              style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginTop: '0.4rem',
              }}
            >
              Integrated Digital Platform for Campus Research
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '650px', margin: '0.65rem auto 0', lineHeight: 1.6 }}>
              Standardize university research lifecycles through automated project oversight, AI novelty scoring, and institutional IPR governance.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.75rem',
            }}
          >
            {/* Card 1: Research Projects */}
            <div className="acr-feature-card">
              <div className="acr-feature-icon-box" style={{ background: 'rgba(36, 87, 214, 0.1)', color: 'var(--color-royal-blue)' }}>
                <FolderGit2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
                Research Projects
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Create, manage and track multiple research projects through their complete lifecycle.
              </p>
            </div>

            {/* Card 2: Faculty Collaboration */}
            <div className="acr-feature-card">
              <div className="acr-feature-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
                <GraduationCap size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
                Faculty Collaboration
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Connect projects with relevant faculty expertise and structured guidance.
              </p>
            </div>

            {/* Card 3: Innovation Assessment */}
            <div className="acr-feature-card">
              <div className="acr-feature-icon-box" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED' }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
                Innovation Assessment
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Evaluate project innovation and novelty using AI-assisted analysis.
              </p>
            </div>

            {/* Card 4: IPR Management */}
            <div className="acr-feature-card">
              <div className="acr-feature-icon-box" style={{ background: 'rgba(34, 211, 238, 0.15)', color: '#0284C7' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
                IPR Management
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Manage innovation evaluation and institutional IPR workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. Project Lifecycle (Dark Blue Section #0B1F3A)
          ========================================================================= */}
      <section id="lifecycle" style={{ padding: '6rem 2rem', backgroundColor: '#0B1F3A', color: '#FFFFFF', position: 'relative' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--color-cyan-accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Unified Governance Flow
            </span>
            <h2
              style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                color: '#FFFFFF',
                marginTop: '0.4rem',
              }}
            >
              The 8-Stage Research Lifecycle
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '1rem', maxWidth: '650px', margin: '0.65rem auto 0', lineHeight: 1.6 }}>
              From nascent idea formulation to patent protection, every milestone is systematically validated and recorded.
            </p>
          </div>

          {/* 8-Stage Pipeline with Glowing Connectors */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem',
            }}
          >
            {lifecycleStages.map((stage, idx) => {
              const IconComp = stage.icon;
              return (
                <div
                  key={stage.label}
                  style={{
                    background: '#071426',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    position: 'relative',
                    transition: 'all var(--transition-normal)',
                  }}
                  className="acr-pipeline-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-cyan-accent)', fontFamily: 'var(--font-mono)' }}>
                      STAGE 0{idx + 1}
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        background: 'rgba(34, 211, 238, 0.12)',
                        color: 'var(--color-cyan-accent)',
                        border: '1px solid rgba(34, 211, 238, 0.25)',
                      }}
                    >
                      {stage.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(36, 87, 214, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-cyan-accent)',
                      }}
                    >
                      <IconComp size={18} />
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.02em' }}>
                      {stage.label}
                    </h4>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: 1.5 }}>
                    {stage.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. Dashboard Preview (Light Gray Section #F4F7FB)
          ========================================================================= */}
      <section id="workspace" style={{ padding: '6rem 2rem', backgroundColor: '#F4F7FB', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--color-royal-blue)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Enterprise Control Plane
            </span>
            <h2
              style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginTop: '0.4rem',
              }}
            >
              Everything in One Research Workspace
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '650px', margin: '0.65rem auto 0', lineHeight: 1.6 }}>
              A single operational console providing deep visibility into student projects, faculty guidance, and institutional filings.
            </p>
          </div>

          {/* Realistic Dashboard Preview Container */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
            }}
          >
            {/* Top Bar */}
            <div
              style={{
                height: '48px',
                background: '#071426',
                color: '#FFFFFF',
                padding: '0 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>ACRM Workspace</span>
                <span style={{ color: '#64748B' }}>/</span>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Department of Computer Science & Engineering</span>
              </div>
              <span className="acr-badge acr-badge-primary" style={{ fontSize: '0.6875rem' }}>
                2026 Cohort Active
              </span>
            </div>

            {/* Dashboard Inner Grid */}
            <div style={{ padding: '2rem' }}>
              {/* Row 1: KPI Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
                <div className="acr-kpi-card">
                  <div className="acr-kpi-header">
                    <span className="acr-kpi-title">Active Projects</span>
                    <FolderGit2 size={16} color="var(--color-royal-blue)" />
                  </div>
                  <div className="acr-kpi-value">42</div>
                  <div className="acr-kpi-sub">38 in active sprint milestone</div>
                </div>

                <div className="acr-kpi-card">
                  <div className="acr-kpi-header">
                    <span className="acr-kpi-title">Faculty Guides</span>
                    <GraduationCap size={16} color="#059669" />
                  </div>
                  <div className="acr-kpi-value">28</div>
                  <div className="acr-kpi-sub">100% paired with research teams</div>
                </div>

                <div className="acr-kpi-card">
                  <div className="acr-kpi-header">
                    <span className="acr-kpi-title">AI Assessment</span>
                    <Sparkles size={16} color="#7C3AED" />
                  </div>
                  <div className="acr-kpi-value">91.4%</div>
                  <div className="acr-kpi-sub">Avg innovation novelty score</div>
                </div>

                <div className="acr-kpi-card">
                  <div className="acr-kpi-header">
                    <span className="acr-kpi-title">IPR Status</span>
                    <ShieldCheck size={16} color="#0284C7" />
                  </div>
                  <div className="acr-kpi-value">14</div>
                  <div className="acr-kpi-sub">Patents & disclosures filed</div>
                </div>
              </div>

              {/* Row 2: Tables & Activity */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
                <div className="acr-card">
                  <div className="acr-card-header">
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Active Research Projects</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-royal-blue)', fontWeight: 600 }}>Live Feed</span>
                  </div>
                  <div className="acr-table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table className="acr-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Project Title</th>
                          <th>Faculty Guide</th>
                          <th>Progress</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.75rem' }}>PRJ-108</td>
                          <td style={{ fontWeight: 600 }}>Multimodal Medical Diagnostics with Vision Transformers</td>
                          <td>Dr. Evelyn Clark</td>
                          <td>
                            <div style={{ width: 80, height: 6, background: '#E2E8F0', borderRadius: 9999 }}>
                              <div style={{ width: '85%', height: '100%', background: 'var(--color-royal-blue)', borderRadius: 9999 }} />
                            </div>
                          </td>
                          <td><span className="acr-badge acr-badge-success">Approved</span></td>
                        </tr>
                        <tr>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.75rem' }}>PRJ-112</td>
                          <td style={{ fontWeight: 600 }}>Decentralized Identity Verification for Academic Credentials</td>
                          <td>Prof. Alan Turing</td>
                          <td>
                            <div style={{ width: 80, height: 6, background: '#E2E8F0', borderRadius: 9999 }}>
                              <div style={{ width: '60%', height: '100%', background: 'var(--color-royal-blue)', borderRadius: 9999 }} />
                            </div>
                          </td>
                          <td><span className="acr-badge acr-badge-info">In Review</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="acr-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Upcoming Milestones</span>
                      <Clock size={15} color="var(--text-muted)" />
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Mid-Term Capstone Defense</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Due Oct 15 • 12 teams assigned</div>
                  </div>

                  <div className="acr-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Recent Institutional Activity</span>
                      <Activity size={15} color="var(--text-muted)" />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      • IPR Committee approved <strong>Patent PRJ-108</strong> for official filing
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. AI Innovation Section (Dark Navy #071426)
          ========================================================================= */}
      <section id="ai-innovation" style={{ padding: '6rem 2rem', backgroundColor: '#071426', color: '#FFFFFF' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.1fr',
              gap: '4.5rem',
              alignItems: 'center',
            }}
          >
            {/* Left AI Description */}
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--color-cyan-accent)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                AI-Assisted Assessment
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2.6rem',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  color: '#FFFFFF',
                  marginTop: '0.5rem',
                  marginBottom: '1.25rem',
                }}
              >
                From Research Idea <br />
                <span className="text-gradient-cyan">to Innovation Insight.</span>
              </h2>
              <p
                style={{
                  fontSize: '1rem',
                  color: '#94A3B8',
                  lineHeight: 1.65,
                  marginBottom: '2rem',
                }}
              >
                Understand the innovative potential of your research project through automated AI-assisted novelty screening against global scientific databases and patents.
              </p>

              <div
                style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: 'rgba(34, 211, 238, 0.08)',
                  border: '1px solid rgba(34, 211, 238, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  color: '#CBD5E1',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                  marginBottom: '2rem',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--color-cyan-accent)', marginBottom: '0.25rem' }}>
                  Preliminary AI-Assisted Assessment
                </div>
                Provides guidance on novelty, technical differentiation, and IPR potential prior to institutional committee submission.
              </div>

              <Link to="/sign-in" className="acr-btn acr-btn-primary acr-btn-lg">
                <span>Try Novelty Screening</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right Mock AI Assessment Console */}
            <div
              className="acr-glass-card"
              style={{
                padding: '2rem',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AUTOMATED NOVELTY REPORT
                </span>
                <span className="acr-badge acr-badge-cyan">AI EVALUATION v2</span>
              </div>

              {/* Score Display Ring */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem',
                  padding: '1.5rem',
                  background: 'rgba(7, 20, 38, 0.7)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    background: 'conic-gradient(#22D3EE 0% 84%, rgba(255, 255, 255, 0.1) 84% 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: '#071426',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF' }}>84</span>
                    <span style={{ fontSize: '0.625rem', color: '#94A3B8' }}>/ 100</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
                    Innovation Score
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#34D399', fontWeight: 600, marginTop: '0.2rem' }}>
                    High Commercial & Academic Novelty
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.35rem' }}>
                    Strong technical contribution identified across 4 novel algorithmic steps.
                  </div>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{ background: 'rgba(7, 20, 38, 0.5)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#94A3B8', fontWeight: 700 }}>NOVELTY</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-cyan-accent)', marginTop: '0.25rem' }}>HIGH</div>
                </div>
                <div style={{ background: 'rgba(7, 20, 38, 0.5)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#94A3B8', fontWeight: 700 }}>CONTRIBUTION</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34D399', marginTop: '0.25rem' }}>HIGH</div>
                </div>
                <div style={{ background: 'rgba(7, 20, 38, 0.5)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#94A3B8', fontWeight: 700 }}>IPR RELEVANCE</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FBBF24', marginTop: '0.25rem' }}>POTENTIAL</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. IPR Section (White Section #FFFFFF)
          ========================================================================= */}
      <section id="ipr-workflow" style={{ padding: '6rem 2rem', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--color-royal-blue)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Intellectual Property Pathway
            </span>
            <h2
              style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginTop: '0.4rem',
              }}
            >
              Streamlined Institutional IPR Workflow
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '650px', margin: '0.65rem auto 0', lineHeight: 1.6 }}>
              Protect and commercialize campus research through an audited multi-stage patent and copyright pipeline.
            </p>
          </div>

          {/* Connected Timeline */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '1.25rem',
              position: 'relative',
            }}
          >
            {iprTimeline.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.step}
                  className="acr-card"
                  style={{
                    padding: '1.5rem 1.25rem',
                    position: 'relative',
                    borderTop: '3px solid var(--color-royal-blue)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-royal-blue)' }}>
                      STEP {item.step}
                    </span>
                    <IconComp size={18} color="var(--color-royal-blue)" />
                  </div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. User Roles (Soft Background #F4F7FB)
          ========================================================================= */}
      <section id="roles" style={{ padding: '6rem 2rem', backgroundColor: '#F4F7FB', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--color-royal-blue)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Multi-Stakeholder Governance
            </span>
            <h2
              style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginTop: '0.4rem',
              }}
            >
              Built for Every Research Stakeholder
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '1.25rem',
            }}
          >
            <div className="acr-card" style={{ padding: '1.5rem 1.25rem' }}>
              <Users size={22} color="var(--color-royal-blue)" style={{ marginBottom: '0.85rem' }} />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.45rem' }}>
                STUDENTS
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Manage projects, teams, milestones, documents, research activities and achievements.
              </p>
            </div>

            <div className="acr-card" style={{ padding: '1.5rem 1.25rem' }}>
              <GraduationCap size={22} color="#059669" style={{ marginBottom: '0.85rem' }} />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.45rem' }}>
                FACULTY
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Guide projects, review milestones, provide feedback and approve project completion.
              </p>
            </div>

            <div className="acr-card" style={{ padding: '1.5rem 1.25rem' }}>
              <BookOpen size={22} color="#D97706" style={{ marginBottom: '0.85rem' }} />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.45rem' }}>
                RESEARCH COORDINATORS
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Monitor research activities, projects, domains and institutional analytics.
              </p>
            </div>

            <div className="acr-card" style={{ padding: '1.5rem 1.25rem' }}>
              <ShieldCheck size={22} color="#0284C7" style={{ marginBottom: '0.85rem' }} />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.45rem' }}>
                IPR COORDINATORS
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Review innovation submissions, manage IPR requests and track filing progress.
              </p>
            </div>

            <div className="acr-card" style={{ padding: '1.5rem 1.25rem' }}>
              <Settings size={22} color="#7C3AED" style={{ marginBottom: '0.85rem' }} />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.45rem' }}>
                ADMINISTRATORS
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Manage users, domains, projects, roles and system configuration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. High-Impact Call to Action Banner (Deep Royal Blue)
          ========================================================================= */}
      <section
        style={{
          padding: '5rem 2rem',
          background: 'linear-gradient(135deg, #071426 0%, #102A56 50%, #2457D6 100%)',
          color: '#FFFFFF',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
            Accelerate Your Institution's Research Impact.
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#CBD5E1', marginBottom: '2.25rem', lineHeight: 1.6 }}>
            Join premier research institutions using ACRM to organize capstones, empower faculty mentors, and safeguard inventions.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem' }}>
            <Link to="/sign-up" className="acr-btn acr-btn-primary acr-btn-lg">
              <span>Register Academic Account</span>
              <ArrowRight size={17} />
            </Link>
            <button
              onClick={() => setIsPortalOverlayOpen(true)}
              className="acr-btn acr-btn-glass-dark acr-btn-lg"
              style={{ cursor: 'pointer' }}
            >
              <span>Enter Portal</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. Institutional Dark Footer (#071426)
          ========================================================================= */}
      <footer
        style={{
          backgroundColor: '#071426',
          color: '#FFFFFF',
          padding: '4rem 2rem 2.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.8125rem',
        }}
      >
        <div
          className="container"
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '3rem',
            marginBottom: '3rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <img src="/logo.svg" alt="ACRM Logo" style={{ width: 32, height: 32 }} />
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>ACRM</div>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Automated Campus Research Management</div>
              </div>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.8125rem', lineHeight: 1.6, maxWidth: '360px' }}>
              Institutional enterprise research governance, faculty matching, AI innovation assessment, and intellectual property workflow management platform.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
              Platform
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#94A3B8' }}>
              <a href="#lifecycle" style={{ color: 'inherit' }}>Research Lifecycle</a>
              <a href="#capabilities" style={{ color: 'inherit' }}>Core Capabilities</a>
              <a href="#workspace" style={{ color: 'inherit' }}>Workspace Control Plane</a>
              <a href="#roles" style={{ color: 'inherit' }}>Stakeholder Roles</a>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
              Workflows
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#94A3B8' }}>
              <Link to="/sign-in" style={{ color: 'inherit' }}>Project Management</Link>
              <Link to="/sign-in" style={{ color: 'inherit' }}>Faculty Mentorship</Link>
              <Link to="/sign-in" style={{ color: 'inherit' }}>AI Novelty Screening</Link>
              <Link to="/sign-in" style={{ color: 'inherit' }}>IPR Disclosures</Link>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
              Access
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#94A3B8' }}>
              <Link to="/sign-in" style={{ color: 'inherit' }}>Institutional Sign In</Link>
              <Link to="/sign-up" style={{ color: 'inherit' }}>Create Account</Link>
              <Link to="/support" style={{ color: 'inherit' }}>Campus Helpdesk</Link>
            </div>
          </div>
        </div>

        <div
          className="container"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#64748B',
          }}
        >
          <div>
            © {new Date().getFullYear()} Automated Campus Research Management (ACRM). All rights reserved.
          </div>
          <div>Enterprise Security • Verifiable Audit Records</div>
        </div>
      </footer>

      {/* =========================================================================
          FULL-SCREEN PORTAL ACCESS OVERLAY ("ENTER PORTAL" TRANSITION)
          ========================================================================= */}
      {isPortalOverlayOpen && (
        <div className="acr-portal-overlay">
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              background: '#0B1F3A',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem',
              boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.8)',
              position: 'relative',
              color: '#FFFFFF',
              transform: isNavigatingToLogin ? 'translateX(100%)' : 'translateX(0)',
              transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsPortalOverlayOpen(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#94A3B8',
                width: 32,
                height: 32,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.3rem 0.85rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(34, 211, 238, 0.1)',
                  border: '1px solid rgba(34, 211, 238, 0.25)',
                  color: 'var(--color-cyan-accent)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  marginBottom: '0.85rem',
                }}
              >
                <Lock size={12} />
                <span>INSTITUTIONAL GATEWAY</span>
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-display)' }}>
                Access your workspace
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.35rem' }}>
                Select your academic stakeholder role or search your research portal
              </p>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: '1.75rem' }}>
              <input
                type="text"
                className="acr-input"
                placeholder="Search your ACRM workspace..."
                value={portalSearchQuery}
                onChange={(e) => setPortalSearchQuery(e.target.value)}
                style={{
                  backgroundColor: '#071426',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  paddingLeft: '2.5rem',
                  height: '46px',
                  fontSize: '0.9rem',
                }}
              />
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            </div>

            {/* Role Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto' }}>
              {filteredRoles.map((role) => {
                const IconComp = role.icon;
                return (
                  <div
                    key={role.id}
                    onClick={() => handleEnterPortal(role.roleName)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1.15rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(7, 20, 38, 0.65)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(36, 87, 214, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(7, 20, 38, 0.65)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(34, 211, 238, 0.12)',
                          color: 'var(--color-cyan-accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconComp size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>
                          {role.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                          {role.desc}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
              <button
                onClick={() => handleEnterPortal()}
                className="acr-btn acr-btn-primary"
                style={{ width: '100%', height: '44px', fontSize: '0.9rem' }}
              >
                <span>Enter Institutional Login</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
