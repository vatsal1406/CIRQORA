import api from './api';

export const aiService = {
  getStoredAnalysis: async (companyId) => {
    return api.get('/ai/analysis', { params: { companyId } });
  },

  analyzeEmissions: async (companyId = null) => {
    return api.post('/ai/analyze', { companyId });
  },
};
