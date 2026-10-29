import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

interface RequireRoleProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

/**
 * Route guard that strictly prevents users from accessing unauthorized role-specific
 * dashboards and pages by manually typing or changing URLs.
 */
export const RequireRole: React.FC<RequireRoleProps> = ({ allowedRoles, children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '70vh',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: '3px solid var(--border-default)',
              borderTopColor: '#4268E8',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem',
            }}
          />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            Verifying institutional authorization...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  const currentRole = ((user.role || '') as string).toUpperCase() as UserRole;
  const isAuthorized = allowedRoles.some((r) => r.toUpperCase() === currentRole);

  if (!isAuthorized) {
    // Strictly prevent unauthorized access by redirecting to their authorized dashboard
    const targetDashboard =
      currentRole === 'ADMIN'
        ? '/admin/dashboard'
        : currentRole === 'FACULTY'
        ? '/faculty/dashboard'
        : '/student/dashboard';

    return <Navigate to={targetDashboard} replace />;
  }

  return <>{children}</>;
};
