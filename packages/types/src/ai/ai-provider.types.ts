export type AIProviderType =
  'ollama' | 'openai' | 'anthropic' | 'vllm' | 'azure_openai' | 'bedrock';

export interface CompletionRequest {
  prompt: string;
  model?: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export interface CompletionUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CompletionResponse {
  text: string;
  model: string;
  usage?: CompletionUsage;
  durationMs?: number;
  finishReason?: 'stop' | 'length' | 'content_filter' | 'error';
}

export interface StreamingChunk {
  token: string;
  index: number;
  isDone: boolean;
  durationMs?: number;
  error?: string;
}
