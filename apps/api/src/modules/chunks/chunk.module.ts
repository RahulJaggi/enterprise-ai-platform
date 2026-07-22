import { Module } from '@nestjs/common';
import { ChunkController } from './chunk.controller';
import { ChunkService } from './chunk.service';
import { FixedSizeChunkStrategy } from './strategies/fixed-size.strategy';

@Module({
  controllers: [ChunkController],
  providers: [ChunkService, FixedSizeChunkStrategy],
  exports: [ChunkService, FixedSizeChunkStrategy],
})
export class ChunkModule {}
