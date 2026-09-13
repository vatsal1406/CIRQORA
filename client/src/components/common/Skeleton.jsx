import React from 'react';

const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const base = 'animate-pulse bg-carbon-hover/70 rounded';

  const variants = {
    circular: 'rounded-full',
    text: 'h-4 w-3/4 rounded',
    rectangular: 'rounded-card',
  };

  return <div className={`${base} ${variants[variant]} ${className}`} />;
};

export const SkeletonCard = () => (
  <div className="p-5 border border-carbon-border bg-carbon-card rounded-card space-y-4 animate-pulse">
    <div className="h-4 bg-carbon-hover rounded w-1/3" />
    <div className="h-8 bg-carbon-hover rounded w-2/3" />
    <div className="h-3 bg-carbon-hover rounded w-1/2" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="w-full border border-carbon-border bg-carbon-card rounded-card overflow-hidden p-4 space-y-3">
    <div className="h-8 bg-carbon-surface rounded w-full mb-4" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-10 bg-carbon-hover/50 rounded w-full" />
    ))}
  </div>
);

export default Skeleton;
