import React from 'react';
import { Flame, AlertTriangle } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { formatEmissions } from '../../utils/formatters';

const HotspotCard = ({ hotspots = [] }) => {
  if (!hotspots || hotspots.length === 0) return null;

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2 border-b border-carbon-border pb-3">
        <div className="p-2 rounded-btn bg-status-danger/10 text-status-danger border border-status-danger/30">
          <Flame className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-text-primary">Major Carbon Hotspots</h3>
          <p className="text-xs text-text-secondary">Key drivers contributing to total footprint</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hotspots.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-card bg-carbon-surface border border-carbon-border space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-text-muted">
                Type: {item.type}
              </span>
              <Badge variant="danger" size="sm">
                Hotspot
              </Badge>
            </div>
            <h4 className="text-lg font-bold text-text-primary">{item.name}</h4>
            {item.emissions > 0 && (
              <p className="text-xl font-extrabold font-mono text-status-danger">
                {formatEmissions(item.emissions)}
              </p>
            )}
            <p className="text-xs text-text-secondary mt-1">{item.reason}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default HotspotCard;
