import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { authApi } from '../../services/api/authApi';
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { token: paramToken } = useParams<{ token?: string }>();
  const token = paramToken || searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token found. Please check your verification link.');
      return;
    }

    authApi
      .verifyEmail(token)
      .then(() => {
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        setErrorMessage(
          err.response?.data?.error?.message || 'Verification token is invalid or has expired. Please sign in or request a new link.'
        );
      });
  }, [token]);

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
      <div className="acr-card" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
            <img src="/logo.svg" alt="ACRM Logo" style={{ width: 42, height: 42 }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>ACRM</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Automated Campus Research Management
              </div>
            </div>
          </Link>
        </div>

        {status === 'loading' && (
          <div>
            <div
              style={{
                width: 44,
                height: 44,
                border: '3px solid var(--border-default)',
                borderTopColor: 'var(--primary-600)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '1.5rem auto',
              }}
            />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Verifying Institutional Email...
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Confirming your university credentials in the ACRM platform.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '1rem auto 1.5rem',
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Institutional Email Verified!
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '2rem' }}>
              Your academic identity has been confirmed. You now have full access to ACRM research discovery, project workspaces, and IPR innovation modules.
            </p>

            <Link to="/sign-in" className="acr-btn acr-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <span>Proceed to Sign In</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '1rem auto 1.5rem',
              }}
            >
              <AlertCircle size={32} />
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Verification Failed
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '2rem' }}>
              {errorMessage}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/sign-in" className="acr-btn acr-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Sign In to Account
              </Link>
              <Link to="/sign-up" className="acr-btn acr-btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                Return to Registration
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
