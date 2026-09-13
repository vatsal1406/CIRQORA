import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import MobileNav from '../components/layout/MobileNav';
import ActivityForm from '../components/activities/ActivityForm';
import Button from '../components/common/Button';
import { useSuppliers } from '../hooks/useSuppliers';
import { useCompany } from '../hooks/useCompany';

const AddActivity = () => {
  const navigate = useNavigate();
  const { activeCompany } = useCompany();
  const { suppliers } = useSuppliers(true);

  return (
    <div className="min-h-screen bg-carbon-bg text-text-primary flex">
      <Sidebar />
      <MobileNav />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar
          title="Record Carbon Activity"
          subtitle={`Add raw parameters for ${activeCompany?.name || 'Selected Company'}`}
        />

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={ArrowLeft}
              onClick={() => navigate('/activities')}
            >
              Back to Activities
            </Button>
          </div>

          <ActivityForm
            suppliers={suppliers}
            onSuccess={() => {
              // ActivityForm renders its own receipt state
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default AddActivity;
