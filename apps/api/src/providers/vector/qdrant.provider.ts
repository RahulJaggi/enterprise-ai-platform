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
} from './vector-provider.interface';

interface QdrantCollectionResponse {
  result?: {
    status?: string;
    vectors_count?: number;
    points_count?: number;
    config?: {
      params?: {
        vectors?: {
          size?: number;
        };
      };
    };
  };
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

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('QDRANT_URL', 'http://localhost:6333');
    this.apiKey = this.configService.get<string>('QDRANT_API_KEY', '');
    this.defaultCollectionName = this.configService.get<string>(
      'QDRANT_COLLECTION_NAME',
      'enterprise_knowledge',
    );
    this.timeoutMs = this.configService.get<number>('QDRANT_TIMEOUT_MS', 15000);
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
        const data = (await response.json()) as QdrantCollectionResponse;
        const existingSize = data.result?.config?.params?.vectors?.size;

        if (existingSize && existingSize !== vectorSize) {
          this.logger.warn(
            `Collection [${collectionName}] vector size mismatch (existing: ${existingSize}, new: ${vectorSize}). Recreating collection...`,
          );

          await fetch(checkEndpoint, {
            method: 'DELETE',
            headers: this.getHeaders(),
            signal: AbortSignal.timeout(this.timeoutMs),
          });
          // Fall through to create collection with new size
        } else {
          this.logger.log(`Collection already exists: ${collectionName}`);
          return;
        }
      }

      this.logger.log(
        `Collection missing or size mismatched. Creating Qdrant collection: ${collectionName} [VectorSize: ${vectorSize}, Distance: Cosine]`,
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

      this.logger.log(
        `Collection created: ${collectionName} [VectorSize: ${vectorSize}, Distance: Cosine]`,
      );
      return;
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
    const collectionName = collectionNameParam || this.defaultCollectionName;

    // Filter out points without valid non-empty embeddings
    const validPoints = points.filter((p) => Array.isArray(p.embedding) && p.embedding.length > 0);

    const firstPoint = validPoints[0];
    if (!firstPoint || validPoints.length === 0) {
      return {
        collectionName,
        vectorCount: 0,
        indexedCount: 0,
        status: 'empty',
      };
    }

    // Dynamic dimension detection from input embedding
    const vectorSize = firstPoint.embedding.length;
    await this.ensureCollection(collectionName, vectorSize);

    const qdrantPoints = validPoints.map((p) => {
      const pointUuid = randomUUID();
      return {
        id: pointUuid,
        vector: p.embedding,
        payload: {
          documentId: p.documentId || `doc_${p.filename}`,
          chunkId: p.chunkId,
          filename: p.filename,
          pageNumber: p.pageNumber,
          chunkIndex: p.chunkIndex,
          content: p.content,
        },
      };
    });

    const endpoint = `${this.baseUrl}/collections/${collectionName}/points?wait=true`;

    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ points: qdrantPoints }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Qdrant upsert error: ${errorText}`);
        throw new InternalServerErrorException(`Qdrant upsert points failed: ${errorText}`);
      }

      this.logger.log(`Number of vectors inserted: ${validPoints.length}`);

      const info = await this.getCollectionInfo(collectionName);

      return {
        collectionName,
        vectorCount: info.vectorsCount,
        indexedCount: validPoints.length,
        status: 'indexed',
      };
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

      return {
        collectionName,
        status: res.status || 'active',
        vectorsCount: res.vectors_count || res.points_count || 0,
        pointsCount: res.points_count || 0,
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
}
