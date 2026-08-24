import { useEffect } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

type ToastKind = 'success' | 'info' | 'error';

interface ToastProps {
  msg:    string;
  kind?:  ToastKind;
  onDone: () => void;
  duration?: number;
}

const kindStyles: Record<ToastKind, string> = {
  success: 'bg-success text-success-foreground',
  info:    'bg-foreground text-background',
  error:   'bg-destructive text-destructive-foreground',
};

export function Toast({ msg, kind = 'success', onDone, duration = 2400 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [onDone, duration]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] toast pointer-events-none">
      <div className={cn('px-4 py-2.5 rounded-md shadow-lg text-[13px] font-semibold flex items-center gap-2', kindStyles[kind])}>
        {kind === 'success' && <Icon name="BadgeCheck" size={15} />}
        {kind === 'error'   && <Icon name="X" size={15} />}
        {msg}
      </div>
    </div>
  );
}
