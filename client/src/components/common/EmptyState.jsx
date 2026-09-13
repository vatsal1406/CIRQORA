import React from 'react';
import { PackageOpen } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No Data Available',
  description = 'No records match your criteria yet.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-card border border-dashed border-carbon-border bg-carbon-surface/50">
      <div className="p-4 rounded-full bg-carbon-hover text-text-muted mb-4 border border-carbon-border">
        <Icon className="w-8 h-8 text-secondary" />
      </div>
      <h4 className="text-base font-semibold text-text-primary mb-1">{title}</h4>
      <p className="text-sm text-text-secondary max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
