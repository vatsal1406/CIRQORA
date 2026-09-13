import api from './api';

export const simulationService = {
  getOptions: async (companyId, material = 'Aluminium') => {
    return api.get('/simulations/options', {
      params: { companyId, material },
    });
  },

  calculateReduction: async (payload) => {
    return api.post('/simulations/carbon-reduction', payload);
  },
};
