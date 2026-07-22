import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  VECTOR_PROVIDER_TOKEN,
  IVectorProvider,
  VectorPoint,
} from '../../providers/vector/vector-provider.interface';
import { IndexRequestDto } from './dto/index-request.dto';
import {
  VectorIndexingResponseDataDto,
  VectorCollectionStatusDto,
} from './dto/vector-status-response.dto';

@Injectable()
export class VectorService {
  private readonly logger = new Logger(VectorService.name);
  private readonly documentTracker = new Set<string>();
  private lastIndexedIsoTime: string = new Date().toISOString();

  constructor(
    @Inject(VECTOR_PROVIDER_TOKEN)
    private readonly vectorProvider: IVectorProvider,
    private readonly configService: ConfigService,
  ) {}

  private getDefaultCollection(): string {
    return this.configService.get<string>('QDRANT_COLLECTION_NAME', 'enterprise_knowledge');
  }

  async indexDocumentChunks(dto: IndexRequestDto): Promise<VectorIndexingResponseDataDto> {
    const stageStartTime = Date.now();
    const collectionName = dto.collectionName || this.getDefaultCollection();
    const totalChunks = dto.chunks.length;

    this.logger.log(
      `[Vector Pipeline Started] Document: [${dto.filename}] | Chunks: ${totalChunks} | Target Collection: [${collectionName}]`,
    );

    const points: VectorPoint[] = dto.chunks.map((c) => ({
      chunkId: c.chunkId,
      filename: dto.filename,
      pageNumber: c.pageNumber || 1,
      chunkIndex: c.chunkIndex,
      content: c.content,
      embedding: c.embedding,
    }));

    const result = await this.vectorProvider.upsertVectors(collectionName, points);

    this.documentTracker.add(dto.filename);
    this.lastIndexedIsoTime = new Date().toISOString();

    const pipelineDurationMs = Date.now() - stageStartTime;

    const responseDto: VectorIndexingResponseDataDto = {
      collectionName: result?.collectionName || collectionName,
      vectorCount: typeof result?.vectorCount === 'number' ? result.vectorCount : points.length,
      indexedCount: typeof result?.indexedCount === 'number' ? result.indexedCount : points.length,
      status: result?.status || 'indexed',
    };

    this.logger.log(
      `[Vector Pipeline Completed] Document: [${dto.filename}] | Indexed Vectors: ${responseDto.indexedCount} | Total Collection Vectors: ${responseDto.vectorCount} | Total Duration: ${pipelineDurationMs}ms`,
    );

    return responseDto;
  }

  async getStatus(collectionNameParam?: string): Promise<VectorCollectionStatusDto> {
    const collectionName = collectionNameParam || this.getDefaultCollection();
    const info = await this.vectorProvider.getCollectionInfo(collectionName);

    return {
      collectionName,
      status: info.status || 'active',
      vectorCount: typeof info.vectorsCount === 'number' ? info.vectorsCount : 0,
      documentsIndexed: this.documentTracker.size || (info.vectorsCount > 0 ? 1 : 0),
      lastIndexedTime: this.lastIndexedIsoTime,
    };
  }
}
