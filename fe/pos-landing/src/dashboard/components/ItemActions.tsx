import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

interface ItemActionsProps {
  index: number;
  total: number;
  onMove?: (direction: 'up' | 'down') => void;
  onDelete?: () => void;
  isDragging?: boolean;
  showDragHandle?: boolean;
  onDragStart?: () => void;
  className?: string;
}

/**
 * Reusable action buttons for list items (move up/down, delete, drag handle)
 * Provides consistent UI for item manipulation across tabs
 * 
 * @example
 * <ItemActions
 *   index={i}
 *   total={items.length}
 *   onMove={(dir) => moveItem(i, dir)}
 *   onDelete={() => deleteItem(i)}
 *   showDragHandle
 *   onDragStart={() => handleDragStart(i)}
 * />
 */
export function ItemActions({
  index,
  total,
  onMove,
  onDelete,
  isDragging,
  showDragHandle,
  onDragStart,
  className,
}: ItemActionsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Drag handle */}
      {showDragHandle && onDragStart && (
        <button
          className={cn(
            'w-6 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing shrink-0 transition',
            isDragging && 'opacity-50'
          )}
          title="Arrastrar para reordenar"
          onMouseDown={onDragStart}
        >
          <Icon name="GripVertical" size={14} />
        </button>
      )}

      {/* Move up */}
      {onMove && index > 0 && (
        <button
          onClick={() => onMove('up')}
          className="w-7 h-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center shrink-0"
          title="Mover arriba"
        >
          <Icon name="ArrowUp" size={14} />
        </button>
      )}

      {/* Move down */}
      {onMove && index < total - 1 && (
        <button
          onClick={() => onMove('down')}
          className="w-7 h-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center shrink-0"
          title="Mover abajo"
        >
          <Icon name="ArrowDown" size={14} />
        </button>
      )}

      {/* Delete */}
      {onDelete && (
        <button
          onClick={onDelete}
          className="w-7 h-7 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center shrink-0"
          title="Eliminar"
        >
          <Icon name="Trash2" size={14} />
        </button>
      )}
    </div>
  );
}
