import { useState, useEffect, useCallback } from 'react';
import { activityService } from '../services/activityService';
import { useCompany } from './useCompany';

export const useActivities = (initialFilters = {}) => {
  const { companyId } = useCompany();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchActivities = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const params = { companyId, ...filters };
      const res = await activityService.getActivities(params);
      if (res.success && Array.isArray(res.data)) {
        setActivities(res.data);
      }
    } catch (err) {
      console.error('[useActivities] Error fetching activities:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [companyId, filters]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return { activities, loading, error, filters, updateFilters, refetch: fetchActivities };
};
