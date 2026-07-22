import { useEffect, useRef } from 'react';
import { ChatMessage } from '@/api/ai-api';
import { ChatMessageItem } from './chat-message-item';
import { TypingIndicator } from './typing-indicator';

interface ChatMessagesListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export function ChatMessagesList({ messages, isLoading }: ChatMessagesListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto py-4">
      {messages.map((message) => (
        <ChatMessageItem key={message.id} message={message} />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
