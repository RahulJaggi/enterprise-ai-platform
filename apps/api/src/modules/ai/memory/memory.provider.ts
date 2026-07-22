import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IMemoryProvider } from './memory.interface';
import { MemoryConversation } from './models/conversation';
import { MemoryMessage } from './models/message';
import { InMemoryStore } from './stores/in-memory.store';

@Injectable()
export class MemoryProvider implements IMemoryProvider {
  private readonly logger = new Logger(MemoryProvider.name);

  constructor(private readonly store: InMemoryStore) {}

  create(customId?: string): MemoryConversation {
    const conversationId = customId || `conv_${randomUUID().replace(/-/g, '')}`;
    const now = new Date().toISOString();

    const conversation: MemoryConversation = {
      conversationId,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    this.store.set(conversation);
    return conversation;
  }

  get(conversationId: string): MemoryConversation | null {
    return this.store.get(conversationId);
  }

  append(conversationId: string, message: MemoryMessage): MemoryConversation {
    let conversation = this.store.get(conversationId);

    if (!conversation) {
      this.logger.warn(
        `Conversation [ID: ${conversationId}] not found during append. Auto-creating.`,
      );
      conversation = this.create(conversationId);
    }

    conversation.messages.push(message);
    conversation.updatedAt = new Date().toISOString();

    this.store.set(conversation);
    return conversation;
  }

  clear(conversationId: string): boolean {
    return this.store.delete(conversationId);
  }
}
