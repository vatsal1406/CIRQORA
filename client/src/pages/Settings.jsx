import React from 'react';
import { Building2, Sliders } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import MobileNav from '../components/layout/MobileNav';
import Card from '../components/common/Card';
import { useCompany } from '../hooks/useCompany';

const Settings = () => {
  const { activeCompany } = useCompany();

  return (
    <div className="min-h-screen bg-carbon-bg text-text-primary flex">
      <Sidebar />
      <MobileNav />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar
          title="Settings"
          subtitle="Organization profile and application preferences"
        />

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto max-w-5xl">
          {/* Active Company Profile */}
          <Card className="space-y-4">
            <div className="flex items-center gap-3 border-b border-carbon-border pb-3">
              <div className="p-2.5 rounded-btn bg-primary/10 border border-primary/30 text-primary">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">Organization Profile</h3>
                <p className="text-xs text-text-secondary">Selected company information and workspace details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-3.5 rounded-btn bg-carbon-surface border border-carbon-border">
                <span className="text-text-muted text-[10px] uppercase block mb-1">Company Name</span>
                <span className="font-bold text-text-primary text-sm font-sans">{activeCompany?.name || 'N/A'}</span>
              </div>

              <div className="p-3.5 rounded-btn bg-carbon-surface border border-carbon-border">
                <span className="text-text-muted text-[10px] uppercase block mb-1">Industry Sector</span>
                <span className="font-bold text-text-primary text-sm font-sans">{activeCompany?.industry || 'N/A'}</span>
              </div>

              <div className="p-3.5 rounded-btn bg-carbon-surface border border-carbon-border">
                <span className="text-text-muted text-[10px] uppercase block mb-1">Location</span>
                <span className="font-bold text-text-primary text-sm font-sans">{activeCompany?.location || 'Not Specified'}</span>
              </div>
            </div>
          </Card>

          {/* Application Preferences */}
          <Card className="space-y-4">
            <div className="flex items-center gap-3 border-b border-carbon-border pb-3">
              <div className="p-2.5 rounded-btn bg-secondary/10 border border-secondary/30 text-secondary">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">Application Preferences</h3>
                <p className="text-xs text-text-secondary">Default reporting standards and measurement units</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
              <div className="p-3.5 rounded-btn bg-carbon-surface border border-carbon-border space-y-1">
                <span className="text-text-muted text-[10px] uppercase font-mono block">GHG Protocol Standard</span>
                <span className="font-bold text-text-primary block">Corporate Value Chain (Scope 1, 2, 3)</span>
              </div>

              <div className="p-3.5 rounded-btn bg-carbon-surface border border-carbon-border space-y-1">
                <span className="text-text-muted text-[10px] uppercase font-mono block">Primary Mass Unit</span>
                <span className="font-bold text-text-primary block">Metric Tonnes CO₂e (tCO₂e)</span>
              </div>

              <div className="p-3.5 rounded-btn bg-carbon-surface border border-carbon-border space-y-1">
                <span className="text-text-muted text-[10px] uppercase font-mono block">Distance Unit</span>
                <span className="font-bold text-text-primary block">Kilometers (km)</span>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Settings;

