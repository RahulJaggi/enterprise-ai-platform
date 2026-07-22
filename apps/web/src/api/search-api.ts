import { apiClient } from '@/lib/api-client';

export interface SearchResultChunk {
  score: number;
  chunkId: string;
  documentId: string;
  filename: string;
  pageNumber: number;
  chunkIndex: number;
  content: string;
}

export interface SearchResponseData {
  query: string;
  totalMatches: number;
  executionTimeMs: number;
  results: SearchResultChunk[];
}

export interface SearchApiResponse {
  success: boolean;
  data: SearchResponseData | null;
  error: {
    code: string;
    message: string;
  } | null;
  timestamp: string;
}

export async function performSemanticSearchApi(payload: {
  query: string;
  topK?: number;
  collectionName?: string;
}): Promise<SearchResponseData> {
  const response = await apiClient.post<SearchApiResponse>('/api/v1/search', payload);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to perform semantic search');
  }

  return response.data.data;
}
