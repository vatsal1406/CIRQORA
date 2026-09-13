import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-carbon-bg disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-btn';

  const variants = {
    primary:
      'bg-primary text-text-inverted hover:bg-primary-hover active:bg-primary-dark shadow-glow font-semibold',
    secondary:
      'bg-secondary text-text-inverted hover:bg-secondary-hover shadow-cyanGlow font-semibold',
    outline:
      'border border-carbon-border bg-carbon-surface text-text-primary hover:bg-carbon-hover hover:border-carbon-borderLight',
    ghost:
      'bg-transparent text-text-secondary hover:text-text-primary hover:bg-carbon-hover',
    danger:
      'bg-status-danger text-text-primary hover:bg-red-600 font-semibold',
    ai:
      'bg-ai-badge text-text-primary hover:bg-purple-600 shadow-aiGlow font-semibold',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
