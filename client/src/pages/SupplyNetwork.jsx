import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import MobileNav from '../components/layout/MobileNav';
import SupplyNetworkGraph from '../charts/SupplyNetworkGraph';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import { useSuppliers } from '../hooks/useSuppliers';
import { useActivities } from '../hooks/useActivities';
import { useDashboard } from '../hooks/useDashboard';
import { useCompany } from '../hooks/useCompany';

const SupplyNetwork = () => {
  const { activeCompany } = useCompany();
  const { suppliers, loading: supLoading } = useSuppliers();
  const { activities, loading: actLoading } = useActivities();
  const { data: dashboardData, loading: dashLoading, error, refetch } = useDashboard();

  const loading = supLoading || actLoading || dashLoading;

  return (
    <div className="min-h-screen bg-carbon-bg text-text-primary flex">
      <Sidebar />
      <MobileNav />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar
          title="Interactive Supply Chain Network"
          subtitle={`Node relationships and emissions for ${activeCompany?.name || 'Selected Company'}`}
        />

        <main className="flex-1 p-4 lg:p-8 space-y-4 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-text-primary">Supply Ecosystem Graph</h2>
              <p className="text-xs text-text-secondary">
                Drag nodes, zoom, or hover over connections to inspect carbon impact across your tier-1 network.
              </p>
            </div>
          </div>

          <div className="flex-1 min-h-[600px] relative">
            {loading ? (
              <LoadingSpinner text="Building D3 force-directed supply chain network..." />
            ) : error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : (
              <SupplyNetworkGraph
                company={dashboardData?.company}
                suppliers={dashboardData?.supplierEmissions || suppliers}
                activities={activities}
                height={650}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SupplyNetwork;
