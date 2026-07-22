import { MemoryMessage } from './message';

export interface MemoryConversation {
  conversationId: string;
  messages: MemoryMessage[];
  createdAt: string;
  updatedAt: string;
}
