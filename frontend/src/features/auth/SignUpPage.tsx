import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import {
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Check,
  GraduationCap,
  Users,
  Lock,
  User,
  BookOpen,
} from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const { signUpStudent, signUpFaculty } = useAuth();
  const navigate = useNavigate();

  // Multi-step State (1: Personal, 2: Academic, 3: Security)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [role, setRole] = useState<'STUDENT' | 'FACULTY'>('STUDENT');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [technicalSkills, setTechnicalSkills] = useState('Distributed Systems, AI/ML');
  const [idNumber, setIdNumber] = useState('');
  const [programOrDesignation, setProgramOrDesignation] = useState('Bachelor of Technology');

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
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    let score = 0;
    if (hasMinLen) score++;
    if (hasUpper) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    let label = 'Weak';
    let color = 'var(--danger-solid)';
    if (score >= 4) {
      label = 'Strong';
      color = 'var(--success-solid)';
    } else if (score >= 3) {
      label = 'Good';
      color = 'var(--color-royal-blue)';
    } else if (score >= 2) {
      label = 'Fair';
      color = 'var(--warning-solid)';
    }

    const matchesConfirm = confirmPassword ? password === confirmPassword : true;

    return {
      hasMinLen,
      hasUpper,
      hasNumber,
      hasSpecial,
      score,
      label,
      color,
      matchesConfirm,
    };
  }, [password, confirmPassword]);

  // Step 1 Validation & Next
  const handleNextFromStep1 = (e: React.FormEvent) => {
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
    setCurrentStep(2);
  };

  // Step 2 Validation & Next
  const handleNextFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!department) {
      setErrorMessage('Please select your academic department.');
      return;
    }
    setCurrentStep(3);
  };

  // Step 3 Submission
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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
      const skillsArray = technicalSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

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
          researchInterests: skillsArray.length > 0 ? skillsArray : ['Artificial Intelligence'],
        });
      } else {
        response = await signUpFaculty({
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          password,
          employeeId: idNumber.trim() || `FAC-${Date.now().toString().slice(-4)}`,
          designation: programOrDesignation || 'Associate Professor',
          department,
          experienceYears: 8,
          areasOfExpertise: skillsArray.length > 0 ? skillsArray : ['Computer Science'],
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
          backgroundColor: '#F4F7FB',
          padding: '2rem 1.5rem',
        }}
      >
        <div
          className="acr-card"
          style={{
            width: '100%',
            maxWidth: '520px',
            padding: '3rem 2.5rem',
            textAlign: 'center',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success-solid)',
              border: '1px solid var(--success-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <CheckCircle2 size={34} />
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0B1220', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
            Account Created Successfully
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '1.75rem', lineHeight: 1.5 }}>
            Welcome to ACRM, <strong>{registrationSuccess.fullName}</strong>. Your academic profile has been securely provisioned.
          </p>

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '2rem',
              textAlign: 'left',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: '#0B1220' }}>
              Institutional Account:
            </div>
            <div style={{ color: 'var(--color-royal-blue)', fontFamily: 'var(--font-mono)', marginBottom: '0.65rem' }}>
              {registrationSuccess.email}
            </div>
            <div style={{ color: '#64748B', fontSize: '0.8rem', lineHeight: 1.5 }}>
              In this environment, you can activate and verify your institutional credentials immediately using the button below.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {registrationSuccess.previewToken ? (
              <Link
                to={`/verify-email?token=${registrationSuccess.previewToken}`}
                className="acr-btn acr-btn-primary"
                style={{ width: '100%', height: '46px', fontSize: '0.9rem', justifyContent: 'center' }}
              >
                <ShieldCheck size={16} />
                <span>Verify & Activate Account</span>
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="acr-btn acr-btn-primary"
                style={{ width: '100%', height: '46px', fontSize: '0.9rem', justifyContent: 'center' }}
              >
                <span>Enter ACRM Workspace</span>
                <ArrowRight size={16} />
              </Link>
            )}

            <Link
              to="/sign-in"
              className="acr-btn acr-btn-ghost"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Sign In to Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F4F7FB',
        padding: '3rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '660px',
          padding: '3rem 3.25rem',
          background: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 20px 45px -10px rgba(7, 20, 38, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E2E8F0',
          position: 'relative',
        }}
      >
        {/* Brand Crest & Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
            <img src="/logo.svg" alt="ACRM Logo" style={{ width: 40, height: 40, borderRadius: '8px' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B1220', lineHeight: 1.1, fontFamily: 'var(--font-display)' }}>
                ACRM
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 600 }}>
                AUTOMATED CAMPUS RESEARCH MANAGEMENT
              </div>
            </div>
          </Link>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#0B1220',
              marginTop: '1.5rem',
            }}
          >
            Create your ACRM account
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.35rem' }}>
            Join a unified platform for research, innovation and collaboration.
          </p>
        </div>

        {/* Multi-Step Indicator */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '2.5rem',
            position: 'relative',
          }}
        >
          {/* Step 1 Tab */}
          <div
            onClick={() => currentStep > 1 && setCurrentStep(1)}
            style={{
              textAlign: 'center',
              cursor: currentStep > 1 ? 'pointer' : 'default',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: currentStep === 1 ? 'var(--color-royal-blue)' : currentStep > 1 ? '#10B981' : '#94A3B8',
                marginBottom: '0.4rem',
              }}
            >
              01 Personal
            </div>
            <div
              style={{
                height: '4px',
                borderRadius: '9999px',
                background: currentStep === 1 ? 'var(--color-royal-blue)' : currentStep > 1 ? '#10B981' : '#E2E8F0',
                transition: 'background var(--transition-normal)',
              }}
            />
          </div>

          {/* Step 2 Tab */}
          <div
            onClick={() => currentStep > 2 && setCurrentStep(2)}
            style={{
              textAlign: 'center',
              cursor: currentStep > 2 ? 'pointer' : 'default',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: currentStep === 2 ? 'var(--color-royal-blue)' : currentStep > 2 ? '#10B981' : '#94A3B8',
                marginBottom: '0.4rem',
              }}
            >
              02 Academic
            </div>
            <div
              style={{
                height: '4px',
                borderRadius: '9999px',
                background: currentStep === 2 ? 'var(--color-royal-blue)' : currentStep > 2 ? '#10B981' : '#E2E8F0',
                transition: 'background var(--transition-normal)',
              }}
            />
          </div>

          {/* Step 3 Tab */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: currentStep === 3 ? 'var(--color-royal-blue)' : '#94A3B8',
                marginBottom: '0.4rem',
              }}
            >
              03 Security
            </div>
            <div
              style={{
                height: '4px',
                borderRadius: '9999px',
                background: currentStep === 3 ? 'var(--color-royal-blue)' : '#E2E8F0',
                transition: 'background var(--transition-normal)',
              }}
            />
          </div>
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
              marginBottom: '1.75rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: PERSONAL INFORMATION */}
        {currentStep === 1 && (
          <form onSubmit={handleNextFromStep1} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="acr-label" htmlFor="fullName">Full Name *</label>
              <input
                id="fullName"
                type="text"
                className="acr-input"
                placeholder="Dr. Eleanor Vance / Alex Mercer"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{ height: '46px' }}
              />
            </div>

            <div>
              <label className="acr-label" htmlFor="email">Email Address *</label>
              <input
                id="email"
                type="email"
                className="acr-input"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{ height: '46px' }}
              />
            </div>

            <div>
              <label className="acr-label" htmlFor="phone">Contact Phone</label>
              <input
                id="phone"
                type="tel"
                className="acr-input"
                placeholder="+1 (555) 019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ height: '46px' }}
              />
            </div>

            <button
              type="submit"
              className="acr-btn acr-btn-primary acr-btn-submit-arrow"
              style={{
                width: '100%',
                height: '48px',
                fontSize: '0.9375rem',
                fontWeight: 700,
                marginTop: '0.75rem',
                justifyContent: 'center',
                borderRadius: '10px',
              }}
            >
              <span>Continue to Academic Info</span>
              <ArrowRight size={17} className="arrow-icon" />
            </button>
          </form>
        )}

        {/* STEP 2: ACADEMIC INFORMATION */}
        {currentStep === 2 && (
          <form onSubmit={handleNextFromStep2} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Role Switcher */}
            <div>
              <label className="acr-label">Account Role *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setRole('STUDENT');
                    setProgramOrDesignation('Bachelor of Technology');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    border: `2px solid ${role === 'STUDENT' ? 'var(--color-royal-blue)' : '#E2E8F0'}`,
                    background: role === 'STUDENT' ? 'var(--primary-50)' : '#FFFFFF',
                    color: role === 'STUDENT' ? 'var(--color-royal-blue)' : '#475569',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Users size={18} color={role === 'STUDENT' ? 'var(--color-royal-blue)' : '#64748B'} />
                  <span>Student Scholar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole('FACULTY');
                    setProgramOrDesignation('Associate Professor');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    border: `2px solid ${role === 'FACULTY' ? 'var(--color-royal-blue)' : '#E2E8F0'}`,
                    background: role === 'FACULTY' ? 'var(--primary-50)' : '#FFFFFF',
                    color: role === 'FACULTY' ? 'var(--color-royal-blue)' : '#475569',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <GraduationCap size={18} color={role === 'FACULTY' ? 'var(--color-royal-blue)' : '#64748B'} />
                  <span>Faculty Mentor</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="acr-label" htmlFor="department">Department *</label>
                <select
                  id="department"
                  className="acr-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{ height: '46px' }}
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                  <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Biotechnology & Bioengineering">Biotechnology & Bioengineering</option>
                  <option value="Data Science & Artificial Intelligence">Data Science & Artificial Intelligence</option>
                </select>
              </div>

              <div>
                <label className="acr-label" htmlFor="idNumber">
                  {role === 'STUDENT' ? 'Student Registration / Roll No. *' : 'Faculty / Employee ID *'}
                </label>
                <input
                  id="idNumber"
                  type="text"
                  className="acr-input"
                  placeholder={role === 'STUDENT' ? '2022-CSE-045' : 'FAC-CSE-102'}
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  style={{ height: '46px' }}
                />
              </div>
            </div>

            <div>
              <label className="acr-label" htmlFor="technicalSkills">Technical Skills & Research Interests</label>
              <input
                id="technicalSkills"
                type="text"
                className="acr-input"
                placeholder="e.g. Distributed Systems, Machine Learning, Computer Vision"
                value={technicalSkills}
                onChange={(e) => setTechnicalSkills(e.target.value)}
                style={{ height: '46px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="acr-btn acr-btn-secondary"
                style={{ height: '48px', flex: '0 0 110px', borderRadius: '10px' }}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="acr-btn acr-btn-primary acr-btn-submit-arrow"
                style={{ flex: 1, height: '48px', fontSize: '0.9375rem', fontWeight: 700, justifyContent: 'center', borderRadius: '10px' }}
              >
                <span>Continue to Security</span>
                <ArrowRight size={17} className="arrow-icon" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SECURITY */}
        {currentStep === 3 && (
          <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="acr-label" htmlFor="password">Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="acr-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  style={{ height: '46px', paddingRight: '2.75rem' }}
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
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="acr-label" htmlFor="confirmPassword">Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="acr-input"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  style={{ height: '46px', paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B',
                  }}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password Validation Checklist */}
            {password && (
              <div
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600, color: '#475569' }}>Password Strength:</span>
                  <span style={{ fontWeight: 800, color: passwordValidation.color }}>{passwordValidation.label}</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: '#64748B' }}>
                  <span style={{ color: passwordValidation.hasMinLen ? '#10B981' : 'inherit' }}>
                    {passwordValidation.hasMinLen ? '✓' : '•'} 8+ characters
                  </span>
                  <span style={{ color: passwordValidation.hasUpper ? '#10B981' : 'inherit' }}>
                    {passwordValidation.hasUpper ? '✓' : '•'} Uppercase letter
                  </span>
                  <span style={{ color: passwordValidation.hasNumber ? '#10B981' : 'inherit' }}>
                    {passwordValidation.hasNumber ? '✓' : '•'} Number
                  </span>
                  {confirmPassword && (
                    <span style={{ color: passwordValidation.matchesConfirm ? '#10B981' : '#EF4444' }}>
                      {passwordValidation.matchesConfirm ? '✓ Passwords match' : '✕ Passwords mismatch'}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="acr-btn acr-btn-secondary"
                style={{ height: '48px', flex: '0 0 110px', borderRadius: '10px' }}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="acr-btn acr-btn-primary"
                style={{
                  flex: 1,
                  height: '48px',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  justifyContent: 'center',
                  borderRadius: '10px',
                }}
              >
                <span>{isLoading ? 'CREATING ACCOUNT...' : 'Create Account'}</span>
              </button>
            </div>
          </form>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: '#475569' }}>
          Already have an account?{' '}
          <Link to="/sign-in" style={{ color: 'var(--color-royal-blue)', fontWeight: 700 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
