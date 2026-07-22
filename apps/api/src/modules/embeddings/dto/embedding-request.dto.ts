import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ChunkItemInputDto {
  @ApiProperty({ example: 'chk_0_8f9a2b1c', description: 'Unique Chunk ID' })
  @IsString()
  @IsNotEmpty()
  chunkId!: string;

  @ApiProperty({
    example: 'Enterprise AI Platform Architecture Overview...',
    description: 'Text content of the chunk',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class EmbeddingRequestDto {
  @ApiProperty({
    type: [ChunkItemInputDto],
    description: 'Array of document chunks to generate embeddings for',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChunkItemInputDto)
  chunks!: ChunkItemInputDto[];

  @ApiProperty({
    example: 'qwen2.5:7b',
    description: 'Optional embedding model name override',
    required: false,
  })
  @IsOptional()
  @IsString()
  model?: string;
}
