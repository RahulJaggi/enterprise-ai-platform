import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IChunkStrategy, ChunkOptions, DocumentChunk } from './chunk-strategy.interface';

@Injectable()
export class FixedSizeChunkStrategy implements IChunkStrategy {
  readonly strategyName = 'fixed-size';
  private readonly logger = new Logger(FixedSizeChunkStrategy.name);

  chunkText(text: string, options: ChunkOptions): DocumentChunk[] {
    const trimmedText = text.trim();
    if (!trimmedText) {
      return [];
    }

    const { chunkSize, overlap } = options;
    const effectiveChunkSize = Math.max(10, chunkSize);
    const effectiveOverlap = Math.min(Math.max(0, overlap), effectiveChunkSize - 1);
    const stride = effectiveChunkSize - effectiveOverlap;

    const chunks: DocumentChunk[] = [];
    let startOffset = 0;
    let index = 0;

    this.logger.debug(
      `Chunking text of length ${trimmedText.length} [ChunkSize: ${effectiveChunkSize}, Overlap: ${effectiveOverlap}, Stride: ${stride}]`,
    );

    while (startOffset < trimmedText.length) {
      const endOffset = Math.min(startOffset + effectiveChunkSize, trimmedText.length);
      const content = trimmedText.slice(startOffset, endOffset);
      const uniqueSuffix = randomUUID().replace(/-/g, '').slice(0, 8);
      const chunkId = `chk_${index}_${uniqueSuffix}`;

      chunks.push({
        chunkId,
        index,
        startOffset,
        endOffset,
        characterCount: content.length,
        content,
      });

      if (endOffset >= trimmedText.length) {
        break;
      }

      startOffset += stride;
      index++;
    }

    this.logger.log(`Fixed-size chunking completed: generated ${chunks.length} chunks`);

    return chunks;
  }
}
