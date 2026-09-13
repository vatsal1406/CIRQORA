import api from './api';

export const dashboardService = {
  getDashboard: async (companyId = null) => {
    const params = companyId ? { companyId } : {};
    return api.get('/dashboard', { params });
  },
};
