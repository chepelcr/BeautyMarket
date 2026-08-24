import { cn } from '@/lib/cn';

interface StatusDotProps {
  className?: string;
  size?: number;
}

export function StatusDot({ className, size = 8 }: StatusDotProps) {
  return (
    <span
      className={cn('status-dot-live inline-block', className)}
      style={{ width: size, height: size }}
    />
  );
}
