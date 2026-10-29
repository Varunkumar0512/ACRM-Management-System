import React from 'react';
import { Calendar, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface DeadlineItem {
  id: string;
  title: string;
  dueDate: string;
  projectCode?: string;
  projectId?: string;
  status?: string;
  category?: string;
}

interface DeadlineListProps {
  items: DeadlineItem[];
  emptyMessage?: string;
}

export const DeadlineList: React.FC<DeadlineListProps> = ({
  items,
  emptyMessage = 'No upcoming deadlines scheduled.',
}) => {
  if (!items || items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
        {emptyMessage}
      </div>
    );
  }

  const getUrgency = (dateStr: string) => {
    const due = new Date(dateStr).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Overdue', color: '#EF4444', bg: '#FEF2F2', icon: <AlertCircle size={13} color="#EF4444" /> };
    }
    if (diffDays <= 3) {
      return { label: `${diffDays === 0 ? 'Due Today' : `Due in ${diffDays}d`}`, color: '#D97706', bg: '#FFFBEB', icon: <Clock size={13} color="#D97706" /> };
    }
    return { label: `Due in ${diffDays}d`, color: 'var(--color-royal-blue)', bg: 'rgba(36, 87, 214, 0.08)', icon: <Calendar size={13} color="var(--color-royal-blue)" /> };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((item) => {
        const urgency = getUrgency(item.dueDate);
        return (
          <div
            key={item.id}
            style={{
              padding: '0.85rem 0',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                {item.projectCode && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: 'var(--text-muted)',
                      fontWeight: 700,
                    }}
                  >
                    {item.projectCode}
                  </span>
                )}
                {item.category && (
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    • {item.category}
                  </span>
                )}
              </div>
              {item.projectId ? (
                <Link
                  to={`/projects/${item.projectId}`}
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    display: 'block',
                    lineHeight: 1.35,
                  }}
                >
                  {item.title}
                </Link>
              ) : (
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {item.title}
                </div>
              )}
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: urgency.color,
                backgroundColor: urgency.bg,
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-pill)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {urgency.icon}
              <span>{urgency.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
