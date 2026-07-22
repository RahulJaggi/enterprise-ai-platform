import { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    onSendMessage(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border bg-card/60 p-4 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-2">
        <div className="relative flex items-end rounded-xl border border-border bg-background shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for newline)"
            disabled={disabled}
            className="w-full resize-none bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          />

          <div className="p-2 shrink-0">
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || disabled}
              className="h-8 w-8 rounded-lg shadow-xs"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" />
            <span>
              Press <kbd className="rounded bg-muted px-1 text-[10px] font-mono">Enter</kbd> to send
            </span>
          </div>
          <span>Enterprise AI Platform · Privacy-First Local Inference</span>
        </div>
      </form>
    </div>
  );
}
