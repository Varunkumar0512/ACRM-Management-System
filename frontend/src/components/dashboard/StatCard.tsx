import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';

export type StatCardAccent = 'blue' | 'emerald' | 'purple' | 'cyan' | 'amber' | 'rose';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accent?: StatCardAccent;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  linkTo?: string;
  badge?: string;
  isLoading?: boolean;
}

const accentColors: Record<StatCardAccent, { border: string; bg: string; text: string }> = {
  blue: { border: '#2457D6', bg: 'rgba(36, 87, 214, 0.08)', text: '#2457D6' },
  emerald: { border: '#10B981', bg: 'rgba(16, 185, 129, 0.08)', text: '#10B981' },
  purple: { border: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.08)', text: '#8B5CF6' },
  cyan: { border: '#22D3EE', bg: 'rgba(34, 211, 238, 0.1)', text: '#0891B2' },
  amber: { border: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)', text: '#D97706' },
  rose: { border: '#F43F5E', bg: 'rgba(244, 63, 94, 0.08)', text: '#E11D48' },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accent = 'blue',
  trend,
  linkTo,
  badge,
  isLoading = false,
}) => {
  const palette = accentColors[accent] || accentColors.blue;

  const content = (
    <div
      className={`acr-stat-card acr-stat-card-accent-${accent}`}
      style={{
        textDecoration: 'none',
        height: '100%',
        cursor: linkTo ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="acr-kpi-title">{title}</span>
          {badge && (
            <span
              style={{
                fontSize: '0.625rem',
                padding: '0.1rem 0.4rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: palette.bg,
                color: palette.text,
                fontWeight: 700,
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <div
          className="acr-stat-icon-wrapper"
          style={{ backgroundColor: palette.bg, color: palette.text }}
        >
          {icon}
        </div>
      </div>

      <div style={{ marginTop: 'auto' }}>
        {isLoading ? (
          <div style={{ width: '80px', height: '32px', backgroundColor: 'var(--bg-muted)', borderRadius: '4px', animation: 'acr-skeleton-loading 1.4s ease infinite' }} />
        ) : (
          <div className="acr-kpi-value">{value}</div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.35rem' }}>
          {subtitle && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {subtitle}
            </span>
          )}

          {trend && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: trend.isPositive ? '#059669' : '#DC2626',
              }}
            >
              {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend.value} {trend.label && <span style={{ color: 'var(--text-muted)' }}>{trend.label}</span>}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        {content}
      </Link>
    );
  }

  return content;
};
