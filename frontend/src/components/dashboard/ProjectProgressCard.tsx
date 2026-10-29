import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { IProject } from '../../types';
import { ArrowRight, Calendar, UserCheck, Layers } from 'lucide-react';

interface ProjectProgressCardProps {
  project: IProject;
  guideName?: string;
  nextMilestoneTitle?: string;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'APPROVED':
    case 'COMPLETED':
      return 'success';
    case 'IN_PROGRESS':
    case 'UNDER_REVIEW':
      return 'info';
    case 'CHANGES_REQUESTED':
      return 'warning';
    case 'REJECTED':
      return 'danger';
    default:
      return 'neutral';
  }
};

export const ProjectProgressCard: React.FC<ProjectProgressCardProps> = ({
  project,
  guideName,
  nextMilestoneTitle,
}) => {
  const progress = project.progressPercentage || 0;

  return (
    <div className="acr-list-item-interactive">
      <div style={{ flex: 1, minWidth: '260px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
            }}
          >
            {project.code}
          </span>
          <Badge variant={getStatusBadgeVariant(project.status)}>
            {project.status.replace(/_/g, ' ')}
          </Badge>
          {project.domainId?.name && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <Layers size={12} color="var(--color-royal-blue)" />
              {project.domainId.name}
            </span>
          )}
        </div>

        <Link
          to={`/projects/${project._id}`}
          style={{
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            textDecoration: 'none',
            display: 'inline-block',
            lineHeight: 1.35,
          }}
          className="acr-project-title-link"
        >
          {project.title}
        </Link>

        {/* Sprint / Milestone Progress Bar */}
        <div style={{ marginTop: '0.65rem', maxWidth: '380px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.6875rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.25rem',
            }}
          >
            <span>
              {nextMilestoneTitle ? `Next: ${nextMilestoneTitle}` : 'Milestone Progress'}
            </span>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{progress}%</span>
          </div>
          <div className="acr-progress-bar-track">
            <div
              className="acr-progress-bar-fill"
              style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                backgroundColor: progress >= 100 ? '#10B981' : '#4169E1',
              }}
            />
          </div>
        </div>

        {/* Additional metadata tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.65rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {guideName && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <UserCheck size={13} color="var(--color-royal-blue)" />
              Guide: <strong style={{ color: 'var(--text-secondary)' }}>{guideName}</strong>
            </span>
          )}
          {project.expectedCompletionDate && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={13} />
              Target: {new Date(project.expectedCompletionDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <Link
          to={`/projects/${project._id}`}
          className="acr-btn acr-btn-secondary acr-btn-sm"
        >
          <span>Enter Workspace</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
};
