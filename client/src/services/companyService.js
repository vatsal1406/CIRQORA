import api from './api';

export const companyService = {
  getCompanies: async () => {
    return api.get('/companies');
  },

  getCompanyById: async (id) => {
    return api.get(`/companies/${id}`);
  },

  createCompany: async (companyData) => {
    return api.post('/companies', companyData);
  },
};
