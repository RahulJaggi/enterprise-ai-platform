import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RagService } from './rag.service';
import { RagRequestDto } from './dto/rag-request.dto';
import { RagResponseDataDto } from './dto/rag-response.dto';
import { ApiResponseEnvelope } from '../../common/interfaces/api-response.interface';

@ApiTags('RAG Q&A')
@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('answer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate Grounded RAG Answer to User Question',
    description:
      'Retrieves Top-K relevant document chunks from Qdrant, builds a grounded prompt context, and generates an answer via Ollama LLM with confidence score and citations.',
  })
  @ApiBody({ type: RagRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Grounded RAG answer generated successfully',
    type: RagResponseDataDto,
  })
  async answerQuestion(
    @Body() dto: RagRequestDto,
  ): Promise<ApiResponseEnvelope<RagResponseDataDto>> {
    const data = await this.ragService.answerQuestion(dto);

    return {
      success: true,
      data,
      error: null,
      timestamp: new Date().toISOString(),
    };
  }
}
