import axios from 'axios';
import { getSession } from 'next-auth/react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
});

axiosInstance.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.token?.accessToken) {
    config.headers['Authorization'] = `Bearer ${session.token.accessToken}`;
  }
  return config;
});

export interface CatalogueLoginResponse {
  authToken: string;
  redirectUrl: string;
}

export const catalogueApi = {
  login: async (): Promise<CatalogueLoginResponse> => {
    try {
      const response = await axiosInstance.post('/api/catalogue/login');
      return response.data;
    } catch (err: any) {
      // remonter le message du backend au lieu du « Request failed with status code ... »
      const backendMessage = err?.response?.data?.message;
      if (backendMessage) {
        throw new Error(`${backendMessage} (HTTP ${err?.response?.status})`);
      }
      throw err;
    }
  },
};