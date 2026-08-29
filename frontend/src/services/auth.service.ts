import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
  accessToken: string;
  refreshToken: string;
  message?: string;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const res = await api.post('/auth/refresh', { refreshToken });
    return res.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getMe(): Promise<{ user: AuthResponse['user'] }> {
    const res = await api.get('/auth/me');
    return res.data;
  },
};
