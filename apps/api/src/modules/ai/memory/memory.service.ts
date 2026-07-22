import { Injectable, Inject, Logger } from '@nestjs/common';
import { IMemoryService, IMemoryProvider, MEMORY_PROVIDER_TOKEN } from './memory.interface';
import { MemoryConversation } from './models/conversation';
import { MemoryMessage } from './models/message';

@Injectable()
export class MemoryService implements IMemoryService {
  private readonly logger = new Logger(MemoryService.name);

  constructor(
    @Inject(MEMORY_PROVIDER_TOKEN)
    private readonly memoryProvider: IMemoryProvider,
  ) {}

  async getOrCreateConversation(conversationId?: string): Promise<MemoryConversation> {
    if (conversationId) {
      const existing = this.memoryProvider.get(conversationId);
      if (existing) {
        this.logger.debug(`Retrieved existing conversation [ID: ${conversationId}]`);
        return existing;
      }
      this.logger.debug(
        `Conversation [ID: ${conversationId}] not found in memory. Creating new conversation.`,
      );
    }

    const newConversation = this.memoryProvider.create(conversationId);
    this.logger.log(`Created new conversation [ID: ${newConversation.conversationId}]`);
    return newConversation;
  }

  async getConversation(conversationId: string): Promise<MemoryConversation | null> {
    return this.memoryProvider.get(conversationId);
  }

  async appendMessage(conversationId: string, message: MemoryMessage): Promise<MemoryConversation> {
    this.logger.debug(`Appending ${message.role} message to conversation [ID: ${conversationId}]`);
    return this.memoryProvider.append(conversationId, message);
  }

  async clearConversation(conversationId: string): Promise<boolean> {
    this.logger.log(`Clearing memory for conversation [ID: ${conversationId}]`);
    return this.memoryProvider.clear(conversationId);
  }
}
