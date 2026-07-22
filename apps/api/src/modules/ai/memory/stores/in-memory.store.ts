import { Injectable, Logger } from '@nestjs/common';
import { MemoryConversation } from '../models/conversation';

@Injectable()
export class InMemoryStore {
  private readonly logger = new Logger(InMemoryStore.name);
  private readonly store = new Map<string, MemoryConversation>();

  get(conversationId: string): MemoryConversation | null {
    return this.store.get(conversationId) || null;
  }

  set(conversation: MemoryConversation): void {
    this.store.set(conversation.conversationId, conversation);
    this.logger.debug(
      `Saved conversation [ID: ${conversation.conversationId}, MessagesCount: ${conversation.messages.length}]`,
    );
  }

  delete(conversationId: string): boolean {
    const deleted = this.store.delete(conversationId);
    if (deleted) {
      this.logger.debug(`Cleared conversation memory [ID: ${conversationId}]`);
    }
    return deleted;
  }

  has(conversationId: string): boolean {
    return this.store.has(conversationId);
  }
}
