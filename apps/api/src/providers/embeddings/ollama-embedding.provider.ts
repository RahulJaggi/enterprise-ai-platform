import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEmbeddingProvider, EmbeddingResult } from './embedding-provider.interface';

interface OllamaEmbeddingApiResponse {
  embedding?: number[];
  embeddings?: number[][];
  error?: string;
}

@Injectable()
export class OllamaEmbeddingProvider implements IEmbeddingProvider {
  readonly providerName = 'ollama-embedding';
  private readonly logger = new Logger(OllamaEmbeddingProvider.name);

  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly fallbackModel = 'nomic-embed-text';
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('OLLAMA_BASE_URL', 'http://localhost:11434');
    this.defaultModel = this.configService.get<string>(
      'OLLAMA_EMBEDDING_MODEL',
      'nomic-embed-text',
    );
    this.timeoutMs = this.configService.get<number>('OLLAMA_TIMEOUT_MS', 30000);
  }

  async generateEmbedding(text: string, model?: string): Promise<EmbeddingResult> {
    const startTime = Date.now();
    let targetModel = model || this.defaultModel;

    try {
      return await this.fetchEmbeddingFromOllama(text, targetModel, startTime);
    } catch (firstError: unknown) {
      // If requested model is a chat model that doesn't support embeddings, fallback to nomic-embed-text
      if (
        targetModel !== this.fallbackModel &&
        firstError instanceof InternalServerErrorException &&
        firstError.message.includes('does not support embeddings')
      ) {
        this.logger.warn(
          `Model [${targetModel}] does not support embeddings. Retrying with dedicated embedding model [${this.fallbackModel}]`,
        );
        targetModel = this.fallbackModel;
        return await this.fetchEmbeddingFromOllama(text, targetModel, startTime);
      }
      throw firstError;
    }
  }

  private async fetchEmbeddingFromOllama(
    text: string,
    model: string,
    startTime: number,
  ): Promise<EmbeddingResult> {
    const endpoint = `${this.baseUrl}/api/embeddings`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt: text,
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      const data = (await response.json()) as OllamaEmbeddingApiResponse;

      if (!response.ok || data.error) {
        const errorMsg = data.error || `HTTP ${response.status} ${response.statusText}`;
        this.logger.error(`Ollama embedding API error [Model: ${model}]: ${errorMsg}`);
        throw new InternalServerErrorException(
          `Ollama embedding model [${model}] error: ${errorMsg}`,
        );
      }

      const embedding = data.embedding || (data.embeddings ? data.embeddings[0] : []);

      if (!embedding || embedding.length === 0) {
        throw new InternalServerErrorException(
          `Ollama embedding vector returned empty for model [${model}]`,
        );
      }

      const durationMs = Date.now() - startTime;
      return {
        embedding,
        dimension: embedding.length,
        durationMs,
      };
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed'))
      ) {
        throw new ServiceUnavailableException(
          `Ollama embedding service unreachable at ${this.baseUrl}`,
        );
      }

      if (
        error instanceof InternalServerErrorException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown embedding error';
      throw new InternalServerErrorException(
        `Failed to generate embedding vector: ${errorMessage}`,
      );
    }
  }

  async generateBatchEmbeddings(texts: string[], model?: string): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];
    for (const text of texts) {
      const res = await this.generateEmbedding(text, model);
      results.push(res);
    }
    return results;
  }
}
