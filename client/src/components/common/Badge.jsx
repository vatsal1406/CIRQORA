import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  scope = null,
  size = 'md',
  className = '',
}) => {
  const base = 'inline-flex items-center font-medium rounded-badge transition-colors select-none';

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  let colorClasses = 'bg-carbon-hover text-text-secondary border border-carbon-border';

  if (scope !== null && scope !== undefined) {
    switch (Number(scope)) {
      case 1:
        colorClasses = 'bg-scope-1/10 text-scope-1 border border-scope-1/30';
        break;
      case 2:
        colorClasses = 'bg-scope-2/10 text-scope-2 border border-scope-2/30';
        break;
      case 3:
        colorClasses = 'bg-scope-3/10 text-scope-3 border border-scope-3/30';
        break;
      default:
        colorClasses = 'bg-carbon-hover text-text-muted border border-carbon-border';
    }
  } else {
    switch (variant) {
      case 'primary':
        colorClasses = 'bg-primary/15 text-primary border border-primary/30';
        break;
      case 'secondary':
        colorClasses = 'bg-secondary/15 text-secondary border border-secondary/30';
        break;
      case 'success':
        colorClasses = 'bg-status-success/15 text-status-success border border-status-success/30';
        break;
      case 'warning':
        colorClasses = 'bg-status-warning/15 text-status-warning border border-status-warning/30';
        break;
      case 'danger':
        colorClasses = 'bg-status-danger/15 text-status-danger border border-status-danger/30';
        break;
      case 'ai':
        colorClasses = 'bg-ai-badge/20 text-purple-300 border border-ai-badge/40 shadow-aiGlow';
        break;
      case 'outline':
        colorClasses = 'bg-transparent text-text-secondary border border-carbon-border';
        break;
      default:
        colorClasses = 'bg-carbon-hover text-text-secondary border border-carbon-border';
    }
  }

  return (
    <span className={`${base} ${sizes[size]} ${colorClasses} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
