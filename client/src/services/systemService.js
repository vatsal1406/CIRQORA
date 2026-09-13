import api from './api';

export const systemService = {
  getHealthStatus: async () => {
    return api.get('/health');
  },
};
