import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class RagRequestDto {
  @ApiProperty({
    example: 'What is the employee compensation structure in the appointment letter?',
    description: 'Natural language user question to answer via RAG',
  })
  @IsString()
  @IsNotEmpty()
  question!: string;

  @ApiProperty({
    example: 5,
    description: 'Top-K chunks to retrieve for RAG context (1 to 20)',
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
