import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div style={{ marginBottom: '1rem', width: '100%' }}>
        {label && (
          <label htmlFor={inputId} className="acr-label">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`acr-input ${className}`}
          style={error ? { borderColor: '#dc2626' } : undefined}
          {...props}
        />
        {error && <p className="acr-form-error">{error}</p>}
        {!error && helperText && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
