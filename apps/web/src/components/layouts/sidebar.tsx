import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/use-app-store';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Bot, Database, Settings, Shield, Sparkles } from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'AI Playground', href: '/ai', icon: Sparkles },
  { name: 'AI Agents', href: '/agents', icon: Bot, disabled: true },
  { name: 'Knowledge Base', href: '/knowledge', icon: Database, disabled: true },
  { name: 'Security & Audit', href: '/security', icon: Shield, disabled: true },
  { name: 'Settings', href: '/settings', icon: Settings, disabled: true },
];

export function Sidebar() {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const location = useLocation();

  if (!sidebarOpen) return null;

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card/50 p-4 transition-all duration-200">
      <nav className="flex flex-col gap-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.disabled ? '#' : item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
