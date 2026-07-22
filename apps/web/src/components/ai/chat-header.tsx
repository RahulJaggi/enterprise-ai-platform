import { Cpu, Zap, Wifi } from 'lucide-react';
import { usePlaygroundStore } from '@/store/use-playground-store';

export function ChatHeader() {
  const selectedModel = usePlaygroundStore((state) => state.selectedModel);
  const selectedProvider = usePlaygroundStore((state) => state.selectedProvider);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card/60 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-md bg-accent/50 px-2.5 py-1 text-xs font-medium text-foreground border border-border">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span>{selectedProvider}</span>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-accent/50 px-2.5 py-1 text-xs font-medium text-foreground border border-border">
          <Cpu className="h-3.5 w-3.5 text-blue-500" />
          <span className="font-mono">{selectedModel}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-emerald-500 font-medium border border-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <Wifi className="h-3 w-3 ml-0.5" />
          <span>Local Engine Connected</span>
        </div>
      </div>
    </header>
  );
}
