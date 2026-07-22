import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AiService } from './ai.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDataDto } from './dto/chat-response.dto';
import { MemoryConversation } from './memory/models/conversation';
import { ApiResponseEnvelope } from '../../common/interfaces/api-response.interface';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

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

  @Post('chat/stream')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stream AI Completion via Server-Sent Events (SSE)',
    description:
      'Dispatches a prompt message to the Ollama LLM provider and streams tokens back to the client in real-time via SSE events (start, token, complete, error).',
  })
  @ApiBody({ type: ChatRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Server-Sent Event stream opened (text/event-stream)',
  })
  async chatStream(
    @Body() dto: ChatRequestDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const abortController = new AbortController();

    req.on('close', () => {
      if (!res.writableEnded) {
        this.logger.warn(
          'Client disconnected from SSE stream. Aborting downstream Ollama request.',
        );
        abortController.abort();
      }
    });

    try {
      const streamGenerator = this.aiService.chatStream(dto, abortController.signal);

      for await (const eventData of streamGenerator) {
        if (res.writableEnded) break;

        res.write(`event: ${eventData.event}\n`);
        res.write(`data: ${JSON.stringify(eventData.data)}\n\n`);
      }
    } catch (error: unknown) {
      if (!res.writableEnded) {
        const errorMessage = error instanceof Error ? error.message : 'Streaming error occurred';
        this.logger.error(`SSE stream error: ${errorMessage}`);
        res.write(`event: error\n`);
        res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      }
    } finally {
      if (!res.writableEnded) {
        res.end();
      }
    }
  }

  @Get('chat/:conversationId')
  @ApiOperation({
    summary: 'Get Conversation History by Conversation ID',
    description: 'Retrieves all dialogue messages recorded in memory for a given conversation ID.',
  })
  @ApiParam({ name: 'conversationId', description: 'Target conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation history retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Conversation ID not found in memory',
  })
  async getConversation(
    @Param('conversationId') conversationId: string,
  ): Promise<ApiResponseEnvelope<MemoryConversation>> {
    const data = await this.aiService.getConversation(conversationId);

    return {
      success: true,
      data,
      error: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('chat/:conversationId')
  @ApiOperation({
    summary: 'Delete Conversation Memory',
    description:
      'Clears and deletes all message history recorded in memory for a given conversation ID.',
  })
  @ApiParam({
    name: 'conversationId',
    description: 'Target conversation ID to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversation memory cleared successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Conversation ID not found in memory',
  })
  async clearConversation(
    @Param('conversationId') conversationId: string,
  ): Promise<ApiResponseEnvelope<{ cleared: boolean; conversationId: string }>> {
    const data = await this.aiService.clearConversation(conversationId);

    return {
      success: true,
      data,
      error: null,
      timestamp: new Date().toISOString(),
    };
  }
}
