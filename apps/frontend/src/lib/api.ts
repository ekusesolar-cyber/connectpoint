import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: string }>) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken && error.config && !(error.config as Record<string, boolean>)._retry) {
        (error.config as Record<string, boolean>)._retry = true;
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefresh } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefresh);
          error.config!.headers.Authorization = `Bearer ${accessToken}`;
          return api(error.config!);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }

    const message = error.response?.data?.error || error.message || 'An error occurred';
    if (typeof window !== 'undefined' && error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;

export const apiEndpoints = {
  auth: {
    register: (data: { email: string; password: string; fullName: string }) => api.post('/auth/register', data),
    login: (data: { email: string; password: string }) => api.post('/auth/login', data),
    refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
    logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
    me: () => api.get('/auth/me'),
    forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  },
  owner: {
    dashboard: () => api.get('/owner/dashboard'),
    updateProfile: (data: { fullName?: string; phone?: string }) => api.put('/owner/profile', data),
    kyc: { get: () => api.get('/owner/kyc'), submit: (data: Record<string, unknown>) => api.post('/owner/kyc', data) },
    hotspots: {
      list: () => api.get('/owner/hotspots'),
      create: (data: Record<string, unknown>) => api.post('/owner/hotspots', data),
      get: (id: string) => api.get(`/owner/hotspots/${id}`),
      update: (id: string, data: Record<string, unknown>) => api.put(`/owner/hotspots/${id}`, data),
      delete: (id: string) => api.delete(`/owner/hotspots/${id}`),
    },
    packages: {
      list: (hotspotId?: string) => api.get('/owner/packages', { params: { hotspotId } }),
      create: (data: Record<string, unknown>) => api.post('/owner/packages', data),
      update: (id: string, data: Record<string, unknown>) => api.put(`/owner/packages/${id}`, data),
      delete: (id: string) => api.delete(`/owner/packages/${id}`),
    },
    vouchers: {
      generate: (data: Record<string, unknown>) => api.post('/owner/vouchers/generate', data),
      list: (hotspotId: string, page = 1) => api.get('/owner/vouchers', { params: { hotspotId, page } }),
    },
    sessions: {
      active: (hotspotId?: string) => api.get('/owner/sessions/active', { params: { hotspotId } }),
      disconnect: (id: string) => api.post(`/owner/sessions/${id}/disconnect`),
    },
    customers: { block: (data: { macAddress: string }) => api.post('/owner/customers/block', data) },
    revenue: (days = 30) => api.get('/owner/revenue', { params: { days } }),
    transactions: (page = 1) => api.get('/owner/transactions', { params: { page } }),
    reports: { usage: (days = 7) => api.get('/owner/reports/usage', { params: { days } }) },
    withdrawals: {
      list: () => api.get('/owner/withdrawals'),
      request: (data: Record<string, unknown>) => api.post('/owner/withdrawals', data),
    },
  },
  admin: {
    dashboard: () => api.get('/admin/dashboard'),
    owners: { list: (params?: Record<string, unknown>) => api.get('/admin/owners', { params }) },
    kyc: {
      pending: () => api.get('/admin/kyc/pending'),
      approve: (id: string) => api.put(`/admin/kyc/${id}/approve`),
      reject: (id: string, reason: string) => api.put(`/admin/kyc/${id}/reject`, { reason }),
    },
    hotspots: (params?: Record<string, unknown>) => api.get('/admin/hotspots', { params }),
    transactions: (params?: Record<string, unknown>) => api.get('/admin/transactions', { params }),
    commission: {
      get: () => api.get('/admin/commission'),
      set: (commission: number) => api.put('/admin/commission', { commission }),
    },
    subscriptions: {
      list: () => api.get('/admin/subscriptions'),
      update: (id: string, data: Record<string, unknown>) => api.put(`/admin/subscriptions/${id}`, data),
    },
    analytics: () => api.get('/admin/analytics'),
    auditLogs: (page = 1) => api.get('/admin/audit-logs', { params: { page } }),
  },
  portal: {
    info: (hotspotId: string) => api.get(`/portal/${hotspotId}/info`),
    packages: (hotspotId: string) => api.get(`/portal/${hotspotId}/packages`),
    voucherLogin: (hotspotId: string, data: { code: string; pin?: string; macAddress?: string }) =>
      api.post(`/portal/${hotspotId}/login/voucher`, data),
    purchase: (hotspotId: string, data: { packageId: string; customerEmail?: string; customerPhone?: string; redirectUrl?: string }) =>
      api.post(`/portal/${hotspotId}/purchase`, data),
    sessionStatus: (hotspotId: string, sessionId: string) =>
      api.get(`/portal/${hotspotId}/sessions/${sessionId}`),
    terms: (hotspotId: string, accepted: boolean) =>
      api.post(`/portal/${hotspotId}/terms`, { accepted }),
    ad: (hotspotId: string) => api.get(`/portal/${hotspotId}/ad`),
  },
  payments: {
    initialize: (data: Record<string, unknown>) => api.post('/payments/initialize', data),
    verify: (reference: string) => api.get(`/payments/verify/${reference}`),
  },
};
