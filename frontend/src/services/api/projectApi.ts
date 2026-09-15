import { apiClient } from './client';

export const projectApi = {
  createProject: async (data: any) => {
    const res = await apiClient.post('/projects', data);
    return res.data.data;
  },

  listProjects: async (params?: any) => {
    const res = await apiClient.get('/projects', { params });
    return res.data.data;
  },

  getWorkspace: async (id: string) => {
    const res = await apiClient.get(`/projects/${id}`);
    return res.data.data;
  },

  updateProject: async (id: string, data: any) => {
    const res = await apiClient.patch(`/projects/${id}`, data);
    return res.data.data;
  },

  updateStatus: async (id: string, status: string, reason?: string) => {
    const res = await apiClient.patch(`/projects/${id}/status`, { status, reason });
    return res.data.data;
  },

  addMilestone: async (projectId: string, data: any) => {
    const res = await apiClient.post(`/projects/${projectId}/milestones`, data);
    return res.data.data;
  },

  updateMilestone: async (projectId: string, milestoneId: string, data: any) => {
    const res = await apiClient.patch(`/projects/${projectId}/milestones/${milestoneId}`, data);
    return res.data.data;
  },

  deleteMilestone: async (projectId: string, milestoneId: string) => {
    const res = await apiClient.delete(`/projects/${projectId}/milestones/${milestoneId}`);
    return res.data.data;
  },

  addComment: async (projectId: string, data: any) => {
    const res = await apiClient.post(`/projects/${projectId}/comments`, data);
    return res.data.data;
  },

  resolveComment: async (projectId: string, commentId: string) => {
    const res = await apiClient.patch(`/projects/${projectId}/comments/${commentId}/resolve`, {});
    return res.data.data;
  },

  submitReview: async (projectId: string, data: any) => {
    const res = await apiClient.post(`/projects/${projectId}/reviews`, data);
    return res.data.data;
  },

  respondToGuideRequest: async (projectId: string, status: 'ACCEPTED' | 'REJECTED', rejectionReason?: string) => {
    const res = await apiClient.post(`/projects/${projectId}/guide/respond`, { status, rejectionReason });
    return res.data.data;
  },

  addDocument: async (projectId: string, data: any) => {
    const res = await apiClient.post(`/projects/${projectId}/documents`, data);
    return res.data.data;
  },

  sendDiscussion: async (projectId: string, message: string) => {
    const res = await apiClient.post(`/projects/${projectId}/discussions`, { message });
    return res.data.data;
  },
};
