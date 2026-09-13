import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import MobileNav from '../components/layout/MobileNav';
import CarbonSimulator from '../components/simulator/CarbonSimulator';
import { useCompany } from '../hooks/useCompany';

const CarbonSimulatorPage = () => {
  const { activeCompany } = useCompany();

  return (
    <div className="min-h-screen bg-carbon-bg text-text-primary flex">
      <Sidebar />
      <MobileNav />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar
          title="Carbon Reduction Simulator"
          subtitle={`Explore hypothetical supply-chain changes for ${activeCompany?.name || 'Selected Company'}`}
        />

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
          <CarbonSimulator />
        </main>
      </div>
    </div>
  );
};

export default CarbonSimulatorPage;
