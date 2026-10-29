import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Modal } from '../ui/Modal';
import { AlertCircle, Lock, ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: (notification?: (notification: any) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface GoogleAuthButtonProps {
  buttonText?: string;
  onSuccess?: () => void;
  onError?: (errorMsg: string) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  buttonText = 'Continue with Google',
  onSuccess,
  onError,
}) => {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Secure Account Linking Modal State
  const [isLinkingModalOpen, setIsLinkingModalOpen] = useState(false);
  const [linkingEmail, setLinkingEmail] = useState('');
  const [linkingToken, setLinkingToken] = useState('');
  const [linkPassword, setLinkPassword] = useState('');
  const [showLinkPassword, setShowLinkPassword] = useState(false);
  const [isLinkingLoading, setIsLinkingLoading] = useState(false);
  const [linkingError, setLinkingError] = useState<string | null>(null);

  const googleButtonContainerRef = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Process credential response from Google Identity Services
  const handleCredentialResponse = async (idToken: string, explicitPassword?: string) => {
    if (!idToken) return;

    if (explicitPassword) {
      setIsLinkingLoading(true);
      setLinkingError(null);
    } else {
      setIsLoading(true);
      setErrorMessage(null);
    }

    try {
      const data = await signInWithGoogle(idToken, explicitPassword);

      if (isLinkingModalOpen) {
        setIsLinkingModalOpen(false);
        setLinkPassword('');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        const targetRole = data?.user?.role;
        if (targetRole === 'FACULTY') {
          navigate('/faculty/dashboard');
        } else if (targetRole === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      const responseData = err.response?.data;
      const errorCode = responseData?.error?.code;
      const msg = responseData?.error?.message || err.message || 'Authentication failed.';

      // Check if secure account linking is required
      if (err.response?.status === 409 && errorCode === 'ACCOUNT_LINKING_REQUIRED') {
        setLinkingToken(idToken);
        setLinkingEmail(responseData?.error?.details?.email || '');
        setIsLinkingModalOpen(true);
        setLinkingError(null);
        setLinkPassword('');
      } else {
        if (explicitPassword) {
          setLinkingError(msg);
        } else {
          setErrorMessage(msg);
          if (onError) onError(msg);
        }
      }
    } finally {
      setIsLoading(false);
      setIsLinkingLoading(false);
    }
  };

  // Initialize GIS SDK
  useEffect(() => {
    if (!clientId) return;

    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(interval);
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (res: any) => {
              if (res.credential) {
                handleCredentialResponse(res.credential);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (googleButtonContainerRef.current) {
            googleButtonContainerRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleButtonContainerRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: 380,
            });
          }
        } catch (e) {
          console.warn('GIS initialization error:', e);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [clientId]);

  // Click handler for custom branded button
  const handleCustomButtonClick = () => {
    if (!clientId) {
      setErrorMessage(
        'Google Client ID is not configured. Please add VITE_GOOGLE_CLIENT_ID to your environment variables.'
      );
      return;
    }

    if (isLoading) return;

    setErrorMessage(null);
    if (window.google?.accounts?.id) {
      setIsLoading(true);
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setIsLoading(false);
          // If prompt was skipped or not displayed, simulate or show instruction
          if (notification.getNotDisplayedReason() === 'suppressed_by_user') {
            setErrorMessage('Google One Tap was dismissed. Please use institutional email sign-in or enable popups.');
          }
        }
      });
    } else {
      setErrorMessage('Google authentication service is loading. Please try again in a moment.');
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkPassword) {
      setLinkingError('Please enter your existing password to link your account.');
      return;
    }
    await handleCredentialResponse(linkingToken, linkPassword);
  };

  return (
    <div style={{ width: '100%' }}>
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
            gap: '0.65rem',
            marginBottom: '1rem',
          }}
          role="alert"
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Hidden GIS container for official script rendering */}
      <div
        ref={googleButtonContainerRef}
        style={{
          display: clientId ? 'flex' : 'none',
          justifyContent: 'center',
          marginBottom: '0.5rem',
          minHeight: '44px',
        }}
      />

      {/* Custom High-Quality Google Button for Seamless Aesthetic Integration */}
      {(!clientId || !googleButtonContainerRef.current?.hasChildNodes()) && (
        <button
          type="button"
          onClick={handleCustomButtonClick}
          disabled={isLoading}
          aria-label={buttonText}
          style={{
            width: '100%',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            color: '#1E293B',
            fontSize: '0.9375rem',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            opacity: isLoading ? 0.75 : 1,
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
              e.currentTarget.style.borderColor = '#94A3B8';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
            }
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Verifying with Google...</span>
            </>
          ) : (
            <>
              {/* Official 4-Color Google Logo SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.39 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.61 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>{buttonText}</span>
            </>
          )}
        </button>
      )}

      {/* Secure Account Linking Modal */}
      <Modal
        isOpen={isLinkingModalOpen}
        onClose={() => {
          if (!isLinkingLoading) {
            setIsLinkingModalOpen(false);
            setLinkPassword('');
          }
        }}
        title="Verify Institutional Account Ownership"
        maxWidth="500px"
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1rem',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '10px',
              color: '#1E40AF',
              fontSize: '0.8125rem',
              marginBottom: '1.25rem',
            }}
          >
            <ShieldCheck size={20} style={{ flexShrink: 0 }} />
            <div>
              An existing institutional account was found for <strong>{linkingEmail}</strong>. To securely link your
              Google credentials and protect research confidentiality, please enter your existing password.
            </div>
          </div>

          {linkingError && (
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
                gap: '0.65rem',
                marginBottom: '1rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{linkingError}</span>
            </div>
          )}

          <form onSubmit={handleLinkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label className="acr-label" htmlFor="link-password-input">
                Existing Account Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="link-password-input"
                  type={showLinkPassword ? 'text' : 'password'}
                  className="acr-input"
                  placeholder="••••••••••••"
                  value={linkPassword}
                  onChange={(e) => setLinkPassword(e.target.value)}
                  required
                  autoFocus
                  style={{ height: '44px', fontSize: '0.9rem', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowLinkPassword(!showLinkPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label={showLinkPassword ? 'Hide password' : 'Show password'}
                >
                  {showLinkPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsLinkingModalOpen(false)}
                disabled={isLinkingLoading}
                className="acr-btn acr-btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLinkingLoading}
                className="acr-btn acr-btn-primary"
                style={{ height: '42px', padding: '0 1.5rem', fontWeight: 700 }}
              >
                {isLinkingLoading ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>Link & Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
