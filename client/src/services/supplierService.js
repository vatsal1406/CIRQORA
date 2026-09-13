import api from './api';

export const supplierService = {
  getSuppliers: async (companyId = null, all = false) => {
    const params = {};
    if (all) params.all = 'true';
    else if (companyId) params.companyId = companyId;
    return api.get('/suppliers', { params });
  },

  getSupplierById: async (id) => {
    return api.get(`/suppliers/${id}`);
  },

  createSupplier: async (supplierData) => {
    return api.post('/suppliers', supplierData);
  },

  compareSuppliers: async (material, companyId = null) => {
    const params = { material };
    if (companyId) params.companyId = companyId;
    return api.get('/suppliers/compare', { params });
  },
};
