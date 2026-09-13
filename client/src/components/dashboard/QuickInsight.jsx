import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, BrainCircuit, Sliders } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const QuickInsight = () => {
  const navigate = useNavigate();

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-ai-bg/60 to-carbon-card border-ai-border/60 shadow-aiGlow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-card bg-ai-badge/20 text-purple-300 border border-ai-badge/40 shrink-0">
            <BrainCircuit className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-purple-300">
                AI Carbon Analyst
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-ai-badge/30 text-purple-200 border border-ai-badge/40">
                Gemini Powered
              </span>
            </div>
            <h3 className="text-base font-bold text-text-primary mt-1">
              Run AI Supply Chain Carbon Analysis
            </h3>
            <p className="text-xs text-text-secondary mt-0.5 max-w-xl">
              Generate actionable insights on supplier hotspots, trade-offs, scope 3 reduction opportunities, and circular material sourcing.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            icon={Sliders}
            onClick={() => navigate('/carbon-simulator')}
          >
            Explore Simulator
          </Button>

          <Button
            variant="ai"
            size="md"
            icon={Sparkles}
            onClick={() => navigate('/insights')}
          >
            Run AI Analysis
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default QuickInsight;
