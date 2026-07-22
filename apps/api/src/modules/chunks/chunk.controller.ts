import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ChunkService } from './chunk.service';
import { ChunkRequestDto } from './dto/chunk-request.dto';
import { ChunkResponseDataDto } from './dto/chunk-response.dto';
import { ApiResponseEnvelope } from '../../common/interfaces/api-response.interface';

@ApiTags('Chunks')
@Controller('documents')
export class ChunkController {
  constructor(private readonly chunkService: ChunkService) {}

  @Post('chunk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Chunk Document Text into Fixed-Size Overlapping Segments',
    description:
      'Divides raw document text into fixed-size character chunks with configurable overlap parameters.',
  })
  @ApiBody({ type: ChunkRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Document text chunked successfully',
    type: ChunkResponseDataDto,
  })
  async chunkDocument(
    @Body() dto: ChunkRequestDto,
  ): Promise<ApiResponseEnvelope<ChunkResponseDataDto>> {
    const data = this.chunkService.processChunking(dto);

    return {
      success: true,
      data,
      error: null,
      timestamp: new Date().toISOString(),
    };
  }
}
