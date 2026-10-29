import React from 'react';
import { Clock } from 'lucide-react';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  user?: string;
  badge?: React.ReactNode;
  linkTo?: string;
}

interface ActivityTimelineProps {
  items: TimelineItem[];
  emptyMessage?: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  items,
  emptyMessage = 'No recent activity recorded.',
}) => {
  if (!items || items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="acr-timeline">
      {items.map((item) => (
        <div key={item.id} className="acr-timeline-entry">
          <div className="acr-timeline-line" />
          <div className="acr-timeline-node">
            {item.icon || <Clock size={14} color="var(--color-royal-blue)" />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {item.title}
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {item.timestamp}
              </span>
            </div>
            {item.description && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0', lineHeight: 1.45 }}>
                {item.description}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
              {item.user && (
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  By: <strong style={{ color: 'var(--text-secondary)' }}>{item.user}</strong>
                </span>
              )}
              {item.badge}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
