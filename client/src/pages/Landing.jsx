import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, ArrowRight, ShieldCheck, Sparkles, Network, GitCompare, Activity } from 'lucide-react';
import Button from '../components/common/Button';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-carbon-bg text-text-primary flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-btn bg-primary/10 border border-primary/30 text-primary shadow-glow">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-text-primary flex items-center gap-1.5">
              CIRQORA
            </h1>
            <p className="text-[10px] uppercase font-mono tracking-widest text-text-muted">
              Carbon Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/setup"
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors hidden sm:block"
          >
            Setup Company
          </Link>
          <Button
            variant="primary"
            size="md"
            icon={ArrowRight}
            onClick={() => navigate('/dashboard')}
          >
            Explore Dashboard
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 relative overflow-hidden">
        {/* Abstract Glowing Backdrop Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-[400px] h-[250px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl space-y-8 z-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-badge bg-carbon-card border border-carbon-border text-xs font-mono text-primary shadow-card">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Scope 1, 2 & 3 Carbon Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text-primary leading-tight">
            Carbon Intelligence for <br />
            <span className="gradient-text-primary">Circular Supply Chains</span>
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Track carbon emissions with backend-authoritative accuracy. Identify supplier hotspots, compare lower-carbon sourcing, and drive circular decarbonization.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              onClick={() => navigate('/dashboard')}
            >
              Explore Dashboard
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/setup')}
            >
              Get Started / Add Company
            </Button>
          </div>

          {/* Abstract Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-12 text-left">
            <div className="p-5 rounded-card bg-carbon-surface/80 border border-carbon-border backdrop-blur space-y-2">
              <div className="p-2 rounded-btn bg-scope-1/10 text-scope-1 w-fit border border-scope-1/30">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-text-primary text-base">Scope 1, 2 & 3</h3>
              <p className="text-xs text-text-secondary">
                Backend classification engine automatically categorizes raw activity inputs.
              </p>
            </div>

            <div className="p-5 rounded-card bg-carbon-surface/80 border border-carbon-border backdrop-blur space-y-2">
              <div className="p-2 rounded-btn bg-secondary/10 text-secondary w-fit border border-secondary/30">
                <GitCompare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-text-primary text-base">Supplier Comparison</h3>
              <p className="text-xs text-text-secondary">
                Evaluate suppliers across materials like Aluminium, Copper, and Steel on cost vs. carbon impact.
              </p>
            </div>

            <div className="p-5 rounded-card bg-carbon-surface/80 border border-carbon-border backdrop-blur space-y-2">
              <div className="p-2 rounded-btn bg-ai-badge/20 text-purple-300 w-fit border border-ai-badge/40">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-bold text-text-primary text-base">AI Carbon Analyst</h3>
              <p className="text-xs text-text-secondary">
                Gemini-powered insights highlighting hotspots, trade-offs, and reduction opportunities.
              </p>
            </div>

            <div className="p-5 rounded-card bg-carbon-surface/80 border border-carbon-border backdrop-blur space-y-2">
              <div className="p-2 rounded-btn bg-primary/10 text-primary w-fit border border-primary/30">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-text-primary text-base">Supply Network</h3>
              <p className="text-xs text-text-secondary">
                Interactive D3 force-directed visualizer mapping real company-to-supplier node graph.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-carbon-border flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-2">
        <div className="flex items-center gap-2 font-mono">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>CIRQORA Carbon Accounting Engine &bull; Backend Source of Truth</span>
        </div>
        <p>&copy; {new Date().getFullYear()} CIRQORA. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
