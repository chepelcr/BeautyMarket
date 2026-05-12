import { ReactNode, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

interface CollapsibleProps {
  title: string | ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

/**
 * Reusable collapsible/expandable section component
 * Used for grouping related content that can be shown/hidden
 * 
 * @example
 * <Collapsible title="Advanced Settings" defaultOpen={false}>
 *   <div>Content here</div>
 * </Collapsible>
 */
export function Collapsible({
  title,
  children,
  defaultOpen = true,
  className,
  headerClassName,
  contentClassName,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('border border-border rounded-md overflow-hidden', className)}>
      <button
        onClick={() => setIsOpen(o => !o)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 bg-muted/40 text-sm font-semibold hover:bg-muted/60 transition',
          headerClassName
        )}
      >
        {typeof title === 'string' ? <span>{title}</span> : title}
        <Icon
          name="ChevronDown"
          size={16}
          className={cn('transition-transform', isOpen && 'rotate-180')}
        />
      </button>
      {isOpen && (
        <div className={cn('px-4 py-3', contentClassName)}>
          {children}
        </div>
      )}
    </div>
  );
}
