import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import MobileNav from '../components/layout/MobileNav';
import SupplierCard from '../components/suppliers/SupplierCard';
import SupplierForm from '../components/suppliers/SupplierForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { SkeletonCard } from '../components/common/Skeleton';
import { useSuppliers } from '../hooks/useSuppliers';
import { useDashboard } from '../hooks/useDashboard';
import { useCompany } from '../hooks/useCompany';

const Suppliers = () => {
  const { activeCompany } = useCompany();
  const { suppliers, loading, error, refetch } = useSuppliers();
  const { data: dashboardData } = useDashboard();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Map supplier ID to aggregated emissions if present
  const supplierEmissionsMap = React.useMemo(() => {
    const map = {};
    if (dashboardData?.supplierEmissions && Array.isArray(dashboardData.supplierEmissions)) {
      dashboardData.supplierEmissions.forEach((s) => {
        if (s.supplierId) map[s.supplierId] = s.totalEmissions;
      });
    }
    return map;
  }, [dashboardData]);

  return (
    <div className="min-h-screen bg-carbon-bg text-text-primary flex">
      <Sidebar />
      <MobileNav />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar
          title="Supply Chain Partners"
          subtitle={`Supplier network for ${activeCompany?.name || 'Selected Company'}`}
        />

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-text-primary">Suppliers Directory</h2>
              <p className="text-xs text-text-secondary">
                Registered tier-1 suppliers, material offerings, unit cost, and carbon footprints.
              </p>
            </div>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add New Supplier
            </Button>
          </div>

          {/* Suppliers Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : suppliers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Suppliers Found"
              description="No suppliers registered in your database yet."
              actionLabel="Add First Supplier"
              onAction={() => setIsAddModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {suppliers.map((sup) => (
                <SupplierCard
                  key={sup._id}
                  supplier={sup}
                  totalEmissions={supplierEmissionsMap[sup._id]}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Supplier"
        subtitle="Register a supply partner in MongoDB"
      >
        <SupplierForm
          onSuccess={() => {
            setIsAddModalOpen(false);
            refetch();
          }}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Suppliers;
