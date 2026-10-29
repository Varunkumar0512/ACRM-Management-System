import { apiClient } from './client';

export const facultyApi = {
  listFaculty: async (params?: { department?: string; availableOnly?: boolean }) => {
    const res = await apiClient.get('/faculty', { params });
    return res.data.data;
  },

  getDashboard: async () => {
    const res = await apiClient.get('/faculty/dashboard');
    return res.data.data;
  },
};

export const supportApi = {
  createTicket: async (data: any) => {
    const res = await apiClient.post('/support', data);
    return res.data.data;
  },

  listTickets: async (params?: any) => {
    const res = await apiClient.get('/support', { params });
    return res.data.data;
  },

  getTicket: async (id: string) => {
    const res = await apiClient.get(`/support/${id}`);
    return res.data.data;
  },

  replyTicket: async (id: string, message: string) => {
    const res = await apiClient.post(`/support/${id}/reply`, { message });
    return res.data.data;
  },

  updateStatus: async (id: string, status: string) => {
    const res = await apiClient.patch(`/support/${id}/status`, { status });
    return res.data.data;
  },
};

export const adminApi = {
  getAnalytics: async () => {
    const res = await apiClient.get('/admin/analytics');
    return res.data.data;
  },

  listUsers: async (params?: any) => {
    const res = await apiClient.get('/admin/users', { params });
    return res.data.data;
  },

  toggleUserStatus: async (id: string) => {
    const res = await apiClient.patch(`/admin/users/${id}/toggle-status`);
    return res.data.data;
  },

  updateFaculty: async (id: string, data: any) => {
    const res = await apiClient.patch(`/admin/users/${id}/faculty`, data);
    return res.data.data;
  },

  updateUserRole: async (id: string, role: string) => {
    const res = await apiClient.patch(`/admin/users/${id}/role`, { role });
    return res.data.data;
  },

  getAuditLogs: async (params?: any) => {
    const res = await apiClient.get('/admin/audit-logs', { params });
    return res.data.data;
  },

  createDomain: async (data: any) => {
    const res = await apiClient.post('/admin/research/domains', data);
    return res.data.data;
  },

  createTopic: async (data: any) => {
    const res = await apiClient.post('/admin/research/topics', data);
    return res.data.data;
  },

  createPaper: async (data: any) => {
    const res = await apiClient.post('/admin/research/papers', data);
    return res.data.data;
  },

  createProjectIdea: async (data: any) => {
    const res = await apiClient.post('/admin/research/ideas', data);
    return res.data.data;
  },
};

export const notificationApi = {
  getNotifications: async () => {
    const res = await apiClient.get('/notifications');
    return res.data.data;
  },

  markAsRead: async (id: string) => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data.data;
  },

  markAllAsRead: async () => {
    const res = await apiClient.patch('/notifications/read-all');
    return res.data.data;
  },
};

export const searchApi = {
  search: async (q: string) => {
    const res = await apiClient.get('/search', { params: { q } });
    return res.data.data;
  },
};
