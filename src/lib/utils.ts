import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 8);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    backlog: 'bg-slate-500',
    requirements: 'bg-violet-500',
    development: 'bg-amber-500',
    testing: 'bg-blue-500',
    done: 'bg-emerald-500',
  };
  return colors[status] || 'bg-slate-500';
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    must: 'text-red-500 bg-red-500/10',
    should: 'text-amber-500 bg-amber-500/10',
    could: 'text-blue-500 bg-blue-500/10',
    wont: 'text-slate-500 bg-slate-500/10',
  };
  return colors[priority] || 'text-slate-500 bg-slate-500/10';
}

export function getPriorityIcon(priority: string): string {
  const icons: Record<string, string> = {
    must: '🔴',
    should: '🟠',
    could: '🔵',
    wont: '⚪',
  };
  return icons[priority] || '⚪';
}

export function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    story: '📝',
    bug: '🐛',
    chore: '🔧',
    epic: '⚡',
  };
  return icons[type] || '📝';
}
