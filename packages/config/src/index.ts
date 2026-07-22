export interface PlatformConfig {
  appName: string;
  environment: 'development' | 'staging' | 'production' | 'test';
  apiUrl: string;
  webUrl: string;
  ollamaBaseUrl: string;
  defaultModel: string;
}

export const DEFAULT_PLATFORM_CONFIG: PlatformConfig = {
  appName: 'Enterprise AI Platform',
  environment: 'development',
  apiUrl: 'http://localhost:4000',
  webUrl: 'http://localhost:3000',
  ollamaBaseUrl: 'http://localhost:11434',
  defaultModel: 'qwen2.5:7b',
};

export function getEnvVariable(key: string, defaultValue: string): string {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return defaultValue;
}
