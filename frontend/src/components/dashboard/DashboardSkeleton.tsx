import React from 'react';
import { Skeleton } from '../ui/Skeleton';

interface DashboardSkeletonProps {
  kpiCount?: number;
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ kpiCount = 4 }) => {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header Banner Skeleton */}
      <div
        style={{
          padding: '1.75rem 2rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Skeleton width="280px" height="28px" borderRadius="6px" />
          <Skeleton width="420px" height="16px" borderRadius="4px" />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Skeleton width="140px" height="38px" borderRadius="8px" />
          <Skeleton width="140px" height="38px" borderRadius="8px" />
        </div>
      </div>

      {/* KPI Grid Skeleton */}
      <div className="acr-kpi-grid">
        {Array.from({ length: kpiCount }).map((_, i) => (
          <div
            key={i}
            className="acr-stat-card"
            style={{ padding: '1.25rem 1.4rem', minHeight: '110px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <Skeleton width="90px" height="14px" />
              <Skeleton width="34px" height="34px" borderRadius="8px" />
            </div>
            <Skeleton width="70px" height="28px" style={{ marginBottom: '0.4rem' }} />
            <Skeleton width="120px" height="12px" />
          </div>
        ))}
      </div>

      {/* Main Split Grid Skeleton */}
      <div className="acr-dashboard-split">
        <div className="acr-card" style={{ minHeight: '360px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <Skeleton width="180px" height="20px" />
            <Skeleton width="70px" height="20px" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Skeleton height="70px" borderRadius="8px" />
            <Skeleton height="70px" borderRadius="8px" />
            <Skeleton height="70px" borderRadius="8px" />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="acr-card" style={{ minHeight: '170px', padding: '1.5rem' }}>
            <Skeleton width="150px" height="18px" style={{ marginBottom: '1rem' }} />
            <Skeleton height="35px" borderRadius="6px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="35px" borderRadius="6px" />
          </div>

          <div className="acr-card" style={{ minHeight: '170px', padding: '1.5rem' }}>
            <Skeleton width="160px" height="18px" style={{ marginBottom: '1rem' }} />
            <Skeleton height="35px" borderRadius="6px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton height="35px" borderRadius="6px" />
          </div>
        </div>
      </div>
    </div>
  );
};
