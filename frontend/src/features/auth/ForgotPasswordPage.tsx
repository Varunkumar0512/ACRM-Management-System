import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/api/authApi';
import { AlertCircle, CheckCircle2, ArrowLeft, Compass, ArrowRight } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ message: string; previewToken?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authApi.forgotPassword(email);
      setSuccessInfo(res);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to process request. Please check the email address.');
    } finally {
      setIsLoading(false);
    }
  };

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
          maxWidth: '440px',
          padding: '2.75rem 2.5rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px -2px rgba(20, 33, 61, 0.07)',
        }}
      >
        {/* Brand Crest */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>ACRM</span>
          </Link>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Reset Password
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '0.35rem' }}>
            Enter your university email to receive recovery instructions.
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              borderRadius: '8px',
              color: 'var(--danger-text)',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successInfo ? (
          <div>
            <div
              style={{
                padding: '1.15rem',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '10px',
                color: '#065F46',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                marginBottom: '1.5rem',
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#10B981' }} />
              <div>
                <div style={{ fontWeight: 600 }}>{successInfo.message}</div>
                {successInfo.previewToken && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #A7F3D0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#047857' }}>Development Mode Token:</div>
                    <Link
                      to={`/reset-password?token=${successInfo.previewToken}`}
                      style={{ fontSize: '0.75rem', color: '#047857', wordBreak: 'break-all', fontWeight: 600, textDecoration: 'underline' }}
                    >
                      Click here to reset password directly &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <Link
              to="/sign-in"
              className="acr-btn acr-btn-secondary"
              style={{ width: '100%', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}
            >
              <ArrowLeft size={15} />
              <span>Return to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="forgot-email"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.4rem' }}
              >
                Institutional Email
              </label>
              <input
                id="forgot-email"
                type="email"
                className="acr-input"
                placeholder="scholar@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ height: '42px' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="acr-btn acr-btn-primary"
              style={{ width: '100%', height: '44px', backgroundColor: '#4268E8', borderColor: '#4268E8' }}
            >
              {isLoading ? 'Processing Request...' : 'Send Reset Instructions'}
            </button>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link
                to="/sign-in"
                style={{ color: '#64748B', fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
              >
                <ArrowLeft size={14} />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
