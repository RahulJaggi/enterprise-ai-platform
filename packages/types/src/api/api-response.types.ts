export interface ErrorResponseDetail {
  code: string;
  message: string;
  details?: Record<string, unknown>[];
  traceId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ErrorResponseDetail | null;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}
