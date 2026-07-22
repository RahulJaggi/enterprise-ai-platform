import { Bot, User } from 'lucide-react';
import { ChatMessage } from '@/api/ai-api';
import { cn } from '@/lib/utils';

interface ChatMessageItemProps {
  message: ChatMessage;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex items-start gap-3 py-3 px-4 transition-colors',
        isUser ? 'bg-transparent' : 'bg-card/40 border-y border-border/40',
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold shadow-xs',
          isUser
            ? 'bg-primary text-primary-foreground border-primary/20'
            : 'bg-accent text-accent-foreground border-border',
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
      </div>

      <div className="flex-1 space-y-1.5 overflow-hidden">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{isUser ? 'You' : 'AI Assistant'}</span>
          <time className="text-[10px] opacity-70">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  );
}
