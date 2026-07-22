import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EMBEDDING_PROVIDER_TOKEN,
  IEmbeddingProvider,
} from '../../providers/embeddings/embedding-provider.interface';
import { EmbeddingRequestDto } from './dto/embedding-request.dto';
import { EmbeddingResponseDataDto, ChunkEmbeddingResultDto } from './dto/embedding-response.dto';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  constructor(
    @Inject(EMBEDDING_PROVIDER_TOKEN)
    private readonly embeddingProvider: IEmbeddingProvider,
    private readonly configService: ConfigService,
  ) {}

  async generateChunkEmbeddings(dto: EmbeddingRequestDto): Promise<EmbeddingResponseDataDto> {
    const stageStartTime = Date.now();
    const targetModel = dto.model || 'nomic-embed-text';
    const totalChunks = dto.chunks.length;
    const concurrencyLimit = this.configService.get<number>('EMBEDDING_CONCURRENCY', 4);

    this.logger.log(
      `[Embedding Stage Started] Chunks: ${totalChunks} | Model: [${targetModel}] | Provider: [${this.embeddingProvider.providerName}] | Concurrency: ${concurrencyLimit}`,
    );

    const results: ChunkEmbeddingResultDto[] = new Array(totalChunks);
    let completedCount = 0;
    let usedModel = targetModel;

    // Process chunks in concurrent batches
    for (let i = 0; i < totalChunks; i += concurrencyLimit) {
      const chunkBatch = dto.chunks.slice(i, i + concurrencyLimit);

      await Promise.all(
        chunkBatch.map(async (chunk, batchIndex) => {
          const globalIndex = i + batchIndex;
          const chunkStartTime = Date.now();

          try {
            const res = await this.embeddingProvider.generateEmbedding(chunk.content, targetModel);

            results[globalIndex] = {
              chunkId: chunk.chunkId,
              embeddingDimension: res.dimension,
              generationTimeMs: res.durationMs,
              status: 'generated',
              embedding: res.embedding,
            };

            completedCount++;
            this.logger.log(
              `[Embedding Progress ${completedCount}/${totalChunks}] Chunk #${globalIndex + 1} [ID: ${chunk.chunkId}] | Dim: ${res.dimension}d | Time: ${res.durationMs}ms | Content Length: ${chunk.content.length} chars`,
            );
          } catch (error: unknown) {
            const durationMs = Date.now() - chunkStartTime;
            const message = error instanceof Error ? error.message : 'Embedding failed';
            const stack = error instanceof Error ? error.stack : '';

            this.logger.error(
              `[Embedding Failed] Chunk #${globalIndex + 1} [ID: ${chunk.chunkId}] after ${durationMs}ms: ${message}\nStack: ${stack}`,
            );

            results[globalIndex] = {
              chunkId: chunk.chunkId,
              embeddingDimension: 0,
              generationTimeMs: durationMs,
              status: 'failed',
            };
          }
        }),
      );
    }

    const totalDurationMs = Date.now() - stageStartTime;
    const successfulCount = results.filter((r) => r.status === 'generated').length;

    if (results.some((r) => r.status === 'generated' && r.embeddingDimension === 768)) {
      usedModel = 'nomic-embed-text';
    }

    this.logger.log(
      `[Embedding Stage Completed] Success: ${successfulCount}/${totalChunks} chunks | Total Duration: ${totalDurationMs}ms | Avg per chunk: ${Math.round(totalDurationMs / (totalChunks || 1))}ms`,
    );

    return {
      totalChunks,
      embeddingModel: usedModel,
      results,
    };
  }
}
