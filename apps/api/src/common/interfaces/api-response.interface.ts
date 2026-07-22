export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: Record<string, unknown>[];
  traceId?: string;
}

export interface ApiResponseEnvelope<T> {
  success: boolean;
  data: T | null;
  error: ApiErrorDetail | null;
  timestamp: string;
}
