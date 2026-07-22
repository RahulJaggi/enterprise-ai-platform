import { ApiProperty } from '@nestjs/swagger';
import { SearchResultChunkDto } from '../../search/dto/search-response.dto';

export class RagSourceDto {
  @ApiProperty({ example: 'Appoinment _Rahul_Designer.pdf' })
  filename!: string;

  @ApiProperty({ example: 1 })
  pageNumber!: number;

  @ApiProperty({ example: 'chk_0_be3badac' })
  chunkId!: string;
}

export class RagResponseDataDto {
  @ApiProperty({ example: 'What is the compensation structure?' })
  question!: string;

  @ApiProperty({
    example:
      'According to the appointment letter, the Annual Total Employment Cost is Two Lac Sixteen Thousand.',
  })
  answer!: string;

  @ApiProperty({ example: 0.88, description: 'RAG confidence score from 0.0 to 1.0' })
  confidence!: number;

  @ApiProperty({ type: [RagSourceDto] })
  sources!: RagSourceDto[];

  @ApiProperty({ type: [SearchResultChunkDto] })
  retrievedChunks!: SearchResultChunkDto[];

  @ApiProperty({ example: 650, description: 'Total execution time in ms' })
  executionTimeMs!: number;
}
