export const AI_PROVIDER_TOKEN = 'AI_PROVIDER';

export type StreamEventType = 'start' | 'token' | 'complete' | 'error';

export interface StreamEventData {
  event: StreamEventType;
  data: {
    token?: string;
    model?: string;
    conversationId?: string;
    durationMs?: number;
    totalTokens?: number;
    error?: string;
    timestamp?: string;
  };
}

export interface AiCompletionRequest {
  prompt: string;
  model?: string;
  systemPrompt?: string;
}

export interface AiCompletionResponse {
  text: string;
  model: string;
  durationMs?: number;
}

export interface IAiProvider {
  readonly providerName: string;
  generateCompletion(request: AiCompletionRequest): Promise<AiCompletionResponse>;
  generateStreamingCompletion(
    request: AiCompletionRequest,
    signal?: AbortSignal,
  ): AsyncGenerator<StreamEventData>;
}
