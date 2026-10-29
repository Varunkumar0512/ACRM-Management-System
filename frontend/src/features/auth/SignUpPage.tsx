import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Compass,
  ArrowRight,
  GraduationCap,
  Users,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';

export const SignUpPage: React.FC = () => {
  const { signUpStudent, signUpFaculty } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [role, setRole] = useState<'STUDENT' | 'FACULTY'>('STUDENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [idNumber, setIdNumber] = useState('');
  const [programOrDesignation, setProgramOrDesignation] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [registrationSuccess, setRegistrationSuccess] = useState<{
    email: string;
    fullName: string;
    previewToken?: string;
  } | null>(null);

  // Real-time password validation
  const passwordValidation = useMemo(() => {
    const hasMinLen = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const matchesConfirm = confirmPassword ? password === confirmPassword : true;

    return {
      hasMinLen,
      hasUpper,
      hasNumber,
      matchesConfirm,
      isValid: hasMinLen && hasUpper && hasNumber && password === confirmPassword,
    };
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim()) {
      setErrorMessage('Please enter both your full name and institutional email.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please provide a valid institutional email address.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (!passwordValidation.hasMinLen || !passwordValidation.hasUpper || !passwordValidation.hasNumber) {
      setErrorMessage('Password must be at least 8 characters long and contain at least one uppercase letter and one number.');
      return;
    }

    setIsLoading(true);

    try {
      let response: any;
      if (role === 'STUDENT') {
        response = await signUpStudent({
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          password,
          studentId: idNumber.trim() || `STU-${Date.now().toString().slice(-4)}`,
          department,
          program: programOrDesignation || 'Bachelor of Technology',
          yearOfStudy: 4,
          phone: phone.trim() || undefined,
          researchInterests: ['Artificial Intelligence', 'Campus Research'],
        });
      } else {
        response = await signUpFaculty({
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          password,
          employeeId: idNumber.trim() || `FAC-${Date.now().toString().slice(-4)}`,
          designation: programOrDesignation || 'Associate Professor',
          department,
          experienceYears: 6,
          areasOfExpertise: ['Computer Science', 'Data Systems'],
          phone: phone.trim() || undefined,
        });
      }

      setRegistrationSuccess({
        email,
        fullName,
        previewToken: response?.previewVerificationToken,
      });
    } catch (err: any) {
      const resp = err.response?.data?.error;
      if (err.response?.status === 409 || resp?.code === 'DUPLICATE_KEY' || resp?.message?.includes('already exists')) {
        setErrorMessage('An account with this institutional email or ID already exists. Please sign in or use a different email.');
      } else {
        setErrorMessage(resp?.message || 'Unable to register your account. Please verify the information provided.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Success Screen
  if (registrationSuccess) {
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
            maxWidth: '500px',
            padding: '2.75rem 2.5rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px -2px rgba(20, 33, 61, 0.07)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              color: '#10B981',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <CheckCircle2 size={32} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>
            Account Created Successfully
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Welcome to ACRM, <strong>{registrationSuccess.fullName}</strong>. Your academic profile has been provisioned.
          </p>

          <div
            style={{
              padding: '1.1rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              textAlign: 'left',
              fontSize: '0.8125rem',
              color: '#475569',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
              Next Step: Verify Your Email
            </div>
            <p style={{ margin: 0, lineHeight: 1.45 }}>
              A verification message has been dispatched to <strong>{registrationSuccess.email}</strong>. Please follow the instructions to activate your access.
            </p>

            {registrationSuccess.previewToken && (
              <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4169E1' }}>Development Mode Token:</div>
                <Link
                  to={`/verify-email?token=${registrationSuccess.previewToken}`}
                  style={{ fontSize: '0.75rem', color: '#2563EB', wordBreak: 'break-all', fontWeight: 600 }}
                >
                  Click here to verify email directly &rarr;
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/sign-in"
            className="acr-btn acr-btn-primary"
            style={{ width: '100%', height: '42px', backgroundColor: '#4268E8', borderColor: '#4268E8' }}
          >
            <span>Proceed to Sign In</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1.25fr',
        backgroundColor: '#F6F8FC',
      }}
      className="acr-auth-layout"
    >
      {/* =========================================================================
          LEFT PANEL: DEEP NAVY #101B35
          ========================================================================= */}
      <div
        style={{
          backgroundColor: '#101B35',
          color: '#FFFFFF',
          padding: '4rem 4.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        }}
        className="acr-auth-left-panel"
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              color: '#FFFFFF',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                backgroundColor: '#4268E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(66, 104, 232, 0.35)',
              }}
            >
              <Compass size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF', lineHeight: 1.1 }}>
                ACRM
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.04em' }}>
                AUTOMATED CAMPUS RESEARCH MANAGEMENT
              </div>
            </div>
          </Link>
        </div>

        <div style={{ position: 'relative', zIndex: 2, margin: '3.5rem 0' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(65, 105, 225, 0.2)',
              border: '1px solid rgba(65, 105, 225, 0.4)',
              color: '#93C5FD',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '1.25rem',
            }}
          >
            Academic Registration
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.4rem',
              fontWeight: 800,
              lineHeight: 1.2,
              color: '#FFFFFF',
              marginBottom: '0.85rem',
            }}
          >
            Join the Research Community.
          </h1>

          <p
            style={{
              fontSize: '0.975rem',
              color: '#CBD5E1',
              lineHeight: 1.6,
              maxWidth: '440px',
              marginBottom: '2.5rem',
            }}
          >
            Connect student innovation with faculty mentorship and institutional governance.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '420px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#CBD5E1', fontSize: '0.85rem' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'rgba(65, 105, 225, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={13} color="#93C5FD" />
              </div>
              <span>Role-specific workspaces for scholars and faculty</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#CBD5E1', fontSize: '0.85rem' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'rgba(65, 105, 225, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={13} color="#93C5FD" />
              </div>
              <span>Structured milestone sprints with rubric defenses</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#CBD5E1', fontSize: '0.85rem' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'rgba(65, 105, 225, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={13} color="#93C5FD" />
              </div>
              <span>Novelty screening and institutional IPR workflows</span>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2, fontSize: '0.75rem', color: '#64748B' }}>
          © {new Date().getFullYear()} Automated Campus Research Management (ACRM).
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL: REGISTRATION FORM
          ========================================================================= */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 2rem',
          backgroundColor: '#F7F9FC',
          overflowY: 'auto',
        }}
        className="acr-auth-right-panel"
      >
        <div
          style={{
            width: '100%',
            maxWidth: '520px',
            padding: '2.5rem 2.25rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px -2px rgba(20, 33, 61, 0.07)',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.02em',
              }}
            >
              Create Your Account
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.35rem' }}>
              Join your institution’s research community.
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              padding: '0.3rem',
              backgroundColor: '#F1F5F9',
              borderRadius: '10px',
              marginBottom: '1.5rem',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setRole('STUDENT');
                setProgramOrDesignation('Bachelor of Technology');
              }}
              style={{
                padding: '0.6rem 0.85rem',
                fontSize: '0.8125rem',
                fontWeight: 700,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: role === 'STUDENT' ? '#FFFFFF' : 'transparent',
                color: role === 'STUDENT' ? '#0F172A' : '#64748B',
                boxShadow: role === 'STUDENT' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
              }}
            >
              <Users size={15} color={role === 'STUDENT' ? '#4268E8' : '#64748B'} />
              <span>Student Scholar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('FACULTY');
                setProgramOrDesignation('Associate Professor');
              }}
              style={{
                padding: '0.6rem 0.85rem',
                fontSize: '0.8125rem',
                fontWeight: 700,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: role === 'FACULTY' ? '#FFFFFF' : 'transparent',
                color: role === 'FACULTY' ? '#0F172A' : '#64748B',
                boxShadow: role === 'FACULTY' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
              }}
            >
              <GraduationCap size={15} color={role === 'FACULTY' ? '#4268E8' : '#64748B'} />
              <span>Faculty Mentor</span>
            </button>
          </div>

          {/* Error Message */}
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

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }} className="acr-form-row">
              <div>
                <label
                  htmlFor="signup-fullname"
                  style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}
                >
                  Full Name
                </label>
                <input
                  id="signup-fullname"
                  type="text"
                  className="acr-input"
                  placeholder="e.g. Alex Rivera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  style={{ height: '40px' }}
                />
              </div>

              <div>
                <label
                  htmlFor="signup-email"
                  style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}
                >
                  Institutional Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  className="acr-input"
                  placeholder="scholar@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ height: '40px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }} className="acr-form-row">
              <div>
                <label
                  htmlFor="signup-department"
                  style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}
                >
                  Department
                </label>
                <select
                  id="signup-department"
                  className="acr-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{ height: '40px' }}
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                  <option value="Mechanical & Mechatronics">Mechanical & Mechatronics</option>
                  <option value="Biotechnology & Bioengineering">Biotechnology & Bioengineering</option>
                  <option value="Data Science & Artificial Intelligence">Data Science & AI</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="signup-idnumber"
                  style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}
                >
                  {role === 'STUDENT' ? 'Student ID Number' : 'Employee ID Number'}
                </label>
                <input
                  id="signup-idnumber"
                  type="text"
                  className="acr-input"
                  placeholder={role === 'STUDENT' ? 'STU-2026-081' : 'FAC-1042'}
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  style={{ height: '40px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="signup-designation"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}
              >
                {role === 'STUDENT' ? 'Academic Program' : 'Academic Designation'}
              </label>
              <input
                id="signup-designation"
                type="text"
                className="acr-input"
                placeholder={role === 'STUDENT' ? 'Bachelor of Technology (B.Tech)' : 'Associate Professor / Reader'}
                value={programOrDesignation}
                onChange={(e) => setProgramOrDesignation(e.target.value)}
                style={{ height: '40px' }}
              />
            </div>

            {/* Passwords */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }} className="acr-form-row">
              <div>
                <label
                  htmlFor="signup-password"
                  style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    className="acr-input"
                    placeholder="Min 8 chars, 1 uppercase, 1 digit"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ height: '40px', paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.65rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-confirmpassword"
                  style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}
                >
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="signup-confirmpassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="acr-input"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ height: '40px', paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.65rem',
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
            </div>

            {/* Submit Button */}
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
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </div>
              )}
            </button>
          </form>

          {/* Google Auth if configured */}
          <div style={{ marginTop: '1.25rem' }}>
            <GoogleAuthButton
              buttonText="Register with Institutional Google ID"
              onError={(err) => setErrorMessage(err)}
            />
          </div>

          {/* Already have an account link */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: '#66748B' }}>
            Already have an account?{' '}
            <Link
              to="/sign-in"
              style={{
                color: '#4268E8',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
