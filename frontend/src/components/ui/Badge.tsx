import React from 'react';

interface BadgeProps {
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, icon }) => {
  return (
    <span className={`acr-badge acr-badge-${variant}`}>
      {icon}
      {children}
    </span>
  );
};
