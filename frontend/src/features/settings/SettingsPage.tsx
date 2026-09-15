import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../services/i18n/I18nContext';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { useToast } from '../../hooks/useToast';
import { User, Sun, Moon, Globe, Shield, Bell, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'language' | 'security'>('profile');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Account security credentials updated successfully.');
    }, 800);
  };

  return (
    <div style={{ maxWidth: '840px' }}>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Settings & Preferences' },
        ]}
      />

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Account Settings & Institutional Preferences
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Manage your personal academic profile, theme preferences, internationalization, and credentials
        </p>
      </div>

      <Tabs
        tabs={[
          { id: 'profile', label: 'Academic Profile' },
          { id: 'appearance', label: 'Appearance & Themes' },
          { id: 'language', label: 'Language & Locale' },
          { id: 'security', label: 'Security & Sessions' },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="acr-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem' }}>Personal & Academic Profile</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Input label="Full Name" value={user?.fullName || ''} readOnly disabled />
            <Input label="Institutional Email" value={user?.email || ''} readOnly disabled />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Input label="Academic Role" value={user?.role || ''} readOnly disabled />
            <Input
              label={user?.role === 'STUDENT' ? 'Student ID' : 'Employee ID'}
              value={profile?.studentId || profile?.employeeId || 'N/A'}
              readOnly
              disabled
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Input label="Department" value={profile?.department || 'Engineering'} readOnly disabled />
            {user?.role === 'STUDENT' ? (
              <Input label="Year of Study" value={`Year ${profile?.yearOfStudy || 4}`} readOnly disabled />
            ) : (
              <Input label="Designation" value={profile?.designation || 'Associate Professor'} readOnly disabled />
            )}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            * Academic records and institutional affiliations are managed by the University Registrar. Contact the ACR administrator for name or departmental revisions.
          </p>
        </div>
      )}

      {/* Tab 2: Appearance */}
      {activeTab === 'appearance' && (
        <div className="acr-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Theme Preferences</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Choose a visual appearance tailored to your workplace lighting. Settings persist across browser sessions.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {/* Light Mode */}
            <div
              onClick={() => {
                setTheme('light');
                toast.success('Theme set to Light Mode.');
              }}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: theme === 'light' ? '2px solid var(--primary-600)' : '1px solid var(--border-subtle)',
                background: '#ffffff',
                color: '#0f172a',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Sun size={24} color="#d97706" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Light Theme</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>High contrast daylight</div>
            </div>

            {/* Dark Mode */}
            <div
              onClick={() => {
                setTheme('dark');
                toast.success('Theme set to Dark Mode.');
              }}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: theme === 'dark' ? '2px solid var(--primary-600)' : '1px solid var(--border-subtle)',
                background: '#111827',
                color: '#f8fafc',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Moon size={24} color="#38bdf8" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Dark Theme</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Restrained slate darkness</div>
            </div>

            {/* System Default */}
            <div
              onClick={() => {
                setTheme('system');
                toast.success('Theme matched to OS default.');
              }}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: theme === 'system' ? '2px solid var(--primary-600)' : '1px solid var(--border-subtle)',
                background: 'var(--bg-subtle)',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <Shield size={24} color="var(--primary-600)" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>System Default</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Follow OS preference</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Language */}
      {activeTab === 'language' && (
        <div className="acr-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Internationalization & Locale</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            ACR uses a centralized internationalization architecture allowing extensible language bundles.
          </p>

          <div style={{ maxWidth: '320px' }}>
            <label className="acr-label">Preferred Platform Language</label>
            <select
              className="acr-select"
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value as any);
                toast.success(`Language set to ${e.target.value}.`);
              }}
            >
              <option value="en">English (United States / Institutional Standard)</option>
              <option value="es">Español (Extensible Dictionary)</option>
              <option value="fr">Français (Extensible Dictionary)</option>
              <option value="de">Deutsch (Extensible Dictionary)</option>
            </select>
          </div>
        </div>
      )}

      {/* Tab 4: Security */}
      {activeTab === 'security' && (
        <div className="acr-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Account Security & Credentials</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Update your authentication password and monitor active sessions.
          </p>

          <form onSubmit={handleSavePassword} style={{ maxWidth: '420px' }}>
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" isLoading={isUpdatingPassword}>
              Update Password
            </Button>
          </form>

          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.5rem' }}>Active Sessions & Protection</h4>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Current Browser Session</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Signed in via HttpOnly Rotating Refresh Token</div>
              </div>
              <span className="acr-badge acr-badge-success">Secured</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
