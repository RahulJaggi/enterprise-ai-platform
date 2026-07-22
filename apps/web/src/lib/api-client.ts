import axios from 'axios';
import { env } from '@/config/env';

/**
 * Enterprise Axios Client Instance
 */
export const apiClient = axios.create({
  baseURL: env.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor placeholder for Bearer tokens
apiClient.interceptors.request.use(
  (config) => {
    // Principal token injection placeholder
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// Response Interceptor placeholder for global error envelopes
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(error),
);
