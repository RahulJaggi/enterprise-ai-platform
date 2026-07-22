export type MessageRole = 'system' | 'user' | 'assistant';

export interface MemoryMessage {
  role: MessageRole;
  content: string;
  timestamp: string;
}
