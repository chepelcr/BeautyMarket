import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

interface AccordionItem {
  q: string;
  a: string;
}

interface AccordionProps {
  items:     AccordionItem[];
  className?: string;
}

export function Accordion({ items, className }: AccordionProps) {
  const [open, setOpen] = useState<number>(-1);

  return (
    <div className={cn('rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden', className)}>
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => setOpen(o => (o === i ? -1 : i))}
          className="w-full text-left px-5 py-4 hover:bg-muted/40 transition"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-sm sm:text-base">{item.q}</span>
            <Icon
              name="ChevronDown"
              size={18}
              className={cn(
                'shrink-0 transition-transform',
                open === i ? 'rotate-180 text-primary' : 'text-muted-foreground',
              )}
            />
          </div>
          {open === i && (
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed text-left">
              {item.a}
            </p>
          )}
        </button>
      ))}
    </div>
  );
}
