import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { formatEmissions } from '../../utils/formatters';

const StatCard = ({
  title,
  value,
  scope = null,
  icon: Icon,
  subtitle,
  className = '',
}) => {
  const scopeColors = {
    1: 'border-l-4 border-l-scope-1',
    2: 'border-l-4 border-l-scope-2',
    3: 'border-l-4 border-l-scope-3',
  };

  return (
    <Card
      hoverEffect
      className={`relative overflow-hidden transition-all duration-300 ${scope ? scopeColors[scope] : ''} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted font-mono">
            {title}
          </span>
          {scope !== null && scope !== undefined && (
            <div className="mt-1">
              <Badge scope={scope} size="sm">
                Scope {scope}
              </Badge>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-2.5 rounded-btn bg-carbon-surface border border-carbon-border text-text-secondary">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-2xl lg:text-3xl font-extrabold text-text-primary font-mono tracking-tight">
          {formatEmissions(value)}
        </div>
        {subtitle && (
          <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
