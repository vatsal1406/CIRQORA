import React from 'react';
import { Building2, MapPin, DollarSign, Package, Layers } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { formatEmissions, formatCurrency, formatNumber } from '../../utils/formatters';

const SupplierCard = ({ supplier, totalEmissions = null, onClick }) => {
  return (
    <Card hoverEffect onClick={onClick} className="flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-btn bg-carbon-surface border border-carbon-border text-secondary">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">{supplier.name}</h3>
              {supplier.location && (
                <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
                  <MapPin className="w-3 h-3 text-text-muted" />
                  <span>{supplier.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Materials Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {supplier.materials && supplier.materials.length > 0 ? (
            supplier.materials.map((mat, idx) => (
              <Badge key={idx} variant="secondary" size="sm">
                {mat}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-text-muted italic">General Supplier</span>
          )}
        </div>
      </div>

      {/* Metrics Footer */}
      <div className="pt-3 border-t border-carbon-border grid grid-cols-3 gap-2 text-xs font-mono">
        <div>
          <span className="text-text-muted block text-[10px] uppercase">Cost</span>
          <span className="font-semibold text-text-primary">
            {supplier.cost ? formatCurrency(supplier.cost) : 'N/A'}
          </span>
        </div>

        <div>
          <span className="text-text-muted block text-[10px] uppercase">Capacity</span>
          <span className="font-semibold text-text-primary">
            {supplier.capacity ? `${formatNumber(supplier.capacity)} t/yr` : 'N/A'}
          </span>
        </div>

        <div>
          <span className="text-text-muted block text-[10px] uppercase">Footprint</span>
          {totalEmissions !== null && totalEmissions !== undefined ? (
            <span className="font-bold text-primary">
              {formatEmissions(totalEmissions)}
            </span>
          ) : (
            <span className="text-text-muted italic text-[10px]">No activity</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SupplierCard;
