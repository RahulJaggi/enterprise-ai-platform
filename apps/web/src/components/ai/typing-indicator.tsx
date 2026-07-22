import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 py-3 px-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
        <Bot className="h-4 w-4" />
      </div>

      <div className="flex items-center gap-1.5 rounded-2xl bg-muted/60 px-4 py-2.5 text-muted-foreground border border-border">
        <span className="text-xs font-medium mr-1 text-foreground/80">AI is thinking</span>
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"></span>
      </div>
    </div>
  );
}
