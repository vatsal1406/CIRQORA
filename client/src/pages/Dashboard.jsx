import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Plus, RefreshCw, BarChart3, PieChart, Layers } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import MobileNav from '../components/layout/MobileNav';
import StatCard from '../components/dashboard/StatCard';
import HotspotList from '../components/dashboard/HotspotList';
import QuickInsight from '../components/dashboard/QuickInsight';
import ScopeDonut from '../charts/ScopeDonut';
import Scope3BarChart from '../charts/Scope3BarChart';
import SupplierHotspotChart from '../charts/SupplierHotspotChart';
import MaterialEmissionChart from '../charts/MaterialEmissionChart';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { SkeletonCard } from '../components/common/Skeleton';
import { useDashboard } from '../hooks/useDashboard';
import { useCompany } from '../hooks/useCompany';

const Dashboard = () => {
  const navigate = useNavigate();
  const { activeCompany } = useCompany();
  const { data, loading, error, refetch } = useDashboard();

  return (
    <div className="min-h-screen bg-carbon-bg text-text-primary flex">
      <Sidebar />
      <MobileNav />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar
          title="Carbon Intelligence Overview"
          subtitle={`Emissions breakdown for ${activeCompany?.name || 'Selected Company'}`}
        />

        <main className="flex-1 p-4 lg:p-8 space-y-8 overflow-y-auto">
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : !data || data.totalActivitiesCount === 0 ? (
            <div className="space-y-6">
              <EmptyState
                icon={Activity}
                title="No Carbon Activity Recorded Yet"
                description={`No carbon emissions activities recorded for ${activeCompany?.name || 'this company'}. Add your first activity raw entry to calculate and visualize your footprint.`}
                actionLabel="Add First Activity"
                onAction={() => navigate('/activities/new')}
              />
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              {/* Quick AI Insight Launcher Banner */}
              <QuickInsight />

              {/* KPI Metrics Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Emissions"
                  value={data.totals?.total}
                  subtitle={`${data.totalActivitiesCount} recorded activities`}
                  icon={Activity}
                />
                <StatCard
                  title="Scope 1 (Direct)"
                  value={data.totals?.scope1}
                  scope={1}
                  subtitle="Direct facility & fleet combustion"
                />
                <StatCard
                  title="Scope 2 (Energy)"
                  value={data.totals?.scope2}
                  scope={2}
                  subtitle="Purchased electricity & heating"
                />
                <StatCard
                  title="Scope 3 (Supply Chain)"
                  value={data.totals?.scope3}
                  scope={3}
                  subtitle="Upstream material & logistics"
                />
              </div>

              {/* D3 Charts Section - Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scope Donut Chart */}
                <Card className="space-y-4">
                  <div className="flex items-center justify-between border-b border-carbon-border pb-3">
                    <div className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-primary" />
                      <h3 className="text-base font-bold text-text-primary">
                        Scope 1, 2 & 3 Breakdown
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-text-muted">D3 Donut</span>
                  </div>
                  <ScopeDonut totals={data.totals} />
                </Card>

                {/* Scope 3 Category Breakdown Bar Chart */}
                <Card className="space-y-4">
                  <div className="flex items-center justify-between border-b border-carbon-border pb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-secondary" />
                      <h3 className="text-base font-bold text-text-primary">
                        Scope 3 Category Distribution
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-text-muted">D3 Horizontal Bar</span>
                  </div>
                  <Scope3BarChart categories={data.scope3Categories} />
                </Card>
              </div>

              {/* D3 Charts Section - Row 2 & Hotspots */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Supplier Hotspot Chart */}
                <Card className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between border-b border-carbon-border pb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-status-warning" />
                      <h3 className="text-base font-bold text-text-primary">
                        Supplier Footprint Ranking
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-text-muted">D3 Ranked Emissions</span>
                  </div>
                  <SupplierHotspotChart supplierEmissions={data.supplierEmissions} />
                </Card>

                {/* Material Emissions Chart */}
                <Card className="space-y-4">
                  <div className="flex items-center justify-between border-b border-carbon-border pb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      <h3 className="text-base font-bold text-text-primary">
                        Emissions by Material
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-text-muted">D3 Column</span>
                  </div>
                  <MaterialEmissionChart materialEmissions={data.materialEmissions} />
                </Card>
              </div>

              {/* Carbon Hotspots Summary List */}
              <HotspotList
                hotspots={data.hotspots}
                supplierEmissions={data.supplierEmissions}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
