import { cn } from '@/lib/cn';
import type { HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'primary' | 'warning' | 'success' | 'info';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-muted text-muted-foreground border border-border',
  primary: 'bg-primary/10 text-primary border border-primary/30',
  warning: 'bg-warning/15 text-warning border border-warning/30',
  success: 'bg-success/12 text-success border border-success/30',
  info:    'bg-info/10 text-info border border-info/30',
};

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'badge px-2.5 py-0.5 rounded-full text-[10px]',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
