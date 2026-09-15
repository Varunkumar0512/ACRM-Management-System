import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/api/authApi';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

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
      setErrorMessage(err.response?.data?.error?.message || 'Failed to process request.');
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
        backgroundColor: 'var(--bg-page)',
        padding: '1.5rem',
      }}
    >
      <div className="acr-card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Reset Institutional Password
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Enter your university email address to receive password reset instructions
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

        {successInfo ? (
          <div>
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--success-bg)',
                border: '1px solid var(--success-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--success-text)',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                marginBottom: '1.5rem',
              }}
            >
              <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div>{successInfo.message}</div>
                {successInfo.previewToken && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--success-border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Development Mode Reset Link:</div>
                    <Link
                      to={`/reset-password?token=${successInfo.previewToken}`}
                      style={{ fontSize: '0.75rem', color: 'var(--primary-700)', wordBreak: 'break-all', fontWeight: 600 }}
                    >
                      Click here to reset password now
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <Link to="/sign-in" className="acr-btn acr-btn-secondary" style={{ width: '100%' }}>
              <ArrowLeft size={16} />
              <span>Return to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input
              label="Institutional Email"
              type="email"
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '0.5rem' }} isLoading={isLoading}>
              Send Reset Instructions
            </Button>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link to="/sign-in" style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
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
