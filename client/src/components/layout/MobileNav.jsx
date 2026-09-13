import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Users,
  GitCompare,
  Sparkles,
  Network,
  Settings,
  Menu,
  X,
  Leaf,
} from 'lucide-react';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Activities', path: '/activities', icon: Activity },
    { name: 'Suppliers', path: '/suppliers', icon: Users },
    { name: 'Compare', path: '/suppliers/compare', icon: GitCompare },
    { name: 'AI Insights', path: '/insights', icon: Sparkles },
    { name: 'Supply Network', path: '/network', icon: Network },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="lg:hidden">
      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 h-14 bg-carbon-surface border-b border-carbon-border px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-btn bg-primary/10 border border-primary/30 text-primary">
            <Leaf className="w-4 h-4" />
          </div>
          <span className="font-bold text-text-primary text-base tracking-wider">CIRQORA</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-text-secondary hover:text-text-primary rounded-btn bg-carbon-card border border-carbon-border"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-carbon-bg/80 backdrop-blur-sm animate-fade-in"
        />
      )}

      {/* Slide-out Drawer */}
      <div
        className={`fixed top-14 left-0 bottom-0 z-50 w-64 bg-carbon-surface border-r border-carbon-border transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-btn text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/30 font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-carbon-hover'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
