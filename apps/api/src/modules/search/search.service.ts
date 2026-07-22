import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EMBEDDING_PROVIDER_TOKEN,
  IEmbeddingProvider,
} from '../../providers/embeddings/embedding-provider.interface';
import {
  VECTOR_PROVIDER_TOKEN,
  IVectorProvider,
} from '../../providers/vector/vector-provider.interface';
import { SearchRequestDto } from './dto/search-request.dto';
import { SearchResponseDataDto, SearchResultChunkDto } from './dto/search-response.dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @Inject(EMBEDDING_PROVIDER_TOKEN)
    private readonly embeddingProvider: IEmbeddingProvider,
    @Inject(VECTOR_PROVIDER_TOKEN)
    private readonly vectorProvider: IVectorProvider,
    private readonly configService: ConfigService,
  ) {}

  async searchSemanticChunks(dto: SearchRequestDto): Promise<SearchResponseDataDto> {
    const startTime = Date.now();
    const collectionName =
      dto.collectionName ||
      this.configService.get<string>('QDRANT_COLLECTION_NAME', 'enterprise_knowledge');
    const topK = dto.topK || 5;

    this.logger.log(
      `[Semantic Search] Processing query [${dto.query}] | Top-K: ${topK} | Collection: [${collectionName}]`,
    );

    // Step 1: Generate embedding vector for user query using existing embedding provider
    const queryEmbeddingResult = await this.embeddingProvider.generateEmbedding(
      dto.query,
      'nomic-embed-text',
    );

    this.logger.log(
      `[Semantic Search] Query embedding generated in ${queryEmbeddingResult.durationMs}ms [Dimension: ${queryEmbeddingResult.dimension}d]`,
    );

    // Step 2: Search Qdrant vector database using cosine similarity
    const rawHits = await this.vectorProvider.searchVectors(
      collectionName,
      queryEmbeddingResult.embedding,
      topK,
    );

    const results: SearchResultChunkDto[] = rawHits.map((hit) => ({
      score: Number((hit.score || 0).toFixed(4)),
      chunkId: hit.chunkId,
      documentId: hit.documentId,
      filename: hit.filename,
      pageNumber: hit.pageNumber,
      chunkIndex: hit.chunkIndex,
      content: hit.content,
    }));

    const executionTimeMs = Date.now() - startTime;
    this.logger.log(
      `[Semantic Search Completed] Retrieved ${results.length} matching chunks in ${executionTimeMs}ms`,
    );

    return {
      query: dto.query,
      totalMatches: results.length,
      executionTimeMs,
      results,
    };
  }
}
