import React from 'react';

// ==========================================
// 1. Interactive SVG Donut Chart
// ==========================================
export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  centerLabel?: string;
  centerValue?: string | number;
  size?: number;
  thickness?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  centerLabel,
  centerValue,
  size = 180,
  thickness = 22,
}) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  if (total === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
        No data available to display chart.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          {data.map((seg, idx) => {
            const percent = seg.value / total;
            const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
            const strokeDashoffset = -circumference * accumulatedPercent;
            accumulatedPercent += percent;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease',
                  cursor: 'pointer',
                }}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              lineHeight: 1,
            }}
          >
            {centerValue !== undefined ? centerValue : total}
          </div>
          {centerLabel && (
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {centerLabel}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '160px' }}>
        {data.map((seg, idx) => {
          const pct = Math.round((seg.value / total) * 100);
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.85rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '2px', backgroundColor: seg.color, flexShrink: 0 }} />
                <span style={{ color: 'var(--text-secondary)' }}>{seg.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{seg.value}</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 2. Horizontal Proportional Bar Chart
// ==========================================
export interface BarItem {
  label: string;
  value: number;
  color?: string;
  badge?: string;
}

interface HorizontalBarChartProps {
  items: BarItem[];
  emptyMessage?: string;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  items,
  emptyMessage = 'No category metrics recorded.',
}) => {
  if (!items || items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
        {emptyMessage}
      </div>
    );
  }

  const maxValue = Math.max(...items.map((i) => i.value), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {items.map((item, idx) => {
        const percent = Math.round((item.value / maxValue) * 100);
        const barColor = item.color || 'var(--color-royal-blue)';

        return (
          <div key={idx}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.label}</span>
                {item.badge && (
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>• {item.badge}</span>
                )}
              </div>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
            </div>

            <div style={{ height: '7px', backgroundColor: 'var(--bg-muted)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${percent}%`,
                  backgroundColor: barColor,
                  borderRadius: '9999px',
                  transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ==========================================
// 3. Mentorship Capacity Bar (Faculty / Admin)
// ==========================================
interface CapacityBarProps {
  current: number;
  max: number;
  label?: string;
}

export const CapacityBar: React.FC<CapacityBarProps> = ({
  current,
  max,
  label = 'Mentorship Capacity',
}) => {
  const safeMax = Math.max(max, 1);
  const ratio = current / safeMax;
  const pct = Math.min(100, Math.round(ratio * 100));

  let statusColor = '#10B981'; // safe
  let statusText = 'Optimal Load';

  if (ratio >= 1) {
    statusColor = '#EF4444'; // full
    statusText = 'At Maximum Capacity';
  } else if (ratio >= 0.75) {
    statusColor = '#F59E0B'; // near full
    statusText = 'Near Capacity';
  }

  return (
    <div style={{ padding: '0.75rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {current} / {max} slots
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: statusColor,
              backgroundColor: 'var(--bg-subtle)',
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-pill)',
            }}
          >
            {statusText}
          </span>
        </div>
      </div>

      <div style={{ height: '8px', backgroundColor: 'var(--bg-muted)', borderRadius: '9999px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: statusColor,
            borderRadius: '9999px',
            transition: 'width 0.5s ease',
          }}
        />
      </div>
    </div>
  );
};
