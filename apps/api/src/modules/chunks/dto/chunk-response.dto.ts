import { ApiProperty } from '@nestjs/swagger';

export class DocumentChunkDto {
  @ApiProperty({ example: 'chk_0_8f9a2b1c' })
  chunkId!: string;

  @ApiProperty({ example: 0 })
  index!: number;

  @ApiProperty({ example: 0 })
  startOffset!: number;

  @ApiProperty({ example: 1000 })
  endOffset!: number;

  @ApiProperty({ example: 1000 })
  characterCount!: number;

  @ApiProperty({ example: 'First 1000 characters of extracted text...' })
  content!: string;
}

export class ChunkResponseDataDto {
  @ApiProperty({ example: 5 })
  totalChunks!: number;

  @ApiProperty({ example: 1000 })
  chunkSize!: number;

  @ApiProperty({ example: 200 })
  overlap!: number;

  @ApiProperty({ type: [DocumentChunkDto] })
  chunks!: DocumentChunkDto[];
}
