import { MemoryConversation } from './models/conversation';
import { MemoryMessage } from './models/message';

export const MEMORY_PROVIDER_TOKEN = 'MEMORY_PROVIDER';

export interface IMemoryProvider {
  create(conversationId?: string): MemoryConversation;
  get(conversationId: string): MemoryConversation | null;
  append(conversationId: string, message: MemoryMessage): MemoryConversation;
  clear(conversationId: string): boolean;
}

export interface IMemoryService {
  getOrCreateConversation(conversationId?: string): Promise<MemoryConversation>;
  getConversation(conversationId: string): Promise<MemoryConversation | null>;
  appendMessage(conversationId: string, message: MemoryMessage): Promise<MemoryConversation>;
  clearConversation(conversationId: string): Promise<boolean>;
}
