import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sliders,
  TrendingDown,
  AlertCircle,
  Award,
  ShieldAlert,
  Info,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Truck,
  Layers,
  Repeat,
} from 'lucide-react';
import * as d3 from 'd3';
import Card from '../common/Card';
import Badge from '../common/Badge';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorState from '../common/ErrorState';
import { simulationService } from '../../services/simulationService';
import { useCompany } from '../../hooks/useCompany';
import { formatEmissions, formatNumber } from '../../utils/formatters';

const MATERIALS = [
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

const CarbonSimulator = () => {
  const { companyId } = useCompany();

  // Scenario configuration state
  const [scenarioType, setScenarioType] = useState('supplier-switch'); // 'supplier-switch' | 'distance-reduction' | 'material-change'
  const [material, setMaterial] = useState('Aluminium');

  // Supplier switch scenario options
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [currentSuppliers, setCurrentSuppliers] = useState([]);
  const [alternativeSuppliers, setAlternativeSuppliers] = useState([]);
  const [currentSupplierId, setCurrentSupplierId] = useState('');
  const [alternativeSupplierId, setAlternativeSupplierId] = useState('');
  const [switchPercentage, setSwitchPercentage] = useState(30);

  // Distance reduction scenario options
  const [distanceReductionPercentage, setDistanceReductionPercentage] = useState(20);

  // Material change scenario options
  const [alternativeMaterial, setAlternativeMaterial] = useState('Copper');

  // Simulation execution state
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [error, setError] = useState(null);

  const chartRef = useRef(null);

  // 1. Fetch available options when companyId or material changes
  const fetchOptions = useCallback(async () => {
    if (!companyId) return;
    setOptionsLoading(true);
    setError(null);
    try {
      const res = await simulationService.getOptions(companyId, material);
      if (res.success) {
        const curSups = res.currentSuppliers || [];
        const altSups = res.alternativeSuppliers || [];

        setCurrentSuppliers(curSups);
        setAlternativeSuppliers(altSups);

        if (curSups.length > 0) {
          setCurrentSupplierId(curSups[0].supplierId);
        } else {
          setCurrentSupplierId('');
        }

        // Filter candidate alternative suppliers (exclude current selected if same)
        if (altSups.length > 0) {
          const defaultAlt = altSups.find((s) => s.supplierId !== (curSups[0]?.supplierId)) || altSups[0];
          setAlternativeSupplierId(defaultAlt.supplierId);
        } else {
          setAlternativeSupplierId('');
        }
      }
    } catch (err) {
      console.error('[CarbonSimulator] Fetch options error:', err);
      setError('Unable to fetch simulation options for selected material');
    } finally {
      setOptionsLoading(false);
    }
  }, [companyId, material]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  // 2. Run simulation handler
  const handleSimulate = async () => {
    if (!companyId) return;
    setSimulating(true);
    setError(null);

    const payload = {
      companyId,
      scenarioType,
      material,
      currentSupplierId,
      alternativeSupplierId,
      switchPercentage,
      distanceReductionPercentage,
      alternativeMaterial,
    };

    try {
      const res = await simulationService.calculateReduction(payload);
      if (res.success) {
        setSimulationResult(res);
      } else {
        setError(res.message || 'Simulation could not be completed');
      }
    } catch (err) {
      console.error('[CarbonSimulator] Simulate error:', err);
      setError(err.message || 'Error running carbon simulation calculation');
    } finally {
      setSimulating(false);
    }
  };

  // 3. Render D3 Comparison Bar Chart for Result
  useEffect(() => {
    if (!chartRef.current || !simulationResult || !simulationResult.hasEnoughData || !simulationResult.data) return;

    const resData = simulationResult.data;
    const currentTotal = resData.current?.totalEmissions || 0;
    const projectedTotal = resData.projected?.totalEmissions || 0;

    const chartData = [
      { label: 'Current Baseline', emissions: currentTotal, color: '#3B82F6' },
      { label: 'Projected Scenario', emissions: projectedTotal, color: resData.reduction?.absolute >= 0 ? '#34D399' : '#F59E0B' },
    ];

    const margin = { top: 20, right: 30, bottom: 35, left: 120 };
    const width = 450 - margin.left - margin.right;
    const height = 140 - margin.top - margin.bottom;

    d3.select(chartRef.current).selectAll('*').remove();

    const svg = d3
      .select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const y = d3
      .scaleBand()
      .range([0, height])
      .domain(chartData.map((d) => d.label))
      .padding(0.3);

    const maxVal = d3.max(chartData, (d) => d.emissions) * 1.25 || 10;
    const x = d3.scaleLinear().domain([0, maxVal]).range([0, width]);

    // Y Axis (Labels)
    svg
      .append('g')
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll('text')
      .style('fill', '#F9FAFB')
      .style('font-size', '12px')
      .style('font-weight', '600');

    svg.selectAll('.domain').remove();

    // Bars
    svg
      .selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', (d) => y(d.label))
      .attr('height', y.bandwidth())
      .attr('x', 0)
      .attr('rx', 4)
      .style('fill', (d) => d.color)
      .attr('width', 0)
      .transition()
      .duration(750)
      .attr('width', (d) => x(d.emissions));

    // Value Labels
    svg
      .selectAll('.val-label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'val-label')
      .attr('y', (d) => y(d.label) + y.bandwidth() / 2 + 4)
      .attr('x', (d) => x(d.emissions) + 8)
      .style('fill', '#F9FAFB')
      .style('font-size', '11px')
      .style('font-family', 'monospace')
      .style('font-weight', '700')
      .text((d) => formatEmissions(d.emissions));

  }, [simulationResult]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="bg-gradient-to-r from-carbon-surface via-carbon-card to-carbon-surface border-carbon-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-btn bg-primary/10 border border-primary/30 text-primary shadow-glow">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Carbon Reduction Simulator</h2>
              <p className="text-xs text-text-secondary">
                Explore hypothetical supply-chain changes and estimate potential Scope 3 carbon reduction
              </p>
            </div>
          </div>
          <Badge variant="primary" size="md">
            Hypothetical Model
          </Badge>
        </div>
      </Card>

      {/* Scenario Type Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => {
            setScenarioType('supplier-switch');
            setSimulationResult(null);
          }}
          className={`p-4 rounded-card border text-left transition-all flex items-center gap-3 ${
            scenarioType === 'supplier-switch'
              ? 'bg-primary/10 border-primary shadow-glow text-text-primary'
              : 'bg-carbon-card border-carbon-border text-text-secondary hover:bg-carbon-hover'
          }`}
        >
          <div className={`p-2 rounded-btn ${scenarioType === 'supplier-switch' ? 'bg-primary text-text-inverted' : 'bg-carbon-surface'}`}>
            <Repeat className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold">1. Switch Supplier</h4>
            <p className="text-[11px] text-text-muted">Simulate sourcing % switch</p>
          </div>
        </button>

        <button
          onClick={() => {
            setScenarioType('distance-reduction');
            setSimulationResult(null);
          }}
          className={`p-4 rounded-card border text-left transition-all flex items-center gap-3 ${
            scenarioType === 'distance-reduction'
              ? 'bg-primary/10 border-primary shadow-glow text-text-primary'
              : 'bg-carbon-card border-carbon-border text-text-secondary hover:bg-carbon-hover'
          }`}
        >
          <div className={`p-2 rounded-btn ${scenarioType === 'distance-reduction' ? 'bg-primary text-text-inverted' : 'bg-carbon-surface'}`}>
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold">2. Transport Distance</h4>
            <p className="text-[11px] text-text-muted">Simulate route optimization</p>
          </div>
        </button>

        <button
          onClick={() => {
            setScenarioType('material-change');
            setSimulationResult(null);
          }}
          className={`p-4 rounded-card border text-left transition-all flex items-center gap-3 ${
            scenarioType === 'material-change'
              ? 'bg-primary/10 border-primary shadow-glow text-text-primary'
              : 'bg-carbon-card border-carbon-border text-text-secondary hover:bg-carbon-hover'
          }`}
        >
          <div className={`p-2 rounded-btn ${scenarioType === 'material-change' ? 'bg-primary text-text-inverted' : 'bg-carbon-surface'}`}>
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold">3. Change Material</h4>
            <p className="text-[11px] text-text-muted">Simulate material substitution</p>
          </div>
        </button>
      </div>

      {/* Simulator Inputs & Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-5 bg-carbon-card border-carbon-border space-y-5 p-6">
          <h3 className="text-sm font-bold text-text-primary font-mono uppercase tracking-wider border-b border-carbon-border pb-3 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            Configure Scenario Inputs
          </h3>

          {/* Common Material Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary font-mono">Select Material:</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full bg-carbon-surface border border-carbon-border rounded-btn px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:border-primary"
            >
              {MATERIALS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* SCENARIO 1 CONTROLS */}
          {scenarioType === 'supplier-switch' && (
            <div className="space-y-4 pt-2 border-t border-carbon-border">
              {optionsLoading ? (
                <LoadingSpinner text="Fetching supplier options..." />
              ) : currentSuppliers.length === 0 ? (
                <div className="p-3 rounded-btn bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                  <p className="font-bold">No active supplier records for {material}</p>
                  <p className="text-text-muted">
                    Your company has no recorded purchase activities for {material} yet. Record an activity to enable supplier switching simulations.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary font-mono">Current Supplier:</label>
                    <select
                      value={currentSupplierId}
                      onChange={(e) => setCurrentSupplierId(e.target.value)}
                      className="w-full bg-carbon-surface border border-carbon-border rounded-btn px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:border-primary"
                    >
                      {currentSuppliers.map((sup) => (
                        <option key={sup.supplierId} value={sup.supplierId}>
                          {sup.supplierName} ({formatNumber(sup.totalQuantity)} {sup.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary font-mono">Alternative Candidate Supplier:</label>
                    <select
                      value={alternativeSupplierId}
                      onChange={(e) => setAlternativeSupplierId(e.target.value)}
                      className="w-full bg-carbon-surface border border-carbon-border rounded-btn px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:border-primary"
                    >
                      {alternativeSuppliers.map((sup) => (
                        <option key={sup.supplierId} value={sup.supplierId}>
                          {sup.supplierName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-text-secondary">Purchases to Switch:</span>
                      <span className="font-bold text-primary text-sm">{switchPercentage}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={switchPercentage}
                      onChange={(e) => setSwitchPercentage(Number(e.target.value))}
                      className="w-full accent-primary bg-carbon-surface cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-text-muted font-mono">
                      <span>0% (Current)</span>
                      <span>50%</span>
                      <span>100% (Complete Switch)</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* SCENARIO 2 CONTROLS */}
          {scenarioType === 'distance-reduction' && (
            <div className="space-y-4 pt-2 border-t border-carbon-border">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-text-secondary">Proposed Transport Distance Reduction:</span>
                  <span className="font-bold text-primary text-sm">{distanceReductionPercentage}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="5"
                  value={distanceReductionPercentage}
                  onChange={(e) => setDistanceReductionPercentage(Number(e.target.value))}
                  className="w-full accent-primary bg-carbon-surface cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-text-muted font-mono">
                  <span>5% (Route Optimization)</span>
                  <span>40%</span>
                  <span>80% (Local Sourcing)</span>
                </div>
              </div>
            </div>
          )}

          {/* SCENARIO 3 CONTROLS */}
          {scenarioType === 'material-change' && (
            <div className="space-y-4 pt-2 border-t border-carbon-border">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary font-mono">Target Alternative Material:</label>
                <select
                  value={alternativeMaterial}
                  onChange={(e) => setAlternativeMaterial(e.target.value)}
                  className="w-full bg-carbon-surface border border-carbon-border rounded-btn px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:border-primary"
                >
                  {MATERIALS.filter((m) => m !== material).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Simulate Action Button */}
          <button
            onClick={handleSimulate}
            disabled={simulating || (scenarioType === 'supplier-switch' && currentSuppliers.length === 0)}
            className="w-full py-3 px-4 rounded-btn bg-primary text-text-inverted font-bold text-xs uppercase tracking-wider hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-glow flex items-center justify-center gap-2"
          >
            {simulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Simulating Carbon Impact...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Simulate Reduction Scenario</span>
              </>
            )}
          </button>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-6">
          {error ? (
            <ErrorState message={error} onRetry={handleSimulate} />
          ) : !simulationResult ? (
            <Card className="text-center py-16 text-text-muted bg-carbon-card border-carbon-border">
              <Info className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-40" />
              <h4 className="text-base font-bold text-text-primary">Build a Hypothetical Scenario</h4>
              <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
                Select a scenario type and configure inputs on the left to estimate potential Scope 3 carbon savings for your company.
              </p>
            </Card>
          ) : !simulationResult.hasEnoughData ? (
            <Card className="p-6 bg-amber-500/10 border-amber-500/30 space-y-2">
              <div className="flex items-center gap-3 text-amber-400">
                <ShieldAlert className="w-6 h-6 shrink-0" />
                <h4 className="text-sm font-bold">Simulation Unavailable</h4>
              </div>
              <p className="text-xs text-text-secondary">
                {simulationResult.message || 'Insufficient activity records or emission factors available to calculate this scenario honestly.'}
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Recommendation Banner */}
              {simulationResult.data.recommendation?.isRecommended ? (
                <div className="p-5 rounded-card bg-primary/10 border-2 border-primary/50 shadow-glow space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary font-extrabold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>✓ Recommended Lower-Carbon Scenario</span>
                    </div>
                    <Badge variant="primary" size="sm">
                      {simulationResult.data.reduction.percentage}% Reduction
                    </Badge>
                  </div>
                  <p className="text-xs text-text-primary font-medium">
                    {simulationResult.data.recommendation.message}
                  </p>
                </div>
              ) : simulationResult.data.recommendation?.isHigher ? (
                <div className="p-5 rounded-card bg-amber-500/10 border-2 border-amber-500/50 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                    <ShieldAlert className="w-5 h-5" />
                    <span>⚠ Higher Carbon Scenario</span>
                  </div>
                  <p className="text-xs text-text-primary font-medium">
                    {simulationResult.data.recommendation.message}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-card bg-carbon-surface border border-carbon-border text-xs text-text-secondary">
                  <p className="font-semibold text-text-primary">No Significant Carbon Impact Change</p>
                  <p className="mt-0.5">{simulationResult.data.recommendation?.message}</p>
                </div>
              )}

              {/* Main Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card className="bg-carbon-surface p-4 border-carbon-border">
                  <span className="text-[11px] font-mono text-text-muted block">Current Emissions</span>
                  <span className="text-xl font-extrabold font-mono text-text-primary">
                    {formatEmissions(simulationResult.data.current.totalEmissions)}
                  </span>
                </Card>

                <Card className="bg-carbon-surface p-4 border-carbon-border">
                  <span className="text-[11px] font-mono text-text-muted block">Projected Emissions</span>
                  <span className="text-xl font-extrabold font-mono text-primary">
                    {formatEmissions(simulationResult.data.projected.totalEmissions)}
                  </span>
                </Card>

                <Card className="bg-carbon-surface p-4 border-carbon-border">
                  <span className="text-[11px] font-mono text-text-muted block">Potential Reduction</span>
                  <span className={`text-xl font-extrabold font-mono ${simulationResult.data.reduction.absolute >= 0 ? 'text-primary' : 'text-amber-400'}`}>
                    {simulationResult.data.reduction.absolute >= 0 ? '-' : '+'}
                    {formatEmissions(Math.abs(simulationResult.data.reduction.absolute))}
                  </span>
                  <span className="text-[10px] text-text-muted block font-mono">
                    ({simulationResult.data.reduction.percentage}%)
                  </span>
                </Card>
              </div>

              {/* D3 Visual Comparison */}
              <Card className="bg-carbon-card border-carbon-border p-5 space-y-3">
                <h4 className="text-xs font-bold font-mono text-text-muted uppercase">
                  Baseline vs Projected Emissions Comparison
                </h4>
                <div className="overflow-x-auto">
                  <svg ref={chartRef} className="overflow-visible" />
                </div>
              </Card>

              {/* Impact Driver Breakdown */}
              <Card className="bg-carbon-card border-carbon-border p-5 space-y-3">
                <h4 className="text-xs font-bold font-mono text-text-muted uppercase">
                  Why does this scenario alter emissions?
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-btn bg-carbon-surface border border-carbon-border space-y-1">
                    <span className="font-semibold text-scope-1 block">Material Impact (Scope 3 Cat 1)</span>
                    <p className="text-text-secondary font-mono">
                      Current: {formatEmissions(simulationResult.data.current.materialEmissions)} <br />
                      Projected: {formatEmissions(simulationResult.data.projected.materialEmissions)}
                    </p>
                  </div>

                  <div className="p-3 rounded-btn bg-carbon-surface border border-carbon-border space-y-1">
                    <span className="font-semibold text-secondary block">Transport Impact (Scope 3 Cat 4)</span>
                    <p className="text-text-secondary font-mono">
                      Current: {formatEmissions(simulationResult.data.current.transportationEmissions || 0)} <br />
                      Projected: {formatEmissions(simulationResult.data.projected.transportationEmissions || 0)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarbonSimulator;
