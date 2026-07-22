import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class VectorChunkPointDto {
  @ApiProperty({ example: 'chk_0_8f9a2b1c', description: 'Unique Chunk ID' })
  @IsString()
  @IsNotEmpty()
  chunkId!: string;

  @ApiProperty({ example: 0, description: 'Sequential chunk index' })
  @IsNumber()
  chunkIndex!: number;

  @ApiProperty({
    example: 1,
    description: 'PDF page number',
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  pageNumber?: number;

  @ApiProperty({
    example: 'Enterprise AI Platform System Architecture Overview...',
    description: 'Text content of the chunk',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({
    type: [Number],
    description: 'Vector embedding array (e.g. 768 float numbers)',
  })
  @IsArray()
  embedding!: number[];
}

export class IndexRequestDto {
  @ApiProperty({
    example: 'enterprise_knowledge',
    description: 'Qdrant collection name',
    default: 'enterprise_knowledge',
    required: false,
  })
  @IsOptional()
  @IsString()
  collectionName?: string;

  @ApiProperty({
    example: 'enterprise_blueprint.pdf',
    description: 'Original uploaded PDF filename',
  })
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @ApiProperty({
    type: [VectorChunkPointDto],
    description: 'Array of chunks with vector embeddings to index into Qdrant',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VectorChunkPointDto)
  chunks!: VectorChunkPointDto[];
}
