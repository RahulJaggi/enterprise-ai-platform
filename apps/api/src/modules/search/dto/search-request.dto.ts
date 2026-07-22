import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchRequestDto {
  @ApiProperty({
    example: 'What is the enterprise AI architecture overview?',
    description: 'Natural language search query string',
  })
  @IsString()
  @IsNotEmpty()
  query!: string;

  @ApiProperty({
    example: 5,
    description: 'Top-K number of matching chunks to retrieve (1 to 20)',
    default: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  topK?: number;

  @ApiProperty({
    example: 'enterprise_knowledge',
    description: 'Target Qdrant collection name',
    default: 'enterprise_knowledge',
    required: false,
  })
  @IsOptional()
  @IsString()
  collectionName?: string;
}
