import api from './axios';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  walletBalance: number;
  createdAt: string;
}

export const userApi = {
  // Get user profile with wallet balance
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/user/profile');
    return response.data;
  },
};

export default userApi;
