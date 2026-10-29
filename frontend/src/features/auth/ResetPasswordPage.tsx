import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/api/authApi';
import { AlertCircle, CheckCircle2, Compass, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!token) {
      setErrorMessage('Missing password reset token. Please check your recovery link.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters in length.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authApi.resetPassword({ token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/sign-in'), 2500);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Password reset token expired or invalid.');
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
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#172033' }}>ACRM</span>
          </Link>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#172033', letterSpacing: '-0.02em' }}>
            Set New Password
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#66748B', marginTop: '0.35rem' }}>
            Choose a strong institutional password (min. 8 characters).
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

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={42} color="#0D9970" style={{ margin: '0 auto 1rem' }} />
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#172033', marginBottom: '0.35rem' }}>
              Password Successfully Updated
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#66748B', marginBottom: '1.5rem' }}>
              Your credentials have been securely refreshed. Redirecting to sign in...
            </p>
            <Link
              to="/sign-in"
              className="acr-btn acr-btn-primary"
              style={{ width: '100%', height: '42px', backgroundColor: '#4268E8', borderColor: '#4268E8' }}
            >
              <span>Go to Sign In</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="reset-newpassword"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.4rem' }}
              >
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reset-newpassword"
                  type={showNewPassword ? 'text' : 'password'}
                  className="acr-input"
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ height: '42px', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="reset-confirmpassword"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.4rem' }}
              >
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reset-confirmpassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="acr-input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ height: '42px', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="acr-btn acr-btn-primary"
              style={{ width: '100%', height: '44px', backgroundColor: '#4268E8', borderColor: '#4268E8' }}
            >
              {isLoading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
