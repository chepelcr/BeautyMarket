import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

interface AddButtonProps {
  onClick: () => void;
  label?: string;
  variant?: 'default' | 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

/**
 * Reusable "Add" button component
 * Used for adding new items to lists across tabs
 * 
 * @example
 * <AddButton onClick={addItem} label="Agregar Plan" variant="primary" />
 */
export function AddButton({
  onClick,
  label = 'Agregar',
  variant = 'default',
  size = 'md',
  disabled,
  className,
}: AddButtonProps) {
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
  };

  const variantClasses = {
    default: 'border border-border bg-card hover:bg-muted text-foreground',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-md font-medium flex items-center justify-center gap-2 transition',
        sizeClasses[size],
        variantClasses[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <Icon name="Plus" size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
      {label}
    </button>
  );
}
