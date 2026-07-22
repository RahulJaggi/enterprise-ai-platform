export const AI_PROVIDER_TOKEN = 'AI_PROVIDER';

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
}
