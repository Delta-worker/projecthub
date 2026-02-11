'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Kanban,
  FileText,
  Target,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onCloseMobile?: () => void;
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kanban', label: 'Kanban', icon: Kanban },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/requirements', label: 'Feature Requests', icon: Target },
  { href: '/chat', label: 'AI Chat', icon: Bot },
];

export function Sidebar({ collapsed = false, onToggle, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  PH
                </span>
              </div>
              <span className="font-semibold">ProjectHub</span>
            </Link>
          )}
          <div className="flex items-center gap-2">
            {onCloseMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onCloseMobile}
                className="lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className={cn(collapsed && 'mx-auto')}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-3">
          <Link
            href="/settings"
            onClick={onCloseMobile}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              collapsed && 'justify-center'
            )}
          >
            <Settings className="h-4 w-4" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}
