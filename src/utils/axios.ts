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

const axiosServices = axios.create({
  baseURL: cleanBaseURL,
  timeout: 90000 // 90s default timeout for all requests
});

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



    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Detect BC timeout errors (from reactive WebClient)
const isBCTimeoutError = (error: any): boolean => {
  const data = error?.response?.data;
  const dataStr = typeof data === 'string' ? data : (data && data.toString ? data.toString() : '');
  const msg = error?.message || '';
  return (
    /Timeout on blocking read/.test(dataStr) ||
    /NANOSECONDS/.test(dataStr) ||
    /timeout/i.test(msg) ||
    error?.code === 'ECONNABORTED'
  );
};

if (typeof window !== 'undefined') {
  axiosServices.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config as AxiosRequestConfig & { __retryCount?: number };

      if (error.response?.status === 401 && !window.location.href.includes('/login')) {
        await signOut();
        window.location.pathname = '/login';
        return Promise.reject((error.response && error.response.data) || 'Wrong Services');
      }

      // Retry GET requests on BC timeouts (up to 2 retries with backoff)
      const isGet = (config?.method || 'get').toLowerCase() === 'get';
      const isRetryable = isGet && isBCTimeoutError(error);
      if (config && isRetryable) {
        config.__retryCount = config.__retryCount ?? 0;
        if (config.__retryCount < 2) {
          config.__retryCount += 1;
          const delay = 1000 * config.__retryCount; // 1s, 2s
          await new Promise((resolve) => setTimeout(resolve, delay));
          return axiosServices.request(config);
        }
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
