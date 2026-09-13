import React from 'react';
import { RefreshCw, Leaf } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

const CircularSuggestionCard = ({ suggestions = [] }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <Card className="space-y-4 border-primary/30 bg-gradient-to-r from-primary/5 to-carbon-card">
      <div className="flex items-center gap-2 border-b border-carbon-border pb-3">
        <div className="p-2 rounded-btn bg-primary/20 text-primary border border-primary/40 shadow-glow">
          <RefreshCw className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-text-primary">Circular Sourcing Opportunities</h3>
          <p className="text-xs text-text-secondary">Recycled materials & closed-loop supply strategies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-card bg-carbon-surface border border-carbon-border space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-primary text-xs font-semibold">
                <Leaf className="w-3.5 h-3.5" />
                <span>Circular Strategy</span>
              </div>
              <Badge variant="primary" size="sm">
                Circular
              </Badge>
            </div>
            <h4 className="text-sm font-bold text-text-primary mt-1">{item.suggestion}</h4>
            <p className="text-xs text-text-secondary">{item.reason}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CircularSuggestionCard;
