import { Injectable, Inject, Logger } from '@nestjs/common';
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
  ) {}

  async generateChunkEmbeddings(dto: EmbeddingRequestDto): Promise<EmbeddingResponseDataDto> {
    const targetModel = dto.model || 'nomic-embed-text';
    this.logger.log(
      `Generating embeddings for ${dto.chunks.length} chunks via provider [${this.embeddingProvider.providerName}] with model [${targetModel}]`,
    );

    const results: ChunkEmbeddingResultDto[] = [];
    let usedModel = targetModel;

    for (const chunk of dto.chunks) {
      try {
        const res = await this.embeddingProvider.generateEmbedding(chunk.content, targetModel);

        results.push({
          chunkId: chunk.chunkId,
          embeddingDimension: res.dimension,
          generationTimeMs: res.durationMs,
          status: 'generated',
          embedding: res.embedding,
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Embedding failed';
        this.logger.error(`Chunk embedding failed [ChunkId: ${chunk.chunkId}]: ${message}`);

        results.push({
          chunkId: chunk.chunkId,
          embeddingDimension: 0,
          generationTimeMs: 0,
          status: 'failed',
        });
      }
    }

    // Check if fallback model was used
    if (results.some((r) => r.status === 'generated' && r.embeddingDimension === 768)) {
      usedModel = 'nomic-embed-text';
    }

    return {
      totalChunks: dto.chunks.length,
      embeddingModel: usedModel,
      results,
    };
  }
}
