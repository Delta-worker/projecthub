'use client';

import React, { ReactNode } from 'react';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-auto min-h-16 flex-col sm:flex-row sm:h-16 items-center justify-between gap-2 sm:gap-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 py-2 sm:py-0">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold">{title}</h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4 w-full sm:w-auto">
        {/* Custom Action Slot */}
        {action && <div className="flex items-center gap-2">{action}</div>}

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative shrink-0">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User */}
        <Button variant="ghost" size="icon" className="shrink-0">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
