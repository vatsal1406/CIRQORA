import React from 'react';
import { Sparkles, AlertCircle, Info, FileText } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

const InsightCard = ({ summary, isAiFallback = false }) => {
  return (
    <Card className="bg-gradient-to-br from-ai-bg/50 to-carbon-card border-ai-border/70 shadow-aiGlow space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-btn bg-ai-badge/20 text-purple-300 border border-ai-badge/40">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-base font-bold text-text-primary">Executive Summary</h3>
        </div>

        {isAiFallback ? (
          <Badge variant="warning" size="sm">
            Rule-Based Analytical Summary
          </Badge>
        ) : (
          <Badge variant="ai" size="sm">
            Gemini AI Generated
          </Badge>
        )}
      </div>

      {isAiFallback && (
        <div className="p-3 rounded-btn bg-status-warning/10 border border-status-warning/30 text-xs text-status-warning flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>AI analysis is currently unavailable. Showing backend-generated analytical insights.</span>
        </div>
      )}

      <div className="p-4 rounded-card bg-carbon-surface/80 border border-carbon-border text-sm text-text-primary leading-relaxed">
        {summary}
      </div>
    </Card>
  );
};

export default InsightCard;
