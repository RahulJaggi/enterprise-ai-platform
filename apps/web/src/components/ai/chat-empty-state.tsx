import { Bot, Sparkles, Terminal, Code2, ShieldCheck, Layers } from 'lucide-react';

interface ChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

const starterPrompts = [
  {
    title: 'Architecture Review',
    description: 'Explain the benefits of a modular monorepo architecture for enterprise AI.',
    icon: Layers,
    prompt:
      'Explain the benefits of a modular monorepo architecture for enterprise AI applications.',
  },
  {
    title: 'NestJS Backend',
    description: 'Help me design a clean service with Dependency Injection in NestJS.',
    icon: Terminal,
    prompt:
      'Help me design a clean service with Dependency Injection and error handling in NestJS.',
  },
  {
    title: 'Coding Standards',
    description: 'Summarize SOLID principles for TypeScript enterprise applications.',
    icon: Code2,
    prompt:
      'Summarize SOLID principles for building maintainable TypeScript enterprise applications.',
  },
  {
    title: 'Security Guards',
    description: 'How to implement zero-trust API rate limiting and correlation IDs.',
    icon: ShieldCheck,
    prompt: 'How do correlation IDs and rate-limiting middleware enhance enterprise API security?',
  },
];

export function ChatEmptyState({ onSelectPrompt }: ChatEmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-md">
        <Bot className="h-8 w-8 text-primary" />
      </div>

      <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
        Enterprise AI Playground
      </h2>

      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Privacy-first local intelligence powered by Ollama. Select a prompt or type below to begin.
      </p>

      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {starterPrompts.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              onClick={() => onSelectPrompt(item.prompt)}
              className="flex flex-col items-start rounded-xl border border-border bg-card/60 p-4 text-left shadow-xs transition-all hover:bg-accent/60 hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                <Icon className="h-4 w-4 text-primary" />
                <span>{item.title}</span>
                <Sparkles className="ml-auto h-3.5 w-3.5 text-muted-foreground opacity-60" />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
