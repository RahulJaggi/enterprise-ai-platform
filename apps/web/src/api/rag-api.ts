import { apiClient } from '@/lib/api-client';
import { SearchResultChunk } from './search-api';

export interface RagSource {
  filename: string;
  pageNumber: number;
  chunkId: string;
}

export interface RagResponseData {
  question: string;
  answer: string;
  confidence: number;
  sources: RagSource[];
  retrievedChunks: SearchResultChunk[];
  executionTimeMs: number;
}

export interface RagApiResponse {
  success: boolean;
  data: RagResponseData | null;
  error: {
    code: string;
    message: string;
  } | null;
  timestamp: string;
}

export async function askRagQuestionApi(payload: {
  question: string;
  topK?: number;
  collectionName?: string;
}): Promise<RagResponseData> {
  const response = await apiClient.post<RagApiResponse>('/api/v1/rag/answer', payload);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to generate RAG answer');
  }

  return response.data.data;
}
