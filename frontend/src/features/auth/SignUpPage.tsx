import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { AlertCircle, Eye, EyeOff, CheckCircle2, ShieldCheck, ArrowRight, Check } from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const { signUpStudent, signUpFaculty } = useAuth();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState<'student' | 'faculty'>('student');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Registration success state (with dev verification helper)
  const [registrationSuccess, setRegistrationSuccess] = useState<{
    email: string;
    fullName: string;
    previewToken?: string;
  } | null>(null);

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    department: 'Computer Science & Engineering',
    program: 'Bachelor of Technology',
    yearOfStudy: 4,
    phone: '',
    researchInterests: 'Artificial Intelligence, Distributed Systems',
  });

  // Faculty Form State
  const [facultyForm, setFacultyForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    employeeId: '',
    designation: 'Associate Professor',
    department: 'Computer Science & Engineering',
    experienceYears: 10,
    areasOfExpertise: 'Machine Learning, Information Retrieval',
    cabinLocation: '',
    phone: '',
  });

  // Password requirements calculation
  const currentPassword = activeRole === 'student' ? studentForm.password : facultyForm.password;
  const currentConfirm = activeRole === 'student' ? studentForm.confirmPassword : facultyForm.confirmPassword;

  const passwordValidation = useMemo(() => {
    const hasMinLen = currentPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(currentPassword);
    const hasNumber = /[0-9]/.test(currentPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(currentPassword);

    let score = 0;
    if (hasMinLen) score++;
    if (hasUpper) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    let label = 'Weak';
    let color = '#ef4444';
    if (score >= 4) {
      label = 'Strong';
      color = '#10b981';
    } else if (score >= 3) {
      label = 'Good';
      color = '#3b82f6';
    } else if (score >= 2) {
      label = 'Fair';
      color = '#f59e0b';
    }

    const matchesConfirm = currentConfirm ? currentPassword === currentConfirm : true;

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
  }, [currentPassword, currentConfirm]);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    // Client-side validations
    if (studentForm.password !== studentForm.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password confirmation.');
      return;
    }

    if (!passwordValidation.hasMinLen || !passwordValidation.hasUpper || !passwordValidation.hasNumber) {
      setErrorMessage('Password does not meet the institutional security requirements.');
      return;
    }

    if (!studentForm.email.includes('@') || !studentForm.email.includes('.')) {
      setErrorMessage('Please enter a valid institutional email address.');
      return;
    }

    setIsLoading(true);

    try {
      const response: any = await signUpStudent({
        fullName: studentForm.fullName.trim(),
        email: studentForm.email.toLowerCase().trim(),
        password: studentForm.password,
        studentId: studentForm.studentId.trim(),
        department: studentForm.department,
        program: studentForm.program,
        yearOfStudy: Number(studentForm.yearOfStudy),
        phone: studentForm.phone ? studentForm.phone.trim() : undefined,
        researchInterests: studentForm.researchInterests.split(',').map((s) => s.trim()).filter(Boolean),
      });

      // Show success screen with dev verification
      setRegistrationSuccess({
        email: studentForm.email,
        fullName: studentForm.fullName,
        previewToken: response?.previewVerificationToken,
      });
    } catch (err: any) {
      const resp = err.response?.data?.error;
      if (err.response?.status === 409 || resp?.code === 'DUPLICATE_KEY' || resp?.message?.includes('already exists')) {
        setErrorMessage('Unable to create the account. Please check your details or sign in if you already have an account.');
      } else if (resp?.details && typeof resp.details === 'object') {
        // Zod validation details
        const detailsObj = resp.details;
        const errs: Record<string, string> = {};
        Object.keys(detailsObj).forEach((k) => {
          if (Array.isArray(detailsObj[k])) errs[k] = detailsObj[k][0];
        });
        setFieldErrors(errs);
        setErrorMessage(resp.message || 'Please correct the highlighted fields and try again.');
      } else {
        setErrorMessage(resp?.message || 'Unable to create the account. Please check your details or sign in if you already have an account.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacultySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    if (facultyForm.password !== facultyForm.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password confirmation.');
      return;
    }

    if (!passwordValidation.hasMinLen || !passwordValidation.hasUpper || !passwordValidation.hasNumber) {
      setErrorMessage('Password does not meet the institutional security requirements.');
      return;
    }

    setIsLoading(true);

    try {
      const response: any = await signUpFaculty({
        fullName: facultyForm.fullName.trim(),
        email: facultyForm.email.toLowerCase().trim(),
        password: facultyForm.password,
        employeeId: facultyForm.employeeId.trim(),
        designation: facultyForm.designation,
        department: facultyForm.department,
        experienceYears: Number(facultyForm.experienceYears),
        areasOfExpertise: facultyForm.areasOfExpertise.split(',').map((s) => s.trim()).filter(Boolean),
        cabinLocation: facultyForm.cabinLocation ? facultyForm.cabinLocation.trim() : undefined,
        phone: facultyForm.phone ? facultyForm.phone.trim() : undefined,
      });

      setRegistrationSuccess({
        email: facultyForm.email,
        fullName: facultyForm.fullName,
        previewToken: response?.previewVerificationToken,
      });
    } catch (err: any) {
      const resp = err.response?.data?.error;
      if (err.response?.status === 409 || resp?.code === 'DUPLICATE_KEY' || resp?.message?.includes('already exists')) {
        setErrorMessage('Unable to create the account. Please check your details or sign in if you already have an account.');
      } else {
        setErrorMessage(resp?.message || 'Unable to create the account. Please check your details or sign in if you already have an account.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // If successfully registered, show clear activation screen with dev verification
  if (registrationSuccess) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-page)',
          padding: '2rem 1.5rem',
        }}
      >
        <div className="acr-card" style={{ width: '100%', maxWidth: '520px', padding: '2.5rem', textAlign: 'center' }}>
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
              margin: '0 auto 1.5rem',
            }}
          >
            <CheckCircle2 size={32} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Account Created Successfully!
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Welcome to ACRM, <strong>{registrationSuccess.fullName}</strong>. Your academic profile has been securely created.
          </p>

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.75rem',
              textAlign: 'left',
              fontSize: '0.8125rem',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              Institutional Email:
            </div>
            <div style={{ color: 'var(--primary-600)', fontFamily: 'var(--font-mono)', marginBottom: '0.75rem' }}>
              {registrationSuccess.email}
            </div>

            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              In this development environment, external SMTP email dispatch is not enabled. Use the direct activation button below to verify your institutional account immediately.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {registrationSuccess.previewToken ? (
              <Link
                to={`/verify-email?token=${registrationSuccess.previewToken}`}
                className="acr-btn acr-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <ShieldCheck size={16} />
                <span>Verify & Activate Account Now</span>
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="acr-btn acr-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>Enter ACRM Dashboard</span>
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-page)',
        padding: '2.5rem 1.5rem',
      }}
    >
      <div className="acr-card" style={{ width: '100%', maxWidth: '620px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
            <img src="/logo.svg" alt="ACRM Crest" style={{ width: 42, height: 42 }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>ACRM</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Automated Campus Research Management
              </div>
            </div>
          </Link>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '1.25rem', color: 'var(--text-primary)' }}>
            Create Institutional Account
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Register your academic credentials to participate in research discovery, capstone projects, and IPR innovation
          </p>
        </div>

        <Tabs
          tabs={[
            { id: 'student', label: 'Student Scholar' },
            { id: 'faculty', label: 'Faculty Mentor' },
          ]}
          activeTab={activeRole}
          onChange={(id) => {
            setActiveRole(id as any);
            setErrorMessage(null);
            setFieldErrors({});
          }}
        />

        {errorMessage && (
          <div
            style={{
              padding: '0.85rem 1rem',
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
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {activeRole === 'student' ? (
          <form onSubmit={handleStudentSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Full Name"
                value={studentForm.fullName}
                onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                placeholder="Alex Rivera"
                error={fieldErrors.fullName}
                required
              />
              <Input
                label="Student ID / Reg No."
                value={studentForm.studentId}
                onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                placeholder="ACRM-2024-CS-042"
                error={fieldErrors.studentId}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              <Input
                label="Institutional Email"
                type="email"
                value={studentForm.email}
                onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                placeholder="alex.rivera@university.edu"
                error={fieldErrors.email}
                required
              />
              <Input
                label="Contact Phone (Optional)"
                type="tel"
                value={studentForm.phone}
                onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                placeholder="+1 (555) 012-3456"
                error={fieldErrors.phone}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="acr-label">Academic Department</label>
                <select
                  className="acr-select"
                  value={studentForm.department}
                  onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                >
                  <option>Computer Science & Engineering</option>
                  <option>Data Science & Artificial Intelligence</option>
                  <option>Electronics & Communication Engineering</option>
                  <option>Cybersecurity & Information Security</option>
                  <option>Mechanical & Automation Engineering</option>
                  <option>Information Technology</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="acr-label">Degree Program</label>
                <select
                  className="acr-select"
                  value={studentForm.program}
                  onChange={(e) => setStudentForm({ ...studentForm, program: e.target.value })}
                >
                  <option>Bachelor of Technology (B.Tech)</option>
                  <option>Bachelor of Science (B.S.)</option>
                  <option>Master of Technology (M.Tech)</option>
                  <option>Master of Science (M.S.)</option>
                  <option>Ph.D. / Research Scholar</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="acr-label">Academic Year</label>
                <select
                  className="acr-select"
                  value={studentForm.yearOfStudy}
                  onChange={(e) => setStudentForm({ ...studentForm, yearOfStudy: Number(e.target.value) })}
                >
                  <option value={1}>1st Year (Freshman)</option>
                  <option value={2}>2nd Year (Sophomore)</option>
                  <option value={3}>3rd Year (Junior)</option>
                  <option value={4}>4th Year (Senior)</option>
                  <option value={5}>Postgraduate / Masters</option>
                  <option value={6}>Ph.D. / Doctorate</option>
                </select>
              </div>

              <Input
                label="Research Interests (Comma separated)"
                value={studentForm.researchInterests}
                onChange={(e) => setStudentForm({ ...studentForm, researchInterests: e.target.value })}
                placeholder="AI, Robotics, IoT"
              />
            </div>

            {/* Password with Show/Hide and Strength Meter */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                  placeholder="••••••••••••"
                  error={fieldErrors.password}
                  required
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

              <div style={{ position: 'relative' }}>
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={studentForm.confirmPassword}
                  onChange={(e) => setStudentForm({ ...studentForm, confirmPassword: e.target.value })}
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '32px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                  }}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password Requirements & Strength Indicator */}
            {studentForm.password && (
              <div
                style={{
                  marginTop: '0.25rem',
                  marginBottom: '1.25rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Password Strength:</span>
                  <span style={{ fontWeight: 700, color: passwordValidation.color }}>
                    {passwordValidation.label}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ color: passwordValidation.hasMinLen ? '#10b981' : '#9ca3af' }}>
                      {passwordValidation.hasMinLen ? '✓' : '•'}
                    </span>
                    <span>Min 8 characters</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ color: passwordValidation.hasUpper ? '#10b981' : '#9ca3af' }}>
                      {passwordValidation.hasUpper ? '✓' : '•'}
                    </span>
                    <span>Uppercase letter (A-Z)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ color: passwordValidation.hasNumber ? '#10b981' : '#9ca3af' }}>
                      {passwordValidation.hasNumber ? '✓' : '•'}
                    </span>
                    <span>At least one number (0-9)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ color: passwordValidation.matchesConfirm ? '#10b981' : '#ef4444' }}>
                      {studentForm.confirmPassword ? (passwordValidation.matchesConfirm ? '✓' : '✗') : '•'}
                    </span>
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '0.5rem' }} isLoading={isLoading}>
              Create Student Account
            </Button>
          </form>
        ) : (
          <form onSubmit={handleFacultySubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Full Name (with Title)"
                value={facultyForm.fullName}
                onChange={(e) => setFacultyForm({ ...facultyForm, fullName: e.target.value })}
                placeholder="Dr. Eleanor Vance"
                required
              />
              <Input
                label="Faculty / Employee ID"
                value={facultyForm.employeeId}
                onChange={(e) => setFacultyForm({ ...facultyForm, employeeId: e.target.value })}
                placeholder="FAC-2024-007"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              <Input
                label="Institutional Email"
                type="email"
                value={facultyForm.email}
                onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                placeholder="e.vance@university.edu"
                required
              />
              <Input
                label="Office Phone (Optional)"
                type="tel"
                value={facultyForm.phone}
                onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })}
                placeholder="+1 (555) 019-2831"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="acr-label">Academic Designation</label>
                <select
                  className="acr-select"
                  value={facultyForm.designation}
                  onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                >
                  <option>Assistant Professor</option>
                  <option>Associate Professor</option>
                  <option>Professor</option>
                  <option>Distinguished Professor</option>
                  <option>Dean of Research</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="acr-label">Department</label>
                <select
                  className="acr-select"
                  value={facultyForm.department}
                  onChange={(e) => setFacultyForm({ ...facultyForm, department: e.target.value })}
                >
                  <option>Computer Science & Engineering</option>
                  <option>Data Science & Artificial Intelligence</option>
                  <option>Electronics & Communication Engineering</option>
                  <option>Cybersecurity & Information Security</option>
                </select>
              </div>
            </div>

            <Input
              label="Areas of Guidance & Expertise (Comma separated)"
              value={facultyForm.areasOfExpertise}
              onChange={(e) => setFacultyForm({ ...facultyForm, areasOfExpertise: e.target.value })}
              placeholder="Machine Learning, Autonomous Systems, NLP"
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Years of Experience"
                type="number"
                value={facultyForm.experienceYears}
                onChange={(e) => setFacultyForm({ ...facultyForm, experienceYears: Number(e.target.value) })}
                required
              />
              <Input
                label="Cabin / Office Location"
                value={facultyForm.cabinLocation}
                onChange={(e) => setFacultyForm({ ...facultyForm, cabinLocation: e.target.value })}
                placeholder="Block 3, Room 412"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={facultyForm.password}
                  onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                  required
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

              <div style={{ position: 'relative' }}>
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={facultyForm.confirmPassword}
                  onChange={(e) => setFacultyForm({ ...facultyForm, confirmPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '32px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                  }}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '0.5rem' }} isLoading={isLoading}>
              Create Faculty Account
            </Button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/sign-in" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
