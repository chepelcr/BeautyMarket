import { cn } from '@/lib/cn';

interface NumberFieldProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  inputClassName?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Reusable number input field with consistent styling
 * Supports label, hint, error states, and min/max/step constraints
 * 
 * @example
 * <NumberField
 *   label="Free Documents"
 *   value={freeDocs}
 *   onChange={setFreeDocs}
 *   min={0}
 *   step={1}
 * />
 */
export function NumberField({
  label,
  value,
  onChange,
  placeholder,
  error,
  hint,
  min,
  max,
  step,
  className,
  inputClassName,
  required,
  disabled,
}: NumberFieldProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value) || 0)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={cn(
          'w-full h-10 rounded-md border bg-background px-3 text-sm font-mono focus:outline-none transition',
          error
            ? 'border-destructive focus:border-destructive'
            : 'border-border focus:border-primary',
          disabled && 'opacity-50 cursor-not-allowed',
          inputClassName
        )}
      />
      {hint && !error && (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
