import api from './api';

export const activityService = {
  getActivities: async (params = {}) => {
    return api.get('/activities', { params });
  },

  getActivityById: async (id) => {
    return api.get(`/activities/${id}`);
  },

  createActivity: async (activityData) => {
    return api.post('/activities', activityData);
  },
};
