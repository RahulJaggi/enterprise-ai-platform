import { apiClient } from '@/lib/api-client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ConversationItem {
  conversationId: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export interface ChatApiRequest {
  message: string;
  conversationId?: string;
}

export interface ChatApiResponse {
  success: boolean;
  data: {
    conversationId: string;
    response: string;
  } | null;
  error: {
    code: string;
    message: string;
  } | null;
  timestamp: string;
}

export async function sendChatMessage(
  payload: ChatApiRequest,
): Promise<{ conversationId: string; response: string }> {
  const response = await apiClient.post<ChatApiResponse>('/api/v1/ai/chat', payload);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to generate AI completion');
  }

  return response.data.data;
}

export async function deleteConversationApi(conversationId: string): Promise<void> {
  try {
    await apiClient.delete(`/api/v1/ai/chat/${conversationId}`);
  } catch {
    // Gracefully handle if conversation was only in local store
  }
}
