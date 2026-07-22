import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { EmbeddingService } from './embedding.service';
import { EmbeddingRequestDto } from './dto/embedding-request.dto';
import { EmbeddingResponseDataDto } from './dto/embedding-response.dto';
import { ApiResponseEnvelope } from '../../common/interfaces/api-response.interface';

@ApiTags('Embeddings')
@Controller('documents')
export class EmbeddingController {
  constructor(private readonly embeddingService: EmbeddingService) {}

  @Post('embed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate Embeddings for Document Chunks',
    description:
      'Generates dense vector embeddings for document chunks using the configured Ollama embedding model and records dimension and generation duration.',
  })
  @ApiBody({ type: EmbeddingRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Embeddings generated successfully for document chunks',
    type: EmbeddingResponseDataDto,
  })
  async generateEmbeddings(
    @Body() dto: EmbeddingRequestDto,
  ): Promise<ApiResponseEnvelope<EmbeddingResponseDataDto>> {
    const data = await this.embeddingService.generateChunkEmbeddings(dto);

    return {
      success: true,
      data,
      error: null,
      timestamp: new Date().toISOString(),
    };
  }
}
