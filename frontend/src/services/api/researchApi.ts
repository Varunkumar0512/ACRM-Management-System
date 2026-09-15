import { apiClient } from './client';

export const researchApi = {
  getDomains: async () => {
    const res = await apiClient.get('/research/domains');
    return res.data.data;
  },

  getTopics: async (params?: any) => {
    const res = await apiClient.get('/research/topics', { params });
    return res.data.data;
  },

  getPapers: async (params?: any) => {
    const res = await apiClient.get('/research/papers', { params });
    return res.data.data;
  },

  getPaperDetails: async (id: string) => {
    const res = await apiClient.get(`/research/papers/${id}`);
    return res.data.data;
  },

  getProjectIdeas: async (params?: any) => {
    const res = await apiClient.get('/research/ideas', { params });
    return res.data.data;
  },

  toggleSaved: async (data: { itemType: 'PAPER' | 'TOPIC' | 'IDEA'; itemId: string; notes?: string }) => {
    const res = await apiClient.post('/research/saved', data);
    return res.data.data;
  },

  getSavedResearch: async () => {
    const res = await apiClient.get('/research/saved');
    return res.data.data;
  },

  getRecommendations: async () => {
    const res = await apiClient.get('/research/recommendations');
    return res.data.data;
  },
};
