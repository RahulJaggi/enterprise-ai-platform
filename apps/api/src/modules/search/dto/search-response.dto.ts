import { ApiProperty } from '@nestjs/swagger';

export class SearchResultChunkDto {
  @ApiProperty({ example: 0.892, description: 'Cosine similarity score (0 to 1)' })
  score!: number;

  @ApiProperty({ example: 'chk_0_8f9a2b1c', description: 'Unique Chunk ID' })
  chunkId!: string;

  @ApiProperty({ example: 'doc_annual_report.pdf', description: 'Document ID' })
  documentId!: string;

  @ApiProperty({ example: 'annual_report.pdf', description: 'Source PDF filename' })
  filename!: string;

  @ApiProperty({ example: 1, description: 'Page number in source PDF' })
  pageNumber!: number;

  @ApiProperty({ example: 0, description: 'Sequential chunk index' })
  chunkIndex!: number;

  @ApiProperty({
    example: 'Enterprise AI Platform System Architecture Overview...',
    description: 'Matched chunk text content',
  })
  content!: string;
}

export class SearchResponseDataDto {
  @ApiProperty({ example: 'What is the architecture overview?' })
  query!: string;

  @ApiProperty({ example: 5 })
  totalMatches!: number;

  @ApiProperty({ example: 45 })
  executionTimeMs!: number;

  @ApiProperty({ type: [SearchResultChunkDto] })
  results!: SearchResultChunkDto[];
}
