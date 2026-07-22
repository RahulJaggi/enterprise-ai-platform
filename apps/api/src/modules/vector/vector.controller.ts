import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { VectorService } from './vector.service';
import { IndexRequestDto } from './dto/index-request.dto';
import {
  VectorIndexingResponseDataDto,
  VectorCollectionStatusDto,
} from './dto/vector-status-response.dto';
import { ApiResponseEnvelope } from '../../common/interfaces/api-response.interface';

@ApiTags('Vector Store')
@Controller('documents')
export class VectorController {
  constructor(private readonly vectorService: VectorService) {}

  @Post('index')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Index Document Vector Chunks into Qdrant',
    description:
      'Ensures Qdrant collection existence with Cosine distance metric and upserts dense vector chunks with document metadata payloads.',
  })
  @ApiBody({ type: IndexRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Document vector chunks indexed successfully into Qdrant',
    type: VectorIndexingResponseDataDto,
  })
  async indexVectors(
    @Body() dto: IndexRequestDto,
  ): Promise<ApiResponseEnvelope<VectorIndexingResponseDataDto>> {
    const data = await this.vectorService.indexDocumentChunks(dto);

    return {
      success: true,
      data,
      error: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('vector-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Qdrant Vector Collection Status',
    description:
      'Retrieves active collection status, vector count, documents indexed count, and last indexing timestamp.',
  })
  @ApiResponse({
    status: 200,
    description: 'Qdrant collection status retrieved successfully',
    type: VectorCollectionStatusDto,
  })
  async getStatus(
    @Query('collectionName') collectionName?: string,
  ): Promise<ApiResponseEnvelope<VectorCollectionStatusDto>> {
    const data = await this.vectorService.getStatus(collectionName);

    return {
      success: true,
      data,
      error: null,
      timestamp: new Date().toISOString(),
    };
  }
}
