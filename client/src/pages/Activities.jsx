import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Activity as ActivityIcon } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import MobileNav from '../components/layout/MobileNav';
import ActivityTable from '../components/activities/ActivityTable';
import ActivityFilters from '../components/activities/ActivityFilters';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { SkeletonTable } from '../components/common/Skeleton';
import { useActivities } from '../hooks/useActivities';
import { useSuppliers } from '../hooks/useSuppliers';
import { useCompany } from '../hooks/useCompany';

const Activities = () => {
  const navigate = useNavigate();
  const { activeCompany } = useCompany();
  const { activities, loading, error, filters, updateFilters, refetch } = useActivities();
  const { suppliers } = useSuppliers();

  const resetFilters = () => {
    updateFilters({
      scope: '',
      material: '',
      supplierId: '',
      activityType: '',
    });
  };

  return (
    <div className="min-h-screen bg-carbon-bg text-text-primary flex">
      <Sidebar />
      <MobileNav />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar
          title="Carbon Activity Records"
          subtitle={`Emissions log for ${activeCompany?.name || 'Selected Company'}`}
        />

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-text-primary">Activity Audit Log</h2>
              <p className="text-xs text-text-secondary">
                Backend-calculated emissions records, scopes, and factor source attribution.
              </p>
            </div>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => navigate('/activities/new')}
            >
              Record New Activity
            </Button>
          </div>

          {/* Filters Bar */}
          <ActivityFilters
            filters={filters}
            onChange={updateFilters}
            onReset={resetFilters}
            suppliers={suppliers}
          />

          {/* Table / Loading / Error State */}
          {loading ? (
            <SkeletonTable rows={6} />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : activities.length === 0 ? (
            <EmptyState
              icon={ActivityIcon}
              title="No Activity Records Found"
              description="No carbon activities match your current filters or company selection."
              actionLabel="Add Activity"
              onAction={() => navigate('/activities/new')}
            />
          ) : (
            <ActivityTable activities={activities} />
          )}
        </main>
      </div>
    </div>
  );
};

export default Activities;
