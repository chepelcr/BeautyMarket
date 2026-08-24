import { cn } from '@/lib/cn';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 40, className }: SpinnerProps) {
  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full border-4 border-muted" />
      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );
}
