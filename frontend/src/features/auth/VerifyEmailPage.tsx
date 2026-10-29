import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { authApi } from '../../services/api/authApi';
import { CheckCircle2, AlertCircle, ArrowRight, Compass } from 'lucide-react';

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
        backgroundColor: '#F7F9FC',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.75rem 2.5rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px -2px rgba(20, 33, 61, 0.07)',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              textDecoration: 'none',
              color: 'inherit',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                backgroundColor: '#4268E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Compass size={20} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#172033' }}>ACRM</span>
          </Link>
        </div>

        {status === 'loading' && (
          <div>
            <div
              style={{
                width: 40,
                height: 40,
                border: '3px solid #E2E8F0',
                borderTopColor: '#4268E8',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '1.5rem auto',
              }}
            />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#172033', marginBottom: '0.35rem' }}>
              Verifying Institutional Email...
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#66748B' }}>
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
                backgroundColor: '#ECFDF5',
                color: '#0D9970',
                border: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#172033', marginBottom: '0.45rem' }}>
              Institutional Email Verified
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#66748B', lineHeight: 1.5, marginBottom: '1.75rem' }}>
              Your academic account has been verified. You now have full access to your campus research workspace.
            </p>

            <Link
              to="/sign-in"
              className="acr-btn acr-btn-primary"
              style={{ width: '100%', height: '44px', backgroundColor: '#4268E8', borderColor: '#4268E8' }}
            >
              <span>Continue to Sign In</span>
              <ArrowRight size={15} />
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
                backgroundColor: '#FEF2F2',
                color: '#EF4444',
                border: '1px solid #FECACA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <AlertCircle size={32} />
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.45rem' }}>
              Verification Failed
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.75rem' }}>
              {errorMessage}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link
                to="/sign-in"
                className="acr-btn acr-btn-secondary"
                style={{ flex: 1, height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                Sign In
              </Link>
              <Link
                to="/support"
                className="acr-btn acr-btn-primary"
                style={{ flex: 1, height: '42px', backgroundColor: '#4268E8', borderColor: '#4268E8' }}
              >
                Campus Helpdesk
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
