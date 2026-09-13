import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import MobileNav from '../components/layout/MobileNav';
import SupplierComparison from '../components/suppliers/SupplierComparison';
import { useCompany } from '../hooks/useCompany';

const SupplierCompare = () => {
  const { activeCompany } = useCompany();

  return (
    <div className="min-h-screen bg-carbon-bg text-text-primary flex">
      <Sidebar />
      <MobileNav />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar
          title="Compare Suppliers"
          subtitle={`Material sourcing intelligence for ${activeCompany?.name || 'Selected Company'}`}
        />

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
          <SupplierComparison />
        </main>
      </div>
    </div>
  );
};

export default SupplierCompare;
