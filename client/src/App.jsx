import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CompanyProvider } from './context/CompanyContext';

// Pages
import Landing from './pages/Landing';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import AddActivity from './pages/AddActivity';
import Suppliers from './pages/Suppliers';
import SupplierCompare from './pages/SupplierCompare';
import Insights from './pages/Insights';
import SupplyNetwork from './pages/SupplyNetwork';
import Settings from './pages/Settings';
import CarbonSimulatorPage from './pages/CarbonSimulatorPage';

const App = () => {
  return (
    <CompanyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/activities/new" element={<AddActivity />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/suppliers/compare" element={<SupplierCompare />} />
          <Route path="/carbon-simulator" element={<CarbonSimulatorPage />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/network" element={<SupplyNetwork />} />
          <Route path="/settings" element={<Settings />} />

          {/* Fallback wildcard route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </CompanyProvider>
  );
};

export default App;
