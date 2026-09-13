import React, { useState, useEffect, useCallback } from 'react';
import { GitCompare, Award, AlertCircle, Info, ChevronDown, CheckCircle2, ShieldAlert } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorState from '../common/ErrorState';
import { supplierService } from '../../services/supplierService';
import { useCompany } from '../../hooks/useCompany';
import { formatEmissions, formatCurrency, formatNumber } from '../../utils/formatters';

const SUPPORTED_MATERIALS = [
  'Aluminium',
  'Copper',
  'Steel',
  'Stainless Steel',
  'Plastic',
  'Glass',
  'Paper',
  'Cardboard',
  'Cement',
  'Concrete',
  'Rubber',
  'Textile',
  'Wood',
];

const SupplierComparison = () => {
  const { companyId } = useCompany();
  const [material, setMaterial] = useState('Aluminium');
  const [data, setData] = useState([]);
  const [recommendedSupplier, setRecommendedSupplier] = useState(null);
  const [hasEnoughData, setHasEnoughData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComparison = useCallback(async () => {
    if (!companyId) {
      setData([]);
      setRecommendedSupplier(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await supplierService.compareSuppliers(material, companyId);
      if (res.success) {
        setData(Array.isArray(res.data) ? res.data : []);
        setRecommendedSupplier(res.recommendedSupplier || null);
        setHasEnoughData(res.hasEnoughData || false);
      }
    } catch (err) {
      console.error('[SupplierComparison] Fetch error:', err);
      setError(err.message || 'Failed to fetch supplier comparison');
    } finally {
      setLoading(false);
    }
  }, [material, companyId]);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  return (
    <div className="space-y-6">
      {/* Header & Material Selector */}
      <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-carbon-surface">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-btn bg-secondary/10 border border-secondary/30 text-secondary">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Supplier Material Comparison</h3>
            <p className="text-xs text-text-secondary">
              Compare carbon intensity and total supply-chain impact for suppliers used by your company
            </p>
          </div>
        </div>

        {/* Material Selection Dropdown / Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="material-select" className="text-xs font-mono text-text-muted uppercase whitespace-nowrap">
            Material:
          </label>
          <div className="relative w-full sm:w-64">
            <select
              id="material-select"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full bg-carbon-card border border-carbon-border rounded-btn px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:border-primary appearance-none cursor-pointer pr-8"
            >
              {SUPPORTED_MATERIALS.map((m) => (
                <option key={m} value={m} className="bg-carbon-surface text-text-primary">
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </Card>

      {/* Quick Material Tabs for Desktop */}
      <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {SUPPORTED_MATERIALS.map((m) => (
          <button
            key={m}
            onClick={() => setMaterial(m)}
            className={`px-3 py-1.5 rounded-btn text-xs font-semibold border whitespace-nowrap transition-all ${
              material === m
                ? 'bg-primary text-text-inverted border-primary shadow-glow'
                : 'bg-carbon-card text-text-secondary border-carbon-border hover:bg-carbon-hover hover:text-text-primary'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner text={`Analyzing supplier carbon records for ${material}...`} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchComparison} />
      ) : data.length === 0 ? (
        <Card className="text-center py-12 text-text-muted">
          <Info className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-40" />
          <p className="text-sm font-semibold text-text-primary">
            No suppliers found for {material}
          </p>
          <p className="text-xs text-text-secondary mt-1 max-w-md mx-auto">
            Your company has no recorded purchases of {material} from suppliers yet. Add a Purchased Material activity to include a supplier in this comparison.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Recommended Supplier Card */}
          {hasEnoughData && recommendedSupplier ? (
            <Card className="bg-gradient-to-br from-primary/10 via-carbon-card to-carbon-surface border-2 border-primary/50 shadow-glow p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-full bg-primary/20 text-primary border border-primary/40">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                        Recommended Supplier
                      </span>
                      <Badge variant="primary" size="sm">
                        Lowest Carbon Intensity
                      </Badge>
                    </div>
                    <h4 className="text-lg font-extrabold text-text-primary mt-0.5">
                      {recommendedSupplier.supplierName}
                    </h4>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-text-muted font-mono block">Normalized Carbon Intensity</span>
                  <span className="text-xl font-extrabold font-mono text-primary">
                    {recommendedSupplier.carbonIntensityFormatted}
                  </span>
                </div>
              </div>

              <p className="text-xs text-text-secondary flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                {recommendedSupplier.recommendationReason}
              </p>

              {/* Grid Metrics Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-btn bg-carbon-surface/80 border border-carbon-border">
                  <span className="text-[11px] font-mono text-text-muted block">Purchased Quantity</span>
                  <span className="text-sm font-bold text-text-primary font-mono">
                    {formatNumber(recommendedSupplier.totalQuantity)} {recommendedSupplier.unit || 'kg'}
                  </span>
                </div>

                <div className="p-3 rounded-btn bg-carbon-surface/80 border border-carbon-border">
                  <span className="text-[11px] font-mono text-text-muted block">Material CO₂ (Scope 3 Cat 1)</span>
                  <span className="text-sm font-bold text-scope-1 font-mono">
                    {formatEmissions(recommendedSupplier.materialEmissions || 0)}
                  </span>
                </div>

                <div className="p-3 rounded-btn bg-carbon-surface/80 border border-carbon-border">
                  <span className="text-[11px] font-mono text-text-muted block">Upstream Transport (Cat 4)</span>
                  <span className="text-sm font-bold text-secondary font-mono">
                    {recommendedSupplier.hasTransportationData
                      ? formatEmissions(recommendedSupplier.transportationEmissions || 0)
                      : 'Data Unavailable'}
                  </span>
                </div>

                <div className="p-3 rounded-btn bg-carbon-surface/80 border border-carbon-border">
                  <span className="text-[11px] font-mono text-text-muted block">Total Supply-Chain Impact</span>
                  <span className="text-sm font-bold text-primary font-mono">
                    {formatEmissions(recommendedSupplier.totalSupplyChainImpact)}
                  </span>
                </div>
              </div>
            </Card>
          ) : (
            <div className="p-4 rounded-card bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-text-primary">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-amber-400">Insufficient Data for Recommendation</span>
                <p className="text-text-secondary mt-0.5">
                  Insufficient activity quantity or emission factor records to determine the most efficient supplier for {material}.
                </p>
              </div>
            </div>
          )}

          {/* Comparison Matrix Table */}
          <div className="overflow-x-auto rounded-card border border-carbon-border bg-carbon-card">
            <table className="w-full text-left text-sm text-text-secondary border-collapse">
              <thead className="bg-carbon-surface text-xs uppercase text-text-muted border-b border-carbon-border font-semibold font-mono">
                <tr>
                  <th className="px-4 py-3.5">Rank</th>
                  <th className="px-4 py-3.5">Supplier</th>
                  <th className="px-4 py-3.5">Carbon Intensity</th>
                  <th className="px-4 py-3.5">Purchased Quantity</th>
                  <th className="px-4 py-3.5">Material CO₂ (Cat 1)</th>
                  <th className="px-4 py-3.5">Transport CO₂ (Cat 4)</th>
                  <th className="px-4 py-3.5">Total Impact</th>
                  <th className="px-4 py-3.5">Unit Cost</th>
                  <th className="px-4 py-3.5">Capacity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-carbon-border font-mono text-xs">
                {data.map((item) => {
                  const isWinner = item.isRecommended;
                  return (
                    <tr
                      key={item.supplierId || item.supplierName}
                      className={`hover:bg-carbon-hover/50 transition-colors ${
                        isWinner ? 'bg-primary/5 font-semibold' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        {isWinner ? (
                          <Badge variant="primary" size="sm">
                            #1 Recommended
                          </Badge>
                        ) : (
                          <span className="text-text-muted font-bold font-mono">#{item.efficiencyRank}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-text-primary">
                        {item.supplierName}
                      </td>
                      <td className="px-4 py-3.5 text-primary font-bold">
                        {item.carbonIntensityFormatted}
                      </td>
                      <td className="px-4 py-3.5 text-text-primary">
                        {formatNumber(item.totalQuantity)} {item.unit || 'kg'}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-scope-1">
                        {formatEmissions(item.materialEmissions || 0)}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-secondary">
                        {item.hasTransportationData
                          ? formatEmissions(item.transportationEmissions || 0)
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-3.5 font-extrabold text-primary">
                        {formatEmissions(item.totalSupplyChainImpact)}
                      </td>
                      <td className="px-4 py-3.5 text-text-primary font-sans">
                        {item.cost ? formatCurrency(item.cost) : 'N/A'}
                      </td>
                      <td className="px-4 py-3.5 text-text-primary font-sans">
                        {item.capacity ? `${formatNumber(item.capacity)} t/yr` : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierComparison;
