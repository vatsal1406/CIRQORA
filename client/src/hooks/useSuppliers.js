import { useState, useEffect, useCallback } from 'react';
import { supplierService } from '../services/supplierService';

import { useCompany } from './useCompany';

export const useSuppliers = (options = {}) => {
  const { companyId } = useCompany();
  const fetchAll = typeof options === 'boolean' ? options : !!options.all;
  
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSuppliers = useCallback(async () => {
    if (!fetchAll && !companyId) {
      setSuppliers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await supplierService.getSuppliers(companyId, fetchAll);
      if (res.success && Array.isArray(res.data)) {
        setSuppliers(res.data);
      }
    } catch (err) {
      console.error('[useSuppliers] Error fetching suppliers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [companyId, fetchAll]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return { suppliers, loading, error, refetch: fetchSuppliers };
};
