import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Plus, ChevronDown, Sparkles } from 'lucide-react';
import { useCompany } from '../../hooks/useCompany';

const Topbar = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const { companies, companyId, selectCompany, activeCompany } = useCompany();

  return (
    <header className="sticky top-0 z-20 w-full h-16 bg-carbon-surface/90 backdrop-blur-md border-b border-carbon-border px-4 lg:px-8 flex items-center justify-between">
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-lg font-bold text-text-primary tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-xs text-text-secondary hidden sm:block">{subtitle}</p>
        )}
      </div>

      {/* Right Actions & Company Switcher */}
      <div className="flex items-center gap-3">
        {/* Company Dropdown */}
        <div className="relative flex items-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-btn bg-carbon-card border border-carbon-border text-xs text-text-primary focus-within:border-primary">
            <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <select
              value={companyId || ''}
              onChange={(e) => selectCompany(e.target.value)}
              className="bg-transparent text-text-primary text-xs font-medium focus:outline-none cursor-pointer pr-4 appearance-none"
            >
              {companies.map((c) => (
                <option key={c._id} value={c._id} className="bg-carbon-card text-text-primary">
                  {c.name} {c.industry ? `(${c.industry})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-text-muted pointer-events-none -ml-4" />
          </div>
        </div>

        {/* Setup New Company CTA */}
        <Link
          to="/setup"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn border border-carbon-border bg-carbon-hover/50 hover:bg-carbon-hover text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <Building2 className="w-3.5 h-3.5 text-secondary" />
          <span>New Company</span>
        </Link>

        {/* AI Insights Link */}
        <Link
          to="/insights"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-ai-bg/60 border border-ai-border/80 text-xs font-medium text-purple-200 hover:bg-ai-bg transition-colors shadow-aiGlow"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>AI Analyst</span>
        </Link>

        {/* Add Activity CTA */}
        <button
          onClick={() => navigate('/activities/new')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-btn bg-primary text-text-inverted hover:bg-primary-hover font-semibold text-xs transition-colors shadow-glow"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Activity</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
