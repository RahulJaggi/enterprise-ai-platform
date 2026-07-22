import { useAppStore } from '@/store/use-app-store';
import { useTheme } from '@/providers/theme-provider';
import { Button } from '@/components/ui/button';
import { Menu, Sun, Moon, Cpu } from 'lucide-react';

export function Header() {
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 font-semibold">
          <Cpu className="h-5 w-5 text-primary" />
          <span>Enterprise AI Platform</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}
