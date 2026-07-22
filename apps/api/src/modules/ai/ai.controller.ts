import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDataDto } from './dto/chat-response.dto';
import { ApiResponseEnvelope } from '../../common/interfaces/api-response.interface';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate Completion from Local Ollama AI Provider',
    description:
      'Dispatches a prompt message to the configured Ollama LLM provider and returns the generated completion text.',
  })
  @ApiBody({ type: ChatRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Completion successfully generated',
    type: ChatResponseDataDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid prompt payload or missing required fields',
  })
  @ApiResponse({
    status: 503,
    description: 'Ollama service unavailable or unreachable',
  })
  @ApiResponse({
    status: 504,
    description: 'Ollama model inference request timed out',
  })
  async chat(@Body() dto: ChatRequestDto): Promise<ApiResponseEnvelope<ChatResponseDataDto>> {
    const data = await this.aiService.chat(dto);

    return {
      success: true,
      data,
      error: null,
      timestamp: new Date().toISOString(),
    };
  }
}
