/**
 * Application Environment Variables Configuration
 */
export const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
  APP_NAME: 'Enterprise AI Platform',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;
