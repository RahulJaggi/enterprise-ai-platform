import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchRequestDto } from './dto/search-request.dto';
import { SearchResponseDataDto } from './dto/search-response.dto';
import { ApiResponseEnvelope } from '../../common/interfaces/api-response.interface';

@ApiTags('Semantic Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Perform Semantic Vector Search over Document Chunks',
    description:
      'Generates query embedding using nomic-embed-text and queries Qdrant vector database for Top-K cosine similarity matches.',
  })
  @ApiBody({ type: SearchRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Top-K semantic search hits returned successfully',
    type: SearchResponseDataDto,
  })
  async search(@Body() dto: SearchRequestDto): Promise<ApiResponseEnvelope<SearchResponseDataDto>> {
    const data = await this.searchService.searchSemanticChunks(dto);

    return {
      success: true,
      data,
      error: null,
      timestamp: new Date().toISOString(),
    };
  }
}
