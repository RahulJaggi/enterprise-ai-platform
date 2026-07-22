import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import {
  AI_PROVIDER_TOKEN,
  IAiProvider,
  StreamEventData,
} from '../../providers/ollama/ollama.interface';
import { PromptService } from './prompts/prompt.service';
import { MemoryService } from './memory/memory.service';
import { MemoryConversation } from './memory/models/conversation';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDataDto } from './dto/chat-response.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @Inject(AI_PROVIDER_TOKEN)
    private readonly aiProvider: IAiProvider,
    private readonly promptService: PromptService,
    private readonly memoryService: MemoryService,
  ) {}

  async chat(dto: ChatRequestDto): Promise<ChatResponseDataDto> {
    const conversation = await this.memoryService.getOrCreateConversation(dto.conversationId);

    const historyMessages = [...conversation.messages];

    await this.memoryService.appendMessage(conversation.conversationId, {
      role: 'user',
      content: dto.message,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `Processing chat completion [ConversationId: ${conversation.conversationId}, Provider: ${this.aiProvider.providerName}]`,
    );

    const formattedPrompt = this.promptService.buildPrompt({
      userPrompt: dto.message,
      templateType: 'assistant',
      history: historyMessages,
    });

    const completion = await this.aiProvider.generateCompletion({
      prompt: formattedPrompt.prompt,
      systemPrompt: formattedPrompt.systemPrompt,
    });

    await this.memoryService.appendMessage(conversation.conversationId, {
      role: 'assistant',
      content: completion.text,
      timestamp: new Date().toISOString(),
    });

    return {
      conversationId: conversation.conversationId,
      response: completion.text,
    };
  }

  async *chatStream(dto: ChatRequestDto, signal?: AbortSignal): AsyncGenerator<StreamEventData> {
    const conversation = await this.memoryService.getOrCreateConversation(dto.conversationId);

    const historyMessages = [...conversation.messages];

    await this.memoryService.appendMessage(conversation.conversationId, {
      role: 'user',
      content: dto.message,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `Initiating streaming chat completion [ConversationId: ${conversation.conversationId}, Provider: ${this.aiProvider.providerName}]`,
    );

    const formattedPrompt = this.promptService.buildPrompt({
      userPrompt: dto.message,
      templateType: 'assistant',
      history: historyMessages,
    });

    let assistantAccumulatedText = '';

    const streamGenerator = this.aiProvider.generateStreamingCompletion(
      {
        prompt: formattedPrompt.prompt,
        systemPrompt: formattedPrompt.systemPrompt,
      },
      signal,
    );

    for await (const chunk of streamGenerator) {
      if (chunk.event === 'start') {
        yield {
          event: 'start',
          data: {
            ...chunk.data,
            conversationId: conversation.conversationId,
          },
        };
        continue;
      }

      if (chunk.event === 'token' && chunk.data.token) {
        assistantAccumulatedText += chunk.data.token;
      }

      yield chunk;
    }

    if (assistantAccumulatedText.length > 0) {
      await this.memoryService.appendMessage(conversation.conversationId, {
        role: 'assistant',
        content: assistantAccumulatedText,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async getConversation(conversationId: string): Promise<MemoryConversation> {
    const conversation = await this.memoryService.getConversation(conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversation [ID: ${conversationId}] not found in memory`);
    }
    return conversation;
  }

  async clearConversation(
    conversationId: string,
  ): Promise<{ cleared: boolean; conversationId: string }> {
    const cleared = await this.memoryService.clearConversation(conversationId);
    if (!cleared) {
      throw new NotFoundException(`Conversation [ID: ${conversationId}] not found in memory`);
    }
    return { cleared: true, conversationId };
  }
}
