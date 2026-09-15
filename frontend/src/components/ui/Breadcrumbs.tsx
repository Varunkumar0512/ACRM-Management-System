import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.8125rem',
        color: 'var(--text-muted)',
        marginBottom: '1rem',
      }}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight size={14} />}
            {item.path && !isLast ? (
              <Link to={item.path} style={{ color: 'var(--text-secondary)' }}>
                {item.label}
              </Link>
            ) : (
              <span style={{ color: isLast ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isLast ? 600 : 400 }}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
