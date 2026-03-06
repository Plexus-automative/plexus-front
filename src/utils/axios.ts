import axios, { AxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';

const axiosServices = axios.create({ baseURL: process.env.NEXT_APP_API_URL });

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

/**
 * Request interceptor to add Authorization token to request
 */
axiosServices.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.token?.accessToken) {
      config.headers['Authorization'] = `Bearer ${session.token.accessToken}`;
    }

    // Pass user identifiers to the backend for data filtering
    if (session?.user) {
      const user = session.user as any;
      if (user.customerNo) {
        config.headers['X-Customer-No'] = user.customerNo;
      }
      if (user.vendorNo) {
        config.headers['X-Vendor-No'] = user.vendorNo;
      }
    }

    console.log("====== FRONTEND AXIOS INTERCEPTOR LOG ======");
    console.log("User session data:", session?.user);
    console.log("Headers being sent:", config.headers);
    console.log("URL being requested:", config.url);
    console.log("============================================");

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

if (typeof window !== 'undefined') {
  axiosServices.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response.status === 401 && !window.location.href.includes('/login')) {
        await signOut();
        window.location.pathname = '/login';
      }
      return Promise.reject((error.response && error.response.data) || 'Wrong Services');
    }
  );
}

export default axiosServices;

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.get(url, { ...config });

  return res.data;
};

export const fetcherPost = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.post(url, { ...config });

  return res.data;
};
