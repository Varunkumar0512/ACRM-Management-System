import { apiClient } from './client';

export const authApi = {
  signIn: async (data: any) => {
    const res = await apiClient.post('/auth/sign-in', data);
    return res.data.data;
  },

  signUpStudent: async (data: any) => {
    const res = await apiClient.post('/auth/sign-up/student', data);
    return res.data.data;
  },

  signUpFaculty: async (data: any) => {
    const res = await apiClient.post('/auth/sign-up/faculty', data);
    return res.data.data;
  },

  signOut: async () => {
    const res = await apiClient.post('/auth/sign-out');
    return res.data.data;
  },

  getCurrentUser: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data.data;
  },

  forgotPassword: async (email: string) => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data.data;
  },

  resetPassword: async (data: { token: string; newPassword: string }) => {
    const res = await apiClient.post('/auth/reset-password', data);
    return res.data.data;
  },

  verifyEmail: async (token: string) => {
    const res = await apiClient.get(`/auth/verify-email/${token}`);
    return res.data.data;
  },
};
