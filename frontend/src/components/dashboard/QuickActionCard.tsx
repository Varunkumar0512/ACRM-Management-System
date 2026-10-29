import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  description: string;
  to: string;
  icon: React.ReactNode;
  accentColor?: string;
  badge?: string;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  to,
  icon,
  accentColor = 'var(--color-royal-blue)',
  badge,
}) => {
  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        padding: '1.25rem',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all var(--transition-normal)',
        position: 'relative',
        boxShadow: 'var(--shadow-xs)',
      }}
      className="acr-quick-action-card"
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-subtle)',
          color: accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {title}
          </div>
          {badge && (
            <span
              style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                color: accentColor,
                backgroundColor: 'var(--bg-subtle)',
                padding: '0.15rem 0.45rem',
                borderRadius: 'var(--radius-pill)',
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
          {description}
        </p>
      </div>

      <div
        style={{
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          alignSelf: 'center',
          transition: 'transform var(--transition-fast)',
        }}
        className="acr-quick-arrow"
      >
        <ArrowRight size={16} />
      </div>
    </Link>
  );
};
