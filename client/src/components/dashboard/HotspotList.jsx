import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, AlertTriangle, ArrowRight, Building2, Layers } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { formatEmissions } from '../../utils/formatters';

const HotspotList = ({ hotspots, supplierEmissions = [] }) => {
  const navigate = useNavigate();

  const topSupplier = hotspots?.highestEmissionSupplier;
  const topActivity = hotspots?.highestEmissionActivity;

  return (
    <Card className="space-y-6">
      <div className="flex items-center justify-between border-b border-carbon-border pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-btn bg-status-danger/10 text-status-danger border border-status-danger/30">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Carbon Hotspots</h3>
            <p className="text-xs text-text-secondary">Highest emitting nodes in your footprint</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/activities')}
          className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top Supplier Hotspot */}
        <div className="p-4 rounded-card bg-carbon-surface border border-carbon-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase font-mono">
              <Building2 className="w-4 h-4 text-status-warning" />
              <span>Highest Impact Supplier</span>
            </div>
            <Badge variant="warning" size="sm">Top Hotspot</Badge>
          </div>
          {topSupplier ? (
            <div>
              <p className="text-lg font-bold text-text-primary mt-1">{topSupplier.name}</p>
              <p className="text-xl font-extrabold font-mono text-status-warning mt-0.5">
                {formatEmissions(topSupplier.totalEmissions)}
              </p>
              {topSupplier.location && (
                <p className="text-xs text-text-muted mt-1">{topSupplier.location}</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-text-muted italic py-2">No supplier hotspot recorded</p>
          )}
        </div>

        {/* Top Activity Hotspot */}
        <div className="p-4 rounded-card bg-carbon-surface border border-carbon-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase font-mono">
              <Layers className="w-4 h-4 text-secondary" />
              <span>Highest Impact Activity</span>
            </div>
            <Badge variant="secondary" size="sm">Top Source</Badge>
          </div>
          {topActivity ? (
            <div>
              <p className="text-lg font-bold text-text-primary capitalize mt-1">
                {topActivity.activityType?.replace('_', ' ')}
              </p>
              <p className="text-xl font-extrabold font-mono text-secondary mt-0.5">
                {formatEmissions(topActivity.emissions)}
              </p>
            </div>
          ) : (
            <p className="text-xs text-text-muted italic py-2">No activity hotspot recorded</p>
          )}
        </div>
      </div>

      {/* Top 3 Emitting Suppliers List */}
      {supplierEmissions && supplierEmissions.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted font-mono">
            Supplier Emission Ranking
          </h4>
          <div className="space-y-2">
            {supplierEmissions.slice(0, 4).map((sup, idx) => (
              <div
                key={sup.supplierId || idx}
                onClick={() => navigate('/suppliers')}
                className="flex items-center justify-between p-3 rounded-btn bg-carbon-surface border border-carbon-border hover:border-carbon-borderLight transition-all cursor-pointer text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-carbon-hover text-text-secondary text-xs font-bold flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-text-primary">{sup.name}</span>
                    {sup.materials && sup.materials.length > 0 && (
                      <p className="text-xs text-text-muted">
                        {sup.materials.map((m) => m.material).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-mono font-bold text-text-primary">
                  {formatEmissions(sup.totalEmissions)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default HotspotList;
