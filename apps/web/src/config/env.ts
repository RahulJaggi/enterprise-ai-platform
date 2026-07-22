/**
 * Application Environment Variables Configuration
 */
export const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;
