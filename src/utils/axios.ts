import axios, { AxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';

const isServer = typeof window === 'undefined';
const baseURL = isServer
  ? (process.env.NEXT_APP_INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_APP_API_URL)
  : (process.env.NEXT_PUBLIC_BACKEND_URL || '');

// Basic URL normalization to fix common typos like http:/ instead of http://
const normalizeBaseURL = (url: string | undefined) => {
  if (!url) return '';
  // Fix protocol if it has only one slash instead of two
  let normalized = url.replace(/^(https?):\/([^\/])/, '$1://$2');
  // Ensure no trailing slash
  return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
};

const cleanBaseURL = normalizeBaseURL(baseURL);

const axiosServices = axios.create({ baseURL: cleanBaseURL });

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
