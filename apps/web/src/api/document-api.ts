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
