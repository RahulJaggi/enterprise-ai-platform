export const EMBEDDING_PROVIDER_TOKEN = 'EMBEDDING_PROVIDER';

export interface EmbeddingResult {
  embedding: number[];
  dimension: number;
  durationMs: number;
}

export interface IEmbeddingProvider {
  readonly providerName: string;
  generateEmbedding(text: string, model?: string): Promise<EmbeddingResult>;
  generateBatchEmbeddings(texts: string[], model?: string): Promise<EmbeddingResult[]>;
}
