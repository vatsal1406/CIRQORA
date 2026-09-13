import React from 'react';
import { Target, AlertCircle, ArrowUpRight } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

const RecommendationCard = ({
  supplierRecommendations = [],
  reductionOpportunities = [],
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Supplier Recommendations */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2 border-b border-carbon-border pb-3">
          <div className="p-2 rounded-btn bg-secondary/10 text-secondary border border-secondary/30">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Supplier Engagement & Trade-offs</h3>
            <p className="text-xs text-text-secondary">Targeted interventions for high-impact suppliers</p>
          </div>
        </div>

        <div className="space-y-3">
          {supplierRecommendations.length > 0 ? (
            supplierRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-card bg-carbon-surface border border-carbon-border space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary text-sm">{rec.supplier}</span>
                  <Badge variant="secondary" size="sm">Supplier Action</Badge>
                </div>
                <p className="text-xs font-semibold text-secondary">{rec.recommendation}</p>
                <p className="text-xs text-text-secondary">{rec.reason}</p>
                {rec.tradeoffs && rec.tradeoffs.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-carbon-border/60 flex items-start gap-1.5 text-[11px] text-text-muted">
                    <AlertCircle className="w-3.5 h-3.5 text-status-warning shrink-0 mt-0.5" />
                    <span>Trade-offs: {rec.tradeoffs.join(', ')}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-text-muted italic py-4">No supplier recommendations generated</p>
          )}
        </div>
      </Card>

      {/* Carbon Reduction Opportunities */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2 border-b border-carbon-border pb-3">
          <div className="p-2 rounded-btn bg-primary/10 text-primary border border-primary/30">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Carbon Reduction Opportunities</h3>
            <p className="text-xs text-text-secondary">Actionable initiatives across Scopes 1, 2, and 3</p>
          </div>
        </div>

        <div className="space-y-3">
          {reductionOpportunities.length > 0 ? (
            reductionOpportunities.map((opp, idx) => (
              <div
                key={idx}
                className="p-4 rounded-card bg-carbon-surface border border-carbon-border space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary text-sm">{opp.area}</span>
                  <Badge variant="primary" size="sm">Decarbonization</Badge>
                </div>
                <p className="text-xs font-semibold text-primary">{opp.recommendation}</p>
                <p className="text-xs text-text-secondary">{opp.reason}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-text-muted italic py-4">No reduction opportunities identified</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default RecommendationCard;
