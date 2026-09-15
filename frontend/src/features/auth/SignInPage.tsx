import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

export const SignInPage: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      // Redirect based on current user will be handled or default to /dashboard
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Authentication failed. Please verify your credentials.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick-fill credentials helper for demo/testing convenience
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

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-page)',
        padding: '1.5rem',
      }}
    >
      <div className="acr-card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
            <img src="/logo.svg" alt="ACRM Crest" style={{ width: 42, height: 42 }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                ACRM
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Automated Campus Research Management
              </div>
            </div>
          </Link>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '1.5rem', color: 'var(--text-primary)' }}>
            Institutional Portal Sign In
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Access research discovery, capstone projects, and IPR innovation
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger-text)',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Institutional Email"
            type="email"
            placeholder="student@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div style={{ position: 'relative' }}>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '32px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8125rem',
              marginBottom: '1.5rem',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember device</span>
            </label>
            <Link to="/forgot-password" style={{ color: 'var(--primary-600)', fontSize: '0.8125rem' }}>
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary" style={{ width: '100%' }} isLoading={isLoading}>
            Sign In to Account
          </Button>
        </form>

        {/* Development Quick Role Switcher */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            textAlign: 'center',
          }}
        >
          <div style={{ color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
            Quick Credentials (Development):
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => fillCredentials('student')}
              className="acr-btn acr-btn-ghost acr-btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('faculty')}
              className="acr-btn acr-btn-ghost acr-btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              Faculty (Assoc. Prof)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin')}
              className="acr-btn acr-btn-ghost acr-btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              Admin
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/sign-up" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
