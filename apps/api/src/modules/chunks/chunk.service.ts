import { Injectable, Logger } from '@nestjs/common';
import { FixedSizeChunkStrategy } from './strategies/fixed-size.strategy';
import { ChunkRequestDto } from './dto/chunk-request.dto';
import { ChunkResponseDataDto } from './dto/chunk-response.dto';

@Injectable()
export class ChunkService {
  private readonly logger = new Logger(ChunkService.name);

  constructor(private readonly fixedSizeStrategy: FixedSizeChunkStrategy) {}

  processChunking(dto: ChunkRequestDto): ChunkResponseDataDto {
    const chunkSize = dto.chunkSize ?? 1000;
    const overlap = dto.overlap ?? 200;

    this.logger.log(
      `Processing document chunking [TextLength: ${dto.text.length}, ChunkSize: ${chunkSize}, Overlap: ${overlap}]`,
    );

    const chunks = this.fixedSizeStrategy.chunkText(dto.text, {
      chunkSize,
      overlap,
    });

    return {
      totalChunks: chunks.length,
      chunkSize,
      overlap,
      chunks,
    };
  }
}
