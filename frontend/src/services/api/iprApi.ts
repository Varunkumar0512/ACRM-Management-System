import { apiClient } from './client';

export const iprApi = {
  // Novelty Screening
  runScreening: async (data: any) => {
    const res = await apiClient.post('/ipr/novelty/screen', data);
    return res.data.data;
  },

  sendChatMessage: async (data: { projectId: string; screeningId?: string; message: string; innovationContext?: any }) => {
    const res = await apiClient.post('/ipr/novelty/chat', data);
    return res.data.data;
  },

  acknowledgeScreening: async (id: string) => {
    const res = await apiClient.post(`/ipr/novelty/${id}/acknowledge`, { acknowledged: true });
    return res.data.data;
  },

  getProjectScreenings: async (projectId: string) => {
    const res = await apiClient.get(`/ipr/novelty/history/${projectId}`);
    return res.data.data;
  },

  getScreeningById: async (id: string) => {
    const res = await apiClient.get(`/ipr/novelty/${id}`);
    return res.data.data;
  },

  // IPR Disclosures & Review
  submitDisclosure: async (data: any) => {
    const res = await apiClient.post('/ipr/disclosures', data);
    return res.data.data;
  },

  getDisclosures: async (params?: { category?: string; status?: string; projectId?: string; mineOnly?: boolean; limit?: number; skip?: number }) => {
    const res = await apiClient.get('/ipr/disclosures', { params });
    return res.data.data;
  },

  getDisclosureById: async (id: string) => {
    const res = await apiClient.get(`/ipr/disclosures/${id}`);
    return res.data.data;
  },

  updateStatus: async (id: string, status: string, notes?: string) => {
    const res = await apiClient.patch(`/ipr/disclosures/${id}/status`, { status, notes });
    return res.data.data;
  },

  addComment: async (id: string, data: { message: string; relatedSection?: string; parentCommentId?: string }) => {
    const res = await apiClient.post(`/ipr/disclosures/${id}/comments`, data);
    return res.data.data;
  },

  resolveComment: async (id: string, commentId: string) => {
    const res = await apiClient.patch(`/ipr/disclosures/${id}/comments/${commentId}/resolve`);
    return res.data.data;
  },

  addDocument: async (id: string, data: { originalName: string; filename: string; type?: string; description?: string }) => {
    const res = await apiClient.post(`/ipr/disclosures/${id}/documents`, data);
    return res.data.data;
  },

  recordApplication: async (id: string, data: any) => {
    const res = await apiClient.post(`/ipr/disclosures/${id}/applications`, data);
    return res.data.data;
  },
};
