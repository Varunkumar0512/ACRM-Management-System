import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Eye,
  EyeOff,
  AlertCircle,
  FolderGit2,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';

export const SignInPage: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'FACULTY' | 'ADMIN'>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Quick fill demo credentials for seamless testing of each role
  const handleQuickFill = (role: 'STUDENT' | 'FACULTY' | 'ADMIN') => {
    setSelectedRole(role);
    if (role === 'STUDENT') {
      setEmail('student@university.edu');
      setPassword('Password123!');
    } else if (role === 'FACULTY') {
      setEmail('faculty@university.edu');
      setPassword('Password123!');
    } else {
      setEmail('admin@university.edu');
      setPassword('AdminSecret123!');
    }
    setEmailError(null);
    setPasswordError(null);
    setErrorMessage(null);
  };

  // Check if Google OAuth client ID is configured and functional
  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
  const isGoogleAuthConfigured = Boolean(
    googleClientId &&
    googleClientId !== '' &&
    !googleClientId.includes('your_google_client_id') &&
    !googleClientId.includes('your-google-client-id')
  );

  const validateForm = (): boolean => {
    let valid = true;
    setEmailError(null);
    setPasswordError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Enter your institutional email address.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Enter a valid institutional email address.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Enter your password to continue.');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Backend validates credentials and fetches the user's assigned role from database
      const authResult = await signIn({ email: email.trim(), password, rememberMe });
      
      // Determine redirect strictly using the authenticated user's role returned by backend
      const backendRole = (authResult?.user?.role || '').toUpperCase();
      if (backendRole === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (backendRole === 'FACULTY') {
        navigate('/faculty/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err: any) {
      const serverMsg = err.response?.data?.error?.message;
      setErrorMessage(
        serverMsg || 'Unable to sign in. Check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle successful Google authentication redirect strictly based on backend-verified role
  const handleGoogleSuccess = (authData?: any) => {
    const backendRole = (authData?.user?.role || '').toUpperCase();
    if (backendRole === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    } else if (backendRole === 'FACULTY') {
      navigate('/faculty/dashboard', { replace: true });
    } else {
      navigate('/student/dashboard', { replace: true });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1.05fr 1.15fr',
        backgroundColor: '#F6F8FC',
      }}
      className="acr-auth-layout"
    >
      {/* =========================================================================
          LEFT BRAND PANEL: DEEP NAVY #101B35 WITH RESEARCH-NETWORK LINEWORK
          ========================================================================= */}
      <aside
        style={{
          backgroundColor: '#101B35',
          color: '#FFFFFF',
          padding: '3.75rem 4rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        }}
        className="acr-auth-left-panel"
        aria-label="ACRM Platform Information"
      >
        {/* Subtle geometric research-network background illustration */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            opacity: 0.16,
            pointerEvents: 'none',
          }}
          viewBox="0 0 600 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Coordinate circles */}
          <circle cx="480" cy="180" r="140" stroke="#36BFFA" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="480" cy="180" r="260" stroke="#4268E8" strokeWidth="1" strokeDasharray="3 8" />
          <circle cx="120" cy="680" r="220" stroke="#4268E8" strokeWidth="1" strokeDasharray="4 6" />

          {/* Research network nodes & connecting lines */}
          <line x1="160" y1="120" x2="320" y2="210" stroke="#4268E8" strokeWidth="1.2" />
          <line x1="320" y1="210" x2="480" y2="180" stroke="#36BFFA" strokeWidth="1.2" />
          <line x1="320" y1="210" x2="260" y2="380" stroke="#4268E8" strokeWidth="1" />
          <line x1="260" y1="380" x2="440" y2="460" stroke="#36BFFA" strokeWidth="1" />
          <line x1="440" y1="460" x2="380" y2="620" stroke="#4268E8" strokeWidth="1.2" />
          <line x1="260" y1="380" x2="160" y2="520" stroke="#36BFFA" strokeWidth="1" />
          <line x1="160" y1="520" x2="380" y2="620" stroke="#4268E8" strokeWidth="1" />

          <circle cx="160" cy="120" r="4" fill="#36BFFA" />
          <circle cx="320" cy="210" r="5" fill="#4268E8" />
          <circle cx="480" cy="180" r="6" fill="#36BFFA" />
          <circle cx="260" cy="380" r="5" fill="#4268E8" />
          <circle cx="440" cy="460" r="4" fill="#36BFFA" />
          <circle cx="160" cy="520" r="4" fill="#4268E8" />
          <circle cx="380" cy="620" r="5" fill="#36BFFA" />
        </svg>

        {/* Ambient top & bottom gradient accents */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(66, 104, 232, 0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-120px',
            left: '-120px',
            width: '360px',
            height: '360px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(54, 191, 250, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Brand Header */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.85rem',
              textDecoration: 'none',
              color: '#FFFFFF',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                backgroundColor: '#4268E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(66, 104, 232, 0.35)',
              }}
            >
              <Compass size={22} color="#FFFFFF" />
            </div>
            <div>
              <div
                style={{
                  fontSize: '1.25rem',
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
                  fontSize: '0.625rem',
                  color: '#94A3B8',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginTop: '0.15rem',
                }}
              >
                AUTOMATED CAMPUS RESEARCH MANAGEMENT
              </div>
            </div>
          </Link>
        </div>

        {/* Brand Message and Value Proposition */}
        <div style={{ position: 'relative', zIndex: 2, margin: '2.5rem 0' }}>
          {/* Eyebrow */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.28rem 0.8rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(66, 104, 232, 0.18)',
              border: '1px solid rgba(66, 104, 232, 0.32)',
              color: '#36BFFA',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '1.15rem',
            }}
          >
            THE RESEARCH WORKSPACE
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.15rem',
              fontWeight: 800,
              lineHeight: 1.25,
              color: '#FFFFFF',
              letterSpacing: '-0.025em',
              marginBottom: '1rem',
              maxWidth: '480px',
            }}
          >
            Research begins with an idea. Progress happens together.
          </h1>

          {/* Supporting text */}
          <p
            style={{
              fontSize: '0.9375rem',
              color: '#CBD5E1',
              lineHeight: 1.6,
              maxWidth: '460px',
              marginBottom: '2.25rem',
            }}
          >
            One connected workspace for research projects, faculty collaboration,
            academic knowledge and intellectual property workflows.
          </p>

          {/* 3 Compact Feature Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '460px' }}>
            {/* Feature 01 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.95rem',
                padding: '0.95rem 1.15rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(23, 39, 71, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(23, 39, 71, 0.95)';
                e.currentTarget.style.borderColor = 'rgba(66, 104, 232, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(23, 39, 71, 0.65)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '10px',
                  backgroundColor: 'rgba(66, 104, 232, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#36BFFA',
                }}
              >
                <FolderGit2 size={17} />
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.01em' }}>
                  01 — Research Projects
                </div>
                <div style={{ fontSize: '0.775rem', color: '#94A3B8', marginTop: '0.2rem', lineHeight: 1.45 }}>
                  Organize project information, milestones and deliverables in one workspace.
                </div>
              </div>
            </div>

            {/* Feature 02 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.95rem',
                padding: '0.95rem 1.15rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(23, 39, 71, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(23, 39, 71, 0.95)';
                e.currentTarget.style.borderColor = 'rgba(13, 153, 112, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(23, 39, 71, 0.65)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '10px',
                  backgroundColor: 'rgba(13, 153, 112, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#34D399',
                }}
              >
                <Users size={17} />
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.01em' }}>
                  02 — Faculty Collaboration
                </div>
                <div style={{ fontSize: '0.775rem', color: '#94A3B8', marginTop: '0.2rem', lineHeight: 1.45 }}>
                  Keep reviews, feedback and progress updates connected to each project.
                </div>
              </div>
            </div>

            {/* Feature 03 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.95rem',
                padding: '0.95rem 1.15rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(23, 39, 71, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(23, 39, 71, 0.95)';
                e.currentTarget.style.borderColor = 'rgba(54, 191, 250, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(23, 39, 71, 0.65)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '10px',
                  backgroundColor: 'rgba(54, 191, 250, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#36BFFA',
                }}
              >
                <ShieldCheck size={17} />
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.01em' }}>
                  03 — Research & IP Tracking
                </div>
                <div style={{ fontSize: '0.775rem', color: '#94A3B8', marginTop: '0.2rem', lineHeight: 1.45 }}>
                  Maintain visibility into research documentation and disclosure workflows.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left Panel Footer */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            fontSize: '0.75rem',
            color: '#66748B',
            fontWeight: 500,
          }}
        >
          ACRM · Research Management Platform
        </div>
      </aside>

      {/* =========================================================================
          RIGHT AUTHENTICATION PANEL: CLEAN, BALANCED WHITE SURFACE
          ========================================================================= */}
      <main
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2.5rem',
          backgroundColor: '#F6F8FC',
        }}
        className="acr-auth-right-panel"
      >
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            padding: '2.75rem 2.5rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 16px -2px rgba(16, 27, 53, 0.06), 0 2px 6px -2px rgba(16, 27, 53, 0.03)',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#172033',
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
              }}
            >
              Welcome back.
            </h2>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#66748B',
                marginTop: '0.35rem',
                lineHeight: 1.5,
              }}
            >
              Sign in to continue to your research workspace.
            </p>
          </div>

          {/* Role Selector Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.45rem',
              }}
            >
              <label
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#172033',
                }}
              >
                Account Role
              </label>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: '#64748B',
                }}
              >
                Auto-assigned from record
              </span>
            </div>

            <div
              role="tablist"
              aria-label="Select institutional role"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.35rem',
                padding: '0.3rem',
                backgroundColor: '#F1F5F9',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
              }}
            >
              {[
                { id: 'STUDENT', label: 'Student', icon: GraduationCap },
                { id: 'FACULTY', label: 'Faculty', icon: BookOpen },
                { id: 'ADMIN', label: 'Admin', icon: ShieldCheck },
              ].map((r) => {
                const isSelected = selectedRole === r.id;
                const IconComp = r.icon;
                return (
                  <button
                    key={r.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => {
                      setSelectedRole(r.id as any);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      padding: '0.65rem 0.5rem',
                      borderRadius: '9px',
                      border: isSelected ? '1px solid #4268E8' : '1px solid transparent',
                      backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                      color: isSelected ? '#4268E8' : '#64748B',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 2px 6px rgba(66, 104, 232, 0.12)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <IconComp size={15} color={isSelected ? '#4268E8' : '#64748B'} />
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick-fill helper */}
            <div
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: '#64748B',
              }}
            >
              <span>
                {selectedRole === 'STUDENT' && 'Alex Rivera · Student Scholar'}
                {selectedRole === 'FACULTY' && 'Dr. Eleanor Vance · Associate Professor'}
                {selectedRole === 'ADMIN' && 'System Administrator & Dean'}
              </span>
              <button
                type="button"
                onClick={() => handleQuickFill(selectedRole)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4268E8',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Use {selectedRole === 'STUDENT' ? 'Student' : selectedRole === 'FACULTY' ? 'Faculty' : 'Admin'} credentials
              </button>
            </div>
          </div>

          {/* Form-Level Error Message */}
          {errorMessage && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: '10px',
                color: 'var(--danger-text)',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                marginBottom: '1.5rem',
                lineHeight: 1.45,
              }}
              role="alert"
            >
              <AlertCircle size={16} style={{ flexShrink: 0, color: 'var(--danger-solid)' }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Institutional Email Field */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="signin-email"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#172033',
                  marginBottom: '0.4rem',
                }}
              >
                Institutional email
              </label>
              <input
                id="signin-email"
                type="email"
                className="acr-input"
                placeholder={
                  selectedRole === 'STUDENT'
                    ? 'student@university.edu'
                    : selectedRole === 'FACULTY'
                    ? 'faculty@university.edu'
                    : 'admin@university.edu'
                }
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                disabled={isLoading}
                required
                autoComplete="email"
                style={{
                  height: '44px',
                  borderRadius: '10px',
                  borderColor: emailError ? 'var(--danger-solid)' : undefined,
                }}
              />
              {emailError && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--danger-solid)',
                    marginTop: '0.35rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <AlertCircle size={12} />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.4rem',
                }}
              >
                <label
                  htmlFor="signin-password"
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#172033',
                  }}
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: '0.75rem',
                    color: '#4268E8',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Forgot password?
                </Link>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  className="acr-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                  style={{
                    height: '44px',
                    borderRadius: '10px',
                    paddingRight: '2.5rem',
                    borderColor: passwordError ? 'var(--danger-solid)' : undefined,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#66748B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--danger-solid)',
                    marginTop: '0.35rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <AlertCircle size={12} />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#4268E8',
                  cursor: 'pointer',
                  marginRight: '0.55rem',
                }}
              />
              <label
                htmlFor="rememberMe"
                style={{
                  fontSize: '0.8125rem',
                  color: '#66748B',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                Remember me
              </label>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="acr-btn acr-btn-primary"
              style={{
                width: '100%',
                height: '44px',
                fontSize: '0.875rem',
                fontWeight: 600,
                backgroundColor: '#4268E8',
                borderColor: '#4268E8',
                borderRadius: '10px',
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                      borderTopColor: '#FFFFFF',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span>Signing In...</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Sign in to ACRM →</span>
                </div>
              )}
            </button>
          </form>

          {/* Alternative Authentication (Google) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '1.5rem 0 1.25rem',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
            <span
              style={{
                padding: '0 0.85rem',
                fontSize: '0.72rem',
                color: '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                fontWeight: 600,
              }}
            >
              Or continue with
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <GoogleAuthButton
              buttonText="Continue with Google"
              onSuccess={handleGoogleSuccess}
              onError={(err) => setErrorMessage(err)}
            />
            {!isGoogleAuthConfigured && (
              <div
                style={{
                  marginTop: '0.65rem',
                  padding: '0.6rem 0.85rem',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  color: '#64748B',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  lineHeight: 1.45,
                }}
                role="status"
              >
                <AlertCircle size={15} style={{ flexShrink: 0, color: '#94A3B8' }} />
                <span>
                  Google OAuth is not configured. Add <code>VITE_GOOGLE_CLIENT_ID</code> to your environment to enable single sign-on.
                </span>
              </div>
            )}
          </div>

          {/* Account Footer */}
          <div
            style={{
              textAlign: 'center',
              paddingTop: '1.25rem',
              fontSize: '0.8125rem',
              color: '#66748B',
              borderTop: '1px solid #E2E8F0',
            }}
          >
            New to ACRM?{' '}
            <Link
              to="/sign-up"
              style={{
                color: '#4268E8',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Create an account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
