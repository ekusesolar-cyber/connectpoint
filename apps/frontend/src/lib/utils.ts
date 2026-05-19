import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'XAF'): string {
  return `${amount.toLocaleString()} ${currency}`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'text-secondary',
    inactive: 'text-text-secondary',
    pending: 'text-primary',
    approved: 'text-secondary',
    rejected: 'text-danger',
    success: 'text-secondary',
    failed: 'text-danger',
    refunded: 'text-accent',
    free: 'text-accent',
    paid: 'text-primary',
    true: 'text-secondary',
    false: 'text-text-secondary',
  };
  return colors[status.toLowerCase()] || 'text-text-secondary';
}

export function getStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    active: 'bg-secondary/20 text-secondary border-secondary/30',
    inactive: 'bg-muted text-muted-foreground border-border',
    pending: 'bg-primary/20 text-primary border-primary/30',
    approved: 'bg-secondary/20 text-secondary border-secondary/30',
    rejected: 'bg-danger/20 text-danger border-danger/30',
    success: 'bg-secondary/20 text-secondary border-secondary/30',
    failed: 'bg-danger/20 text-danger border-danger/30',
    refunded: 'bg-accent/20 text-accent border-accent/30',
  };
  return classes[status.toLowerCase()] || 'bg-muted text-muted-foreground border-border';
}
