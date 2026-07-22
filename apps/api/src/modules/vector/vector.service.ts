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
    const collectionName = dto.collectionName || this.getDefaultCollection();

    this.logger.log(
      `Indexing ${dto.chunks.length} vector chunks for file [${dto.filename}] into Qdrant collection [${collectionName}]`,
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

    return {
      collectionName: result.collectionName,
      vectorCount: result.vectorCount,
      indexedCount: result.indexedCount,
      status: result.status,
    };
  }

  async getStatus(collectionNameParam?: string): Promise<VectorCollectionStatusDto> {
    const collectionName = collectionNameParam || this.getDefaultCollection();
    const info = await this.vectorProvider.getCollectionInfo(collectionName);

    return {
      collectionName,
      status: info.status,
      vectorCount: info.vectorsCount,
      documentsIndexed: this.documentTracker.size || (info.vectorsCount > 0 ? 1 : 0),
      lastIndexedTime: this.lastIndexedIsoTime,
    };
  }
}
