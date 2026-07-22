import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class ChunkRequestDto {
  @ApiProperty({
    example:
      'Enterprise AI Platform Master Architecture Blueprint. Section 1: System Architecture Overview...',
    description: 'The raw document text to divide into chunks',
  })
  @IsString()
  @IsNotEmpty()
  text!: string;

  @ApiProperty({
    example: 1000,
    description: 'Character size limit per chunk (100 to 4000 chars)',
    default: 1000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(4000)
  chunkSize?: number;

  @ApiProperty({
    example: 200,
    description: 'Character overlap between consecutive chunks (0 to 1000 chars)',
    default: 200,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  overlap?: number;
}
