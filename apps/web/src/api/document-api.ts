import { apiClient } from '@/lib/api-client';

export interface ExtractedDocumentData {
  filename: string;
  pageCount: number;
  characterCount: number;
  text: string;
}

export interface DocumentUploadApiResponse {
  success: boolean;
  data: ExtractedDocumentData | null;
  error: {
    code: string;
    message: string;
  } | null;
  timestamp: string;
}

export interface DocumentChunk {
  chunkId: string;
  index: number;
  startOffset: number;
  endOffset: number;
  characterCount: number;
  content: string;
}

export interface ChunkApiResponse {
  success: boolean;
  data: {
    totalChunks: number;
    chunkSize: number;
    overlap: number;
    chunks: DocumentChunk[];
  } | null;
  error: {
    code: string;
    message: string;
  } | null;
  timestamp: string;
}

export interface ChunkEmbeddingResult {
  chunkId: string;
  embeddingDimension: number;
  generationTimeMs: number;
  status: 'generated' | 'failed';
  embedding?: number[];
}

export interface EmbeddingApiResponse {
  success: boolean;
  data: {
    totalChunks: number;
    embeddingModel: string;
    results: ChunkEmbeddingResult[];
  } | null;
  error: {
    code: string;
    message: string;
  } | null;
  timestamp: string;
}

export interface VectorIndexingResponse {
  collectionName: string;
  vectorCount: number;
  indexedCount: number;
  status: string;
}

export interface VectorCollectionStatus {
  collectionName: string;
  status: string;
  vectorCount: number;
  documentsIndexed: number;
  lastIndexedTime: string;
}

export async function uploadDocumentApi(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<ExtractedDocumentData> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<DocumentUploadApiResponse>(
    '/api/v1/documents/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    },
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to extract text from PDF');
  }

  return response.data.data;
}

export async function processChunkingApi(payload: {
  text: string;
  chunkSize?: number;
  overlap?: number;
}): Promise<ChunkApiResponse['data']> {
  const response = await apiClient.post<ChunkApiResponse>('/api/v1/documents/chunk', payload);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to process document chunking');
  }

  return response.data.data;
}

export async function generateEmbeddingsApi(payload: {
  chunks: { chunkId: string; content: string }[];
  model?: string;
}): Promise<EmbeddingApiResponse['data']> {
  const response = await apiClient.post<EmbeddingApiResponse>('/api/v1/documents/embed', payload);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to generate embeddings');
  }

  return response.data.data;
}

export async function indexVectorsApi(payload: {
  collectionName?: string;
  filename: string;
  chunks: {
    chunkId: string;
    chunkIndex: number;
    pageNumber?: number;
    content: string;
    embedding: number[];
  }[];
}): Promise<VectorIndexingResponse> {
  const response = await apiClient.post<{
    success: boolean;
    data: VectorIndexingResponse | null;
    error: { message: string } | null;
  }>('/api/v1/documents/index', payload);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to index vectors in Qdrant');
  }

  return response.data.data;
}

export async function getVectorStatusApi(collectionName?: string): Promise<VectorCollectionStatus> {
  const response = await apiClient.get<{
    success: boolean;
    data: VectorCollectionStatus | null;
  }>('/api/v1/documents/vector-status', {
    params: { collectionName },
  });

  if (!response.data.success || !response.data.data) {
    throw new Error('Failed to retrieve vector status');
  }

  return response.data.data;
}
