import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  RefreshCw,
  BrainCircuit,
  AlertTriangle,
  Award,
  CheckCircle2,
  TrendingDown,
  Clock,
  Layers,
  Users,
  Activity as ActivityIcon,
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Truck,
  Repeat,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import MobileNav from '../components/layout/MobileNav';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import { aiService } from '../services/aiService';
import { useCompany } from '../hooks/useCompany';
import { formatEmissions, formatNumber } from '../utils/formatters';

const Insights = () => {
  const { companyId, activeCompany } = useCompany();
  const [data, setData] = useState(null);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [hasEnoughData, setHasEnoughData] = useState(true);
  const [noDataMessage, setNoDataMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedRecs, setExpandedRecs] = useState({});

  const toggleExpand = (idx) => {
    setExpandedRecs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const fetchStoredAnalysis = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.getStoredAnalysis(companyId);
      if (res.success) {
        if (res.hasAnalysis) {
          setHasAnalysis(true);
          setHasEnoughData(true);
          setIsStale(Boolean(res.isStale));
          setData(res.data || null);
        } else {
          setHasAnalysis(false);
          setData(null);
          setIsStale(false);
          if (res.hasEnoughData === false) {
            setHasEnoughData(false);
            setNoDataMessage(res.message || 'Not enough carbon activity data to generate an analysis.');
          } else {
            setHasEnoughData(true);
          }
        }
      }
    } catch (err) {
      console.error('[AI Analysis] Error fetching stored analysis:', err);
      setError(err.message || 'Failed to fetch stored AI analysis');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchStoredAnalysis();
  }, [fetchStoredAnalysis]);

  const handleRunAnalysis = async () => {
    if (!companyId || analyzing) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await aiService.analyzeEmissions(companyId);
      if (res.success) {
        if (res.hasEnoughData === false) {
          setHasEnoughData(false);
          setNoDataMessage(res.message || 'Not enough carbon activity data to generate an analysis.');
          setData(null);
          setHasAnalysis(false);
        } else {
          setHasEnoughData(true);
          setHasAnalysis(true);
          setIsStale(false);
          setData(res.data || null);
        }
      }
    } catch (err) {
      console.error('[AI Analysis] Error running AI analysis:', err);
      setError(err.message || 'Failed to generate AI analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const analysis = data?.analysis;
  const totals = data?.totals;
  const snapshot = analysis?.snapshot;
  const lastAnalyzed = data?.generatedAt || data?.lastAnalyzed;

  const formatTimestamp = (ts) => {
    if (!ts) return null;
    try {
      const date = new Date(ts);
      return date.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-carbon-bg text-text-primary flex">
      <Sidebar />
      <MobileNav />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar
          title="AI Carbon Analysis"
          subtitle={`AI-powered analysis of ${activeCompany?.name || 'Selected Company'}'s carbon footprint and supply chain`}
        />

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header Action Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-card bg-gradient-to-r from-ai-bg/70 via-carbon-card to-carbon-card border border-ai-border/60 shadow-aiGlow">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-card bg-ai-badge/20 text-purple-300 border border-ai-badge/40 shrink-0">
                <BrainCircuit className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-text-primary">
                    AI Carbon Analysis
                  </h2>
                  {activeCompany && (
                    <Badge variant="primary" size="sm">
                      {activeCompany.name}
                    </Badge>
                  )}
                  {isStale && (
                    <Badge variant="warning" size="sm">
                      Analysis Outdated
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  AI-powered sustainability analysis and decarbonization action plan.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {lastAnalyzed && (
                <div className="flex items-center gap-1.5 text-xs text-text-muted font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Last analyzed: {formatTimestamp(lastAnalyzed)}</span>
                </div>
              )}
              <Button
                variant={isStale ? 'warning' : 'ai'}
                size="md"
                icon={isStale ? RefreshCw : Sparkles}
                loading={analyzing}
                disabled={analyzing}
                onClick={handleRunAnalysis}
              >
                {analyzing ? 'Analyzing...' : hasAnalysis ? (isStale ? 'Run New Analysis' : 'Refresh Analysis') : 'Run Analysis'}
              </Button>
            </div>
          </div>

          {/* Stale Warning Banner */}
          {isStale && hasAnalysis && (
            <div className="p-4 rounded-card bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-amber-300">Carbon data has changed since this analysis was generated</h4>
                  <p className="text-xs text-text-secondary">
                    Activities or carbon emissions have been modified for {activeCompany?.name || 'this company'}. Run a new analysis to update recommendations.
                  </p>
                </div>
              </div>
              <Button
                variant="warning"
                size="sm"
                icon={RefreshCw}
                loading={analyzing}
                disabled={analyzing}
                onClick={handleRunAnalysis}
                className="shrink-0"
              >
                Run New Analysis
              </Button>
            </div>
          )}

          {/* Main Content Area */}
          {loading ? (
            <LoadingSpinner text="Loading saved carbon analysis..." />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchStoredAnalysis} />
          ) : !hasEnoughData ? (
            <Card className="text-center py-16 text-text-muted bg-carbon-card border-carbon-border">
              <Info className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-40" />
              <h4 className="text-base font-bold text-text-primary">Not Enough Carbon Activity Data</h4>
              <p className="text-xs text-text-secondary mt-1 max-w-md mx-auto">
                {noDataMessage || 'Not enough carbon activity data to generate an analysis. Add Scope 1, Scope 2, or Scope 3 activities to begin.'}
              </p>
            </Card>
          ) : !hasAnalysis || !analysis ? (
            <Card className="text-center py-16 px-6 bg-carbon-card border-carbon-border max-w-2xl mx-auto space-y-4 my-8">
              <div className="w-16 h-16 rounded-full bg-ai-badge/20 text-purple-400 border border-ai-badge/40 flex items-center justify-center mx-auto">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">No AI Analysis Generated Yet</h3>
                <p className="text-xs text-text-secondary mt-1 max-w-md mx-auto">
                  Click "Run Analysis" to generate an AI-powered sustainability analysis and decarbonization action plan for {activeCompany?.name || 'this company'}.
                </p>
              </div>
              <Button
                variant="ai"
                size="lg"
                icon={Sparkles}
                loading={analyzing}
                disabled={analyzing}
                onClick={handleRunAnalysis}
                className="mx-auto"
              >
                {analyzing ? 'Analyzing latest carbon data...' : 'Run Analysis'}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* A. Executive Summary */}
              <Card className="bg-gradient-to-br from-carbon-card via-carbon-surface to-carbon-card border-carbon-border p-6 space-y-3">
                <div className="flex items-center justify-between border-b border-carbon-border pb-3">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-purple-400" />
                    <h3 className="text-base font-bold text-text-primary">Executive Summary</h3>
                  </div>
                  <Badge variant={analysis.isAiFallback ? 'warning' : 'ai'} size="sm">
                    {analysis.isAiFallback ? 'Calculated Rule Analysis' :''}
                  </Badge>
                </div>
                <p className="text-sm text-text-primary leading-relaxed font-sans font-medium">
                  {analysis.summary}
                </p>
              </Card>

              {/* B. Carbon Snapshot Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-btn bg-carbon-card border border-carbon-border">
                  <span className="text-[10px] font-mono uppercase text-text-muted block">Total Emissions</span>
                  <span className="text-lg font-bold font-mono text-text-primary">
                    {formatEmissions(totals?.total || snapshot?.totalEmissions)}
                  </span>
                </div>

                <div className="p-3.5 rounded-btn bg-carbon-card border border-carbon-border">
                  <span className="text-[10px] font-mono uppercase text-text-muted block">Scope 1 (Direct)</span>
                  <span className="text-lg font-bold font-mono text-scope-1">
                    {formatEmissions(totals?.scope1 || snapshot?.scope1)}
                  </span>
                </div>

                <div className="p-3.5 rounded-btn bg-carbon-card border border-carbon-border">
                  <span className="text-[10px] font-mono uppercase text-text-muted block">Scope 2 (Energy)</span>
                  <span className="text-lg font-bold font-mono text-scope-2">
                    {formatEmissions(totals?.scope2 || snapshot?.scope2)}
                  </span>
                </div>

                <div className="p-3.5 rounded-btn bg-carbon-card border border-carbon-border">
                  <span className="text-[10px] font-mono uppercase text-text-muted block">Scope 3 (Supply)</span>
                  <span className="text-lg font-bold font-mono text-primary">
                    {formatEmissions(totals?.scope3 || snapshot?.scope3)}
                  </span>
                </div>

                <div className="p-3.5 rounded-btn bg-carbon-card border border-carbon-border">
                  <span className="text-[10px] font-mono uppercase text-text-muted block">Largest Scope</span>
                  <span className="text-xs font-bold text-text-primary truncate block mt-1 font-mono">
                    {snapshot?.largestScope || 'Scope 3'}
                  </span>
                </div>

                <div className="p-3.5 rounded-btn bg-carbon-card border border-carbon-border">
                  <span className="text-[10px] font-mono uppercase text-text-muted block">Active Suppliers</span>
                  <span className="text-lg font-bold font-mono text-text-primary">
                    {snapshot?.activeSuppliers || 0}
                  </span>
                </div>
              </div>

              {/* Grid Layout for Hotspots & Drivers */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* C. Key Carbon Hotspots */}
                <Card className="lg:col-span-7 bg-carbon-card border-carbon-border p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-carbon-border pb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      <h3 className="text-base font-bold text-text-primary">Key Carbon Hotspots</h3>
                    </div>
                    <span className="text-xs font-mono text-text-muted uppercase">Top Contributors</span>
                  </div>

                  <div className="space-y-3">
                    {(!analysis.hotspots || analysis.hotspots.length === 0) ? (
                      <p className="text-xs text-text-muted">No specific hotspots identified.</p>
                    ) : (
                      analysis.hotspots.map((hotspot, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-btn bg-carbon-surface border border-carbon-border flex items-center justify-between gap-3 hover:border-carbon-border/80 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-status-danger shrink-0" />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-text-primary">{hotspot.name}</h4>
                                {hotspot.type && (
                                  <Badge variant="outline" size="sm">
                                    {hotspot.type}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-text-secondary mt-0.5">{hotspot.reason}</p>
                            </div>
                          </div>

                          <div className="text-right font-mono shrink-0">
                            <span className="text-sm font-bold text-text-primary block">
                              {formatEmissions(hotspot.emissions)}
                            </span>
                            {hotspot.contributionPercent !== undefined && hotspot.contributionPercent !== null && (
                              <span className="text-[11px] text-text-muted">
                                {hotspot.contributionPercent}% of total
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                {/* D. Why These Are Hotspots (Drivers) */}
                <Card className="lg:col-span-5 bg-carbon-card border-carbon-border p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-carbon-border pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-status-warning" />
                      <h3 className="text-base font-bold text-text-primary">Hotspot Drivers</h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(!analysis.drivers || analysis.drivers.length === 0) ? (
                      <p className="text-xs text-text-muted">No driver analysis available.</p>
                    ) : (
                      analysis.drivers.map((driver, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-btn bg-carbon-surface/80 border border-carbon-border space-y-1 text-xs"
                        >
                          <span className="font-bold text-primary block">{driver.hotspot}</span>
                          <span className="text-text-secondary font-medium leading-relaxed block">{driver.reason}</span>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>

              {/* E. Recommended Actions (Expandable Details) */}
              <Card className="bg-carbon-card border-carbon-border p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-carbon-border pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-bold text-text-primary">Recommended Decarbonization Actions</h3>
                  </div>
                  <span className="text-xs font-mono text-text-muted uppercase">Structured & Actionable</span>
                </div>

                <div className="space-y-3">
                  {(!analysis.recommendations || analysis.recommendations.length === 0) ? (
                    <p className="text-xs text-text-muted">No specific recommendations available.</p>
                  ) : (
                    analysis.recommendations.map((rec, idx) => {
                      const prio = (rec.priority || 'Medium').toUpperCase();
                      const variantMap = {
                        HIGH: 'danger',
                        MEDIUM: 'warning',
                        LOW: 'success',
                      };
                      const isExpanded = !!expandedRecs[idx];

                      return (
                        <div
                          key={idx}
                          className="rounded-btn bg-carbon-surface border border-carbon-border overflow-hidden transition-all"
                        >
                          <div
                            onClick={() => toggleExpand(idx)}
                            className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-carbon-hover/50"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant={variantMap[prio] || 'warning'} size="sm">
                                {prio}
                              </Badge>
                              <div>
                                <h4 className="text-sm font-bold text-text-primary">{rec.title || rec.action}</h4>
                                <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{rec.action}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {rec.impact?.reduction > 0 && (
                                <Badge variant="primary" size="sm">
                                  -{formatEmissions(rec.impact.reduction)} ({rec.impact.percentage}%)
                                </Badge>
                              )}
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-text-muted" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-text-muted" />
                              )}
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="p-4 pt-0 border-t border-carbon-border/50 bg-carbon-card/50 space-y-3 text-xs">
                              {rec.current && rec.recommended && (rec.current.supplier || rec.recommended.supplier) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                  <div className="p-3 rounded bg-carbon-surface border border-carbon-border">
                                    <span className="text-[10px] font-mono uppercase text-text-muted block">Current Sourcing</span>
                                    <p className="font-bold text-text-primary text-sm mt-0.5">
                                      {rec.current.supplier || 'Current Baseline'}
                                    </p>
                                    <p className="text-text-secondary mt-1 font-mono">
                                      Emissions: {formatEmissions(rec.current.emissions)} <br />
                                      Intensity: {rec.current.carbonIntensity || 'N/A'}
                                    </p>
                                  </div>

                                  <div className="p-3 rounded bg-carbon-surface border border-primary/40">
                                    <span className="text-[10px] font-mono uppercase text-primary block">Recommended Alternative</span>
                                    <p className="font-bold text-primary text-sm mt-0.5">
                                      {rec.recommended.supplier || 'Alternative Option'}
                                    </p>
                                    <p className="text-text-secondary mt-1 font-mono">
                                      Emissions: {formatEmissions(rec.recommended.emissions)} <br />
                                      Intensity: {rec.recommended.carbonIntensity || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              )}

                              <div className="space-y-1">
                                <strong className="text-text-primary block font-mono">Actionable Recommendation:</strong>
                                <p className="text-text-secondary leading-relaxed">{rec.action}</p>
                              </div>

                              <div className="space-y-1">
                                <strong className="text-text-primary block font-mono">Verified Rationale:</strong>
                                <p className="text-text-secondary leading-relaxed">{rec.reason}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>

              {/* F. Supplier-Specific & Material Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Supplier Switching Card */}
                <Card className="bg-carbon-card border-carbon-border p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-carbon-border pb-3">
                    <div className="flex items-center gap-2">
                      <Repeat className="w-5 h-5 text-primary" />
                      <h3 className="text-base font-bold text-text-primary">Supplier Opportunities</h3>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    {(!analysis.supplierRecommendations || analysis.supplierRecommendations.length === 0) ? (
                      <p className="text-text-muted">No specific supplier transition opportunities identified.</p>
                    ) : (
                      analysis.supplierRecommendations.map((sRec, idx) => (
                        <div key={idx} className="p-4 rounded-btn bg-carbon-surface border border-carbon-border space-y-2">
                          <div className="flex items-center justify-between text-text-primary font-bold text-sm">
                            <span>{sRec.currentSupplier}</span>
                            <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-primary">{sRec.recommendedSupplier}</span>
                          </div>
                          <p className="text-text-secondary">{sRec.reason}</p>
                          {sRec.difference > 0 && (
                            <div className="text-[11px] font-mono text-primary font-bold pt-1">
                              Potential Reduction: -{formatEmissions(sRec.difference)}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                {/* Material & Transport Opportunities Card */}
                <Card className="bg-carbon-card border-carbon-border p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-carbon-border pb-3">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-secondary" />
                      <h3 className="text-base font-bold text-text-primary">Material & Transport Opportunities</h3>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    {analysis.materialRecommendations?.map((mRec, idx) => (
                      <div key={idx} className="p-3.5 rounded-btn bg-carbon-surface border border-carbon-border space-y-1">
                        <span className="font-bold text-text-primary block">
                          Evaluate {mRec.currentMaterial} → {mRec.alternativeMaterial}
                        </span>
                        <p className="text-text-secondary">{mRec.reason}</p>
                      </div>
                    ))}

                    {analysis.transportationOpportunities?.map((tRec, idx) => (
                      <div key={idx} className="p-3.5 rounded-btn bg-carbon-surface border border-carbon-border space-y-1">
                        <span className="font-bold text-secondary block">{tRec.activity}</span>
                        <p className="text-text-secondary">{tRec.reason}</p>
                      </div>
                    ))}

                    {(!analysis.materialRecommendations?.length && !analysis.transportationOpportunities?.length) && (
                      <p className="text-text-muted">No material/transportation substitution opportunities identified.</p>
                    )}
                  </div>
                </Card>
              </div>

              {/* I. Potential Impact Summary */}
              <Card className="bg-carbon-card border-carbon-border p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-carbon-border pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-bold text-text-primary">Total Decarbonization Potential</h3>
                  </div>
                </div>

                {analysis.potentialImpact && (analysis.potentialImpact.potentialReduction !== null || analysis.potentialImpact.percentageReduction !== null) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-btn bg-carbon-surface border border-carbon-border text-center space-y-1">
                      <span className="text-xs font-mono text-text-muted block">Current Emissions</span>
                      <span className="text-xl font-extrabold font-mono text-text-primary">
                        {formatEmissions(analysis.potentialImpact.currentEmissions || totals?.total)}
                      </span>
                    </div>

                    <div className="p-4 rounded-btn bg-carbon-surface border border-carbon-border text-center space-y-1">
                      <span className="text-xs font-mono text-text-muted block">Potential Reduction</span>
                      <span className="text-xl font-extrabold font-mono text-primary">
                        -{formatEmissions(analysis.potentialImpact.potentialReduction)}
                      </span>
                    </div>

                    <div className="p-4 rounded-btn bg-carbon-surface border border-carbon-border text-center space-y-1">
                      <span className="text-xs font-mono text-text-muted block">Projected Footprint</span>
                      <span className="text-xl font-extrabold font-mono text-primary">
                        {formatEmissions(analysis.potentialImpact.projectedEmissions)}
                      </span>
                    </div>

                    <div className="p-4 rounded-btn bg-carbon-surface border border-carbon-border text-center space-y-1">
                      <span className="text-xs font-mono text-text-muted block">Footprint Reduction %</span>
                      <span className="text-xl font-extrabold font-mono text-primary">
                        {analysis.potentialImpact.percentageReduction}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-btn bg-carbon-surface border border-carbon-border text-center text-xs text-text-muted font-mono">
                    Potential impact cannot be reliably estimated from the available data. (Use the <a href="/carbon-simulator" className="text-primary underline font-bold">Carbon Simulator</a> to run scenario calculations).
                  </div>
                )}
              </Card>

              {/* J & K. Priority Plan & Top Priority */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Priority Plan List */}
                <Card className="lg:col-span-6 bg-carbon-card border-carbon-border p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-carbon-border pb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary" />
                      <h3 className="text-base font-bold text-text-primary">Decarbonization Priority Plan</h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(!analysis.priorityPlan || analysis.priorityPlan.length === 0) ? (
                      <p className="text-xs text-text-muted">No priority plan items available.</p>
                    ) : (
                      analysis.priorityPlan.map((planItem, idx) => (
                        <div key={idx} className="p-3.5 rounded-btn bg-carbon-surface border border-carbon-border flex items-start gap-3 text-xs">
                          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold font-mono flex items-center justify-center shrink-0">
                            #{planItem.rank || idx + 1}
                          </span>
                          <div>
                            <h4 className="font-bold text-text-primary">{planItem.title}</h4>
                            <p className="text-text-secondary mt-0.5">{planItem.reason}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                {/* Top Priority Action Card */}
                {analysis.topPriority && (
                  <Card className="lg:col-span-6 bg-gradient-to-br from-primary/10 via-carbon-card to-carbon-surface border-2 border-primary/50 shadow-glow p-6 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider font-mono">
                        <Award className="w-5 h-5 text-primary" />
                        Top Priority Action
                      </div>
                      <h3 className="text-lg font-extrabold text-text-primary">
                        {analysis.topPriority.action}
                      </h3>
                      <div className="text-xs text-text-secondary leading-relaxed bg-carbon-surface/80 p-4 rounded-btn border border-carbon-border space-y-1">
                        <strong className="text-text-primary block font-mono">Why this matters:</strong>
                        <p>{analysis.topPriority.reason}</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Insights;
