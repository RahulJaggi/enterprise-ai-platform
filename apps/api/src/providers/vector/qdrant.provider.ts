import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import {
  IVectorProvider,
  VectorPoint,
  IndexingResult,
  CollectionInfo,
  VectorSearchResult,
} from './vector-provider.interface';

interface QdrantCollectionResponse {
  result?: {
    status?: string;
    vectors_count?: number;
    points_count?: number;
  };
  status?: string;
}

interface QdrantSearchHit {
  id?: string;
  score?: number;
  payload?: {
    documentId?: string;
    chunkId?: string;
    filename?: string;
    pageNumber?: number;
    chunkIndex?: number;
    content?: string;
  };
}

interface QdrantSearchApiResponse {
  result?: QdrantSearchHit[];
  status?: string;
}

@Injectable()
export class QdrantProvider implements IVectorProvider {
  readonly providerName = 'qdrant';
  private readonly logger = new Logger(QdrantProvider.name);

  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly defaultCollectionName: string;
  private readonly timeoutMs: number;
  private readonly batchSize: number;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('QDRANT_URL', 'http://localhost:6333');
    this.apiKey = this.configService.get<string>('QDRANT_API_KEY', '');
    this.defaultCollectionName = this.configService.get<string>(
      'QDRANT_COLLECTION_NAME',
      'enterprise_knowledge',
    );
    this.timeoutMs = this.configService.get<number>('QDRANT_TIMEOUT_MS', 60000);
    this.batchSize = this.configService.get<number>('QDRANT_BATCH_SIZE', 50);
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['api-key'] = this.apiKey;
    }
    return headers;
  }

  async ensureCollection(collectionNameParam?: string, vectorSize = 768): Promise<void> {
    const collectionName = collectionNameParam || this.defaultCollectionName;
    const checkEndpoint = `${this.baseUrl}/collections/${collectionName}`;

    try {
      const response = await fetch(checkEndpoint, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (response.ok) {
        this.logger.log(`[Qdrant Collection] Collection already exists: [${collectionName}]`);
        return;
      }

      if (response.status === 404) {
        this.logger.log(
          `[Qdrant Collection] Collection missing. Creating Qdrant collection: [${collectionName}] (VectorSize: ${vectorSize}, Distance: Cosine)`,
        );

        const createResponse = await fetch(checkEndpoint, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({
            vectors: {
              size: vectorSize,
              distance: 'Cosine',
            },
          }),
          signal: AbortSignal.timeout(this.timeoutMs),
        });

        if (!createResponse.ok) {
          const errText = await createResponse.text();
          throw new InternalServerErrorException(
            `Failed to create Qdrant collection [${collectionName}]: ${errText}`,
          );
        }

        this.logger.log(`[Qdrant Collection] Collection [${collectionName}] created successfully.`);
        return;
      }
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed'))
      ) {
        throw new ServiceUnavailableException(
          `Qdrant vector database unreachable at ${this.baseUrl}`,
        );
      }
      throw error;
    }
  }

  async upsertVectors(
    collectionNameParam: string | undefined,
    points: VectorPoint[],
  ): Promise<IndexingResult> {
    const stageStartTime = Date.now();
    const collectionName = collectionNameParam || this.defaultCollectionName;

    const validPoints = points.filter((p) => Array.isArray(p.embedding) && p.embedding.length > 0);

    const firstPoint = validPoints[0];
    if (!firstPoint || validPoints.length === 0) {
      this.logger.warn(`[Qdrant Upsert] No valid vector points provided for indexing.`);
      return {
        collectionName,
        vectorCount: 0,
        indexedCount: 0,
        status: 'empty',
      };
    }

    const vectorSize = firstPoint.embedding.length;
    await this.ensureCollection(collectionName, vectorSize);

    const totalPoints = validPoints.length;
    const totalBatches = Math.ceil(totalPoints / this.batchSize);

    this.logger.log(
      `[Qdrant Upsert Started] Points: ${totalPoints} | Batch Size: ${this.batchSize} | Total Batches: ${totalBatches} | Collection: [${collectionName}]`,
    );

    const endpoint = `${this.baseUrl}/collections/${collectionName}/points?wait=true`;
    let cumulativeInserted = 0;

    for (let i = 0; i < totalPoints; i += this.batchSize) {
      const batchIdx = Math.floor(i / this.batchSize) + 1;
      const batchPoints = validPoints.slice(i, i + this.batchSize);
      const batchStartTime = Date.now();

      const qdrantPoints = batchPoints.map((p) => ({
        id: randomUUID(),
        vector: p.embedding,
        payload: {
          documentId: p.documentId || `doc_${p.filename}`,
          chunkId: p.chunkId,
          filename: p.filename,
          pageNumber: p.pageNumber,
          chunkIndex: p.chunkIndex,
          content: p.content,
        },
      }));

      try {
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({ points: qdrantPoints }),
          signal: AbortSignal.timeout(this.timeoutMs),
        });

        if (!response.ok) {
          const errorText = await response.text();
          this.logger.error(`[Qdrant Upsert Error] Batch #${batchIdx} failed: ${errorText}`);
          throw new InternalServerErrorException(
            `Qdrant upsert points failed for batch #${batchIdx}: ${errorText}`,
          );
        }

        cumulativeInserted += batchPoints.length;
        const batchDuration = Date.now() - batchStartTime;
        this.logger.log(
          `[Qdrant Batch ${batchIdx}/${totalBatches}] Successfully inserted ${batchPoints.length} points in ${batchDuration}ms | Cumulative: ${cumulativeInserted}/${totalPoints}`,
        );
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed'))
        ) {
          throw new ServiceUnavailableException(
            `Qdrant vector database unreachable at ${this.baseUrl}`,
          );
        }
        throw error;
      }
    }

    const stageDurationMs = Date.now() - stageStartTime;
    this.logger.log(
      `[Qdrant Indexing Completed] Total vectors inserted: ${cumulativeInserted} across ${totalBatches} batches in ${stageDurationMs}ms`,
    );

    let totalVectors = cumulativeInserted;
    try {
      const info = await this.getCollectionInfo(collectionName);
      if (typeof info.vectorsCount === 'number' && info.vectorsCount >= 0) {
        totalVectors = info.vectorsCount;
      }
    } catch (err: unknown) {
      this.logger.warn(`Failed to retrieve post-index collection info: ${err}`);
    }

    return {
      collectionName,
      vectorCount: totalVectors,
      indexedCount: cumulativeInserted,
      status: 'indexed',
    };
  }

  async getCollectionInfo(collectionNameParam?: string): Promise<CollectionInfo> {
    const collectionName = collectionNameParam || this.defaultCollectionName;
    const endpoint = `${this.baseUrl}/collections/${collectionName}`;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!response.ok) {
        return {
          collectionName,
          status: 'not_found',
          vectorsCount: 0,
          pointsCount: 0,
        };
      }

      const data = (await response.json()) as QdrantCollectionResponse;
      const res = data.result || {};

      const count =
        typeof res.vectors_count === 'number'
          ? res.vectors_count
          : typeof res.points_count === 'number'
            ? res.points_count
            : 0;

      return {
        collectionName,
        status: res.status || 'active',
        vectorsCount: count,
        pointsCount: count,
      };
    } catch {
      return {
        collectionName,
        status: 'unreachable',
        vectorsCount: 0,
        pointsCount: 0,
      };
    }
  }

  async searchVectors(
    collectionNameParam: string | undefined,
    queryEmbedding: number[],
    limit = 5,
  ): Promise<VectorSearchResult[]> {
    const collectionName = collectionNameParam || this.defaultCollectionName;
    const endpoint = `${this.baseUrl}/collections/${collectionName}/points/search`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          vector: queryEmbedding,
          limit,
          with_payload: true,
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!response.ok) {
        if (response.status === 404) {
          this.logger.warn(
            `Qdrant collection [${collectionName}] missing during vector search. Returning empty result set.`,
          );
          return [];
        }
        const errorText = await response.text();
        this.logger.error(`Qdrant search error: ${errorText}`);
        throw new InternalServerErrorException(`Qdrant semantic search failed: ${errorText}`);
      }

      const data = (await response.json()) as QdrantSearchApiResponse;
      const hits = data.result || [];

      return hits.map((hit) => {
        const payload = hit.payload || {};
        return {
          score: hit.score || 0,
          chunkId: payload.chunkId || hit.id || '',
          documentId: payload.documentId || `doc_${payload.filename || 'unknown'}`,
          filename: payload.filename || 'unknown.pdf',
          pageNumber: typeof payload.pageNumber === 'number' ? payload.pageNumber : 1,
          chunkIndex: typeof payload.chunkIndex === 'number' ? payload.chunkIndex : 0,
          content: payload.content || '',
        };
      });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed'))
      ) {
        throw new ServiceUnavailableException(
          `Qdrant vector database unreachable at ${this.baseUrl}`,
        );
      }
      throw error;
    }
  }
}
