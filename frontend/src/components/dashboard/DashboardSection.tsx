import React from 'react';

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  bodyStyle?: React.CSSProperties;
  noPadding?: boolean;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  subtitle,
  action,
  children,
  icon,
  className = '',
  bodyStyle,
  noPadding = false,
}) => {
  return (
    <div className={`acr-card ${className}`}>
      <div className="acr-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {icon && (
            <div style={{ color: 'var(--color-royal-blue)', display: 'flex', alignItems: 'center' }}>
              {icon}
            </div>
          )}
          <div>
            <h2
              style={{
                fontSize: '0.9375rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
                lineHeight: 1.25,
                margin: 0,
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0', lineHeight: 1.4 }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action && <div>{action}</div>}
      </div>

      <div
        className="acr-card-body"
        style={{
          padding: noPadding ? 0 : undefined,
          ...bodyStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
};
