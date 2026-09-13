import React, { createContext, useState, useEffect, useCallback } from 'react';
import { companyService } from '../services/companyService';

export const CompanyContext = createContext(null);

const DEFAULT_COMPANY_ID = '6aa51c6039c5bbbd610690b0';

export const CompanyProvider = ({ children }) => {
  const [companyId, setCompanyId] = useState(() => {
    return localStorage.getItem('cirqora_company_id') || DEFAULT_COMPANY_ID;
  });
  const [activeCompany, setActiveCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await companyService.getCompanies();
      if (res.success && Array.isArray(res.data)) {
        setCompanies(res.data);

        // Find active company match
        const found = res.data.find((c) => c._id === companyId);
        if (found) {
          setActiveCompany(found);
        } else if (res.data.length > 0) {
          // Fallback to first available company if stored ID is invalid
          setActiveCompany(res.data[0]);
          setCompanyId(res.data[0]._id);
          localStorage.setItem('cirqora_company_id', res.data[0]._id);
        } else {
          setActiveCompany(null);
        }
      }
    } catch (err) {
      console.error('[CompanyContext] Error fetching companies:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const selectCompany = (id) => {
    setCompanyId(id);
    localStorage.setItem('cirqora_company_id', id);
    const found = companies.find((c) => c._id === id);
    if (found) {
      setActiveCompany(found);
    }
  };

  const addCompany = (newCompany) => {
    setCompanies((prev) => [newCompany, ...prev]);
    selectCompany(newCompany._id);
  };

  return (
    <CompanyContext.Provider
      value={{
        companyId,
        activeCompany,
        companies,
        loading,
        error,
        selectCompany,
        addCompany,
        refreshCompanies: fetchCompanies,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};
