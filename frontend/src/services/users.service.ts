import api from './api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export const usersService = {
  async getProfile(): Promise<UserProfile> {
    const res = await api.get('/users/profile');
    return res.data.user;
  },

  async updateProfile(data: { name?: string; email?: string }): Promise<UserProfile> {
    const res = await api.put('/users/profile', data);
    return res.data.user;
  },
};
