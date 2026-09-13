import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Users,
  GitCompare,
  Sparkles,
  Network,
  Settings,
  Leaf,
  PlusCircle,
  Sliders,
} from 'lucide-react';
import { useCompany } from '../../hooks/useCompany';

const Sidebar = () => {
  const { activeCompany } = useCompany();

  const navSections = [
    {
      label: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'OPERATIONS',
      items: [
        { name: 'Activities', path: '/activities', icon: Activity },
        { name: 'Suppliers', path: '/suppliers', icon: Users },
        { name: 'Compare Suppliers', path: '/suppliers/compare', icon: GitCompare },
      ],
    },
    {
      label: 'INTELLIGENCE',
      items: [
        { name: 'Carbon Simulator', path: '/carbon-simulator', icon: Sliders },
        { name: 'AI Analysis', path: '/insights', icon: Sparkles, isAi: true },
        { name: 'Supply Network', path: '/network', icon: Network },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        { name: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed top-0 left-0 bg-carbon-surface border-r border-carbon-border z-30 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-carbon-border">
        <div className="p-2 rounded-btn bg-primary/10 border border-primary/30 text-primary shadow-glow">
          <Leaf className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-wider text-text-primary flex items-center gap-1.5">
            CIRQORA
          </h1>
          <p className="text-[10px] uppercase font-mono tracking-widest text-text-muted">
            Carbon Intelligence
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-4 overflow-y-auto space-y-6">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <h2 className="px-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider font-mono">
              {section.label}
            </h2>
            <div className="space-y-0.5 mt-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? item.isAi
                            ? 'bg-ai-bg/80 text-purple-200 border border-ai-border/60 shadow-aiGlow'
                            : 'bg-primary/10 text-primary border border-primary/30 font-semibold shadow-glow'
                          : 'text-text-secondary hover:text-text-primary hover:bg-carbon-hover/70'
                      }`
                    }
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${item.isAi ? 'text-purple-400 group-hover:text-purple-300' : ''}`} />
                    <span>{item.name}</span>
                    {item.isAi && (
                      <span className="ml-auto px-1.5 py-0.5 text-[9px] uppercase font-mono font-bold rounded bg-ai-badge/30 text-purple-300 border border-ai-badge/40">
                        AI
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Active Company Footer */}
      <div className="p-4 border-t border-carbon-border bg-carbon-card/50">
        <div className="flex items-center justify-between text-xs">
          <div className="truncate pr-2">
            <p className="text-text-muted text-[10px] uppercase font-mono">Active Company</p>
            <p className="text-text-primary font-semibold truncate">
              {activeCompany ? activeCompany.name : 'Loading...'}
            </p>
          </div>
          <NavLink
            to="/activities/new"
            className="p-2 rounded-btn bg-primary text-text-inverted hover:bg-primary-hover transition-colors shrink-0 shadow-glow"
            title="Add Activity"
          >
            <PlusCircle className="w-4 h-4" />
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
