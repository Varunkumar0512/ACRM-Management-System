import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Dashboard Data',
  message = 'A network or service disruption prevented this dashboard from fetching real-time institutional records.',
  onRetry,
  isRetrying = false,
}) => {
  return (
    <div
      style={{
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        background: 'var(--bg-surface)',
        border: '1px solid var(--danger-border)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '1.5rem 0',
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'var(--danger-bg)',
          color: 'var(--danger-solid)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <AlertTriangle size={24} />
      </div>
      <h3
        style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.4rem',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          maxWidth: '460px',
          marginBottom: onRetry ? '1.5rem' : 0,
          lineHeight: 1.5,
        }}
      >
        {message}
      </p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          isLoading={isRetrying}
          icon={<RefreshCw size={14} />}
        >
          Retry Connection
        </Button>
      )}
    </div>
  );
};
