import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

const ActivityFilters = ({
  filters,
  onChange,
  onReset,
  suppliers = [],
}) => {
  return (
    <div className="p-4 rounded-card bg-carbon-card border border-carbon-border space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted font-mono">
          <Filter className="w-4 h-4 text-primary" />
          <span>Filter Activities</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Scope Filter */}
        <div>
          <label className="block text-[11px] font-mono text-text-muted uppercase mb-1">
            Scope
          </label>
          <select
            value={filters.scope || ''}
            onChange={(e) => onChange({ scope: e.target.value })}
            className="w-full px-3 py-2 rounded-btn bg-carbon-surface border border-carbon-border text-xs text-text-primary focus:outline-none focus:border-primary"
          >
            <option value="">All Scopes</option>
            <option value="1">Scope 1 (Direct)</option>
            <option value="2">Scope 2 (Energy)</option>
            <option value="3">Scope 3 (Supply Chain)</option>
          </select>
        </div>

        {/* Material Filter */}
        <div>
          <label className="block text-[11px] font-mono text-text-muted uppercase mb-1">
            Material
          </label>
          <select
            value={filters.material || ''}
            onChange={(e) => onChange({ material: e.target.value })}
            className="w-full px-3 py-2 rounded-btn bg-carbon-surface border border-carbon-border text-xs text-text-primary focus:outline-none focus:border-primary"
          >
            <option value="">All Materials</option>
            <option value="Aluminium">Aluminium</option>
            <option value="Copper">Copper</option>
            <option value="Steel">Steel</option>
          </select>
        </div>

        {/* Supplier Filter */}
        <div>
          <label className="block text-[11px] font-mono text-text-muted uppercase mb-1">
            Supplier
          </label>
          <select
            value={filters.supplierId || ''}
            onChange={(e) => onChange({ supplierId: e.target.value })}
            className="w-full px-3 py-2 rounded-btn bg-carbon-surface border border-carbon-border text-xs text-text-primary focus:outline-none focus:border-primary"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Activity Type Search Filter */}
        <div>
          <label className="block text-[11px] font-mono text-text-muted uppercase mb-1">
            Activity Type / Keyword
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. purchased_material..."
              value={filters.activityType || ''}
              onChange={(e) => onChange({ activityType: e.target.value })}
              className="w-full pl-8 pr-3 py-2 rounded-btn bg-carbon-surface border border-carbon-border text-xs text-text-primary focus:outline-none focus:border-primary"
            />
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityFilters;
