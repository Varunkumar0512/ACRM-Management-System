import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import {
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  FolderGit2,
  Users,
  Lightbulb,
  Award,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';

export const SignInPage: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialRole === 'student') {
      setEmail('student@university.edu');
      setPassword('Password123!');
    } else if (initialRole === 'faculty') {
      setEmail('faculty@university.edu');
      setPassword('Password123!');
    } else if (initialRole === 'admin') {
      setEmail('admin@university.edu');
      setPassword('AdminSecret123!');
    }
  }, [initialRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both your institutional email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signIn({ email, password, rememberMe });
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Authentication failed. Please verify your credentials.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (role: 'student' | 'faculty' | 'admin') => {
    if (role === 'student') {
      setEmail('student@university.edu');
      setPassword('Password123!');
    } else if (role === 'faculty') {
      setEmail('faculty@university.edu');
      setPassword('Password123!');
    } else {
      setEmail('admin@university.edu');
      setPassword('AdminSecret123!');
    }
  };

  const lifecycleSteps = [
    { title: 'IDEA', desc: 'Concept & Problem Formulation', icon: Lightbulb, glow: '#3B82F6' },
    { title: 'PROJECT', desc: 'Structured Charter & Deliverables', icon: FolderGit2, glow: '#2457D6' },
    { title: 'COLLABORATION', desc: 'Faculty Guidance & Mentorship', icon: Users, glow: '#059669' },
    { title: 'INNOVATION', desc: 'AI Novelty Scoring & Analysis', icon: Sparkles, glow: '#22D3EE' },
    { title: 'IPR', desc: 'Institutional Patent Protection', icon: Award, glow: '#7C3AED' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        backgroundColor: '#F4F7FB',
      }}
      className="acr-login-container"
    >
      {/* =========================================================================
          LEFT 50%: DEEP NAVY #071426 WITH GLOWING RESEARCH LIFECYCLE
          ========================================================================= */}
      <div
        style={{
          backgroundColor: '#071426',
          color: '#FFFFFF',
          padding: '4.5rem 5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Subtle Ambient Lighting */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(36, 87, 214, 0.25) 0%, rgba(7, 20, 38, 0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '5%',
            right: '-5%',
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.12) 0%, rgba(7, 20, 38, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Brand Header */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none', color: '#FFFFFF' }}>
            <img src="/logo.svg" alt="ACRM Logo" style={{ width: 42, height: 42, borderRadius: '8px' }} />
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF', lineHeight: 1.1, fontFamily: 'var(--font-display)' }}>
                ACRM
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.04em' }}>
                AUTOMATED CAMPUS RESEARCH MANAGEMENT
              </div>
            </div>
          </Link>
        </div>

        {/* Center Content & Glowing Lifecycle Visual */}
        <div style={{ position: 'relative', zIndex: 2, margin: '3.5rem 0' }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.8rem',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#FFFFFF',
              marginBottom: '1rem',
            }}
          >
            Research. <br />
            Innovation. <br />
            <span className="text-gradient-cyan">Impact.</span>
          </div>

          <p
            style={{
              fontSize: '1rem',
              color: '#94A3B8',
              lineHeight: 1.6,
              maxWidth: '460px',
              marginBottom: '2.5rem',
            }}
          >
            One intelligent workspace for managing the complete research lifecycle.
          </p>

          {/* Research Lifecycle with Glowing Connection Lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '380px' }}>
            {lifecycleSteps.map((step, idx) => {
              const Icon = step.icon;
              const isLast = idx === lifecycleSteps.length - 1;
              return (
                <div key={step.title} style={{ position: 'relative' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.65rem 0.95rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(11, 31, 58, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(8px)',
                      boxShadow: `0 0 15px ${step.glow}15`,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '6px',
                        background: `${step.glow}25`,
                        color: step.glow,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.04em', color: '#FFFFFF' }}>
                        {step.title}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>
                        {step.desc}
                      </div>
                    </div>
                  </div>

                  {!isLast && (
                    <div
                      style={{
                        width: '2px',
                        height: '10px',
                        background: 'linear-gradient(to bottom, rgba(34, 211, 238, 0.6), rgba(36, 87, 214, 0.6))',
                        marginLeft: '23px',
                        boxShadow: '0 0 8px rgba(34, 211, 238, 0.5)',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'relative', zIndex: 2, fontSize: '0.75rem', color: '#64748B' }}>
          © {new Date().getFullYear()} Automated Campus Research Management (ACRM). All rights reserved.
        </div>
      </div>

      {/* =========================================================================
          RIGHT 50%: PREMIUM LIGHT BACKGROUND #F4F7FB & AUTHENTICATION PANEL
          ========================================================================= */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2.5rem',
          backgroundColor: '#F4F7FB',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '480px',
            padding: '3rem 2.75rem',
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 20px 45px -10px rgba(7, 20, 38, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E2E8F0',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.85rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#0B1220',
              }}
            >
              Welcome back
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.35rem' }}>
              Sign in to your ACRM workspace
            </p>
          </div>

          {errorMessage && (
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: '10px',
                color: 'var(--danger-text)',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                marginBottom: '1.5rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
            <div>
              <label className="acr-label" htmlFor="email-input">
                Email address
              </label>
              <input
                id="email-input"
                type="email"
                className="acr-input"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{ height: '46px', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label className="acr-label" htmlFor="password-input" style={{ marginBottom: 0 }}>
                  Password
                </label>
                <Link to="/forgot-password" style={{ color: 'var(--color-royal-blue)', fontSize: '0.75rem', fontWeight: 600 }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  className="acr-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ height: '46px', fontSize: '0.9rem', paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#475569' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--color-royal-blue)' }}
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="acr-btn acr-btn-primary acr-btn-submit-arrow"
              style={{
                width: '100%',
                height: '48px',
                fontSize: '0.9375rem',
                fontWeight: 700,
                justifyContent: 'center',
                borderRadius: '10px',
                letterSpacing: '0.04em',
              }}
            >
              <span>{isLoading ? 'SIGNING IN...' : 'SIGN IN'}</span>
              {!isLoading && <ArrowRight size={17} className="arrow-icon" />}
            </button>
          </form>

          {/* Development Quick Role Switcher */}
          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.35rem',
              borderTop: '1px solid #E2E8F0',
              fontSize: '0.75rem',
              textAlign: 'center',
            }}
          >
            <div style={{ color: '#64748B', marginBottom: '0.65rem', fontWeight: 600 }}>
              Quick Credentials (Development):
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => fillCredentials('student')}
                className="acr-btn acr-btn-secondary acr-btn-sm"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('faculty')}
                className="acr-btn acr-btn-secondary acr-btn-sm"
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="acr-btn acr-btn-secondary acr-btn-sm"
              >
                Admin
              </button>
            </div>
          </div>

          {/* New to ACRM? */}
          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.85rem', color: '#475569' }}>
            New to ACRM?{' '}
            <Link to="/sign-up" style={{ color: 'var(--color-royal-blue)', fontWeight: 700 }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
