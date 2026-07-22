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
