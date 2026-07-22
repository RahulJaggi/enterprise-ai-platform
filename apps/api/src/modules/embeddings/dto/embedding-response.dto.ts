import { ApiProperty } from '@nestjs/swagger';

export class ChunkEmbeddingResultDto {
  @ApiProperty({ example: 'chk_0_8f9a2b1c' })
  chunkId!: string;

  @ApiProperty({ example: 768 })
  embeddingDimension!: number;

  @ApiProperty({ example: 45 })
  generationTimeMs!: number;

  @ApiProperty({ example: 'generated', enum: ['generated', 'failed'] })
  status!: 'generated' | 'failed';
}

export class EmbeddingResponseDataDto {
  @ApiProperty({ example: 5 })
  totalChunks!: number;

  @ApiProperty({ example: 'qwen2.5:7b' })
  embeddingModel!: string;

  @ApiProperty({ type: [ChunkEmbeddingResultDto] })
  results!: ChunkEmbeddingResultDto[];
}
