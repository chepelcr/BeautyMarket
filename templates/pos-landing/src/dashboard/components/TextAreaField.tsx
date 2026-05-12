import { cn } from '@/lib/cn';

interface TextAreaFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  rows?: number;
  className?: string;
  textareaClassName?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
}

/**
 * Reusable textarea field with consistent styling
 * Supports label, hint, error states, and character count
 * 
 * @example
 * <TextAreaField
 *   label="Description"
 *   value={description}
 *   onChange={setDescription}
 *   rows={4}
 *   maxLength={500}
 *   showCharCount
 * />
 */
export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  error,
  hint,
  rows = 3,
  className,
  textareaClassName,
  required,
  disabled,
  maxLength,
  showCharCount,
}: TextAreaFieldProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        className={cn(
          'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none transition resize-y',
          error
            ? 'border-destructive focus:border-destructive'
            : 'border-border focus:border-primary',
          disabled && 'opacity-50 cursor-not-allowed',
          textareaClassName
        )}
      />
      <div className="flex items-center justify-between mt-1">
        <div className="flex-1">
          {hint && !error && (
            <p className="text-xs text-muted-foreground">{hint}</p>
          )}
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>
        {showCharCount && maxLength && (
          <p className={cn(
            'text-xs',
            value.length > maxLength * 0.9 ? 'text-warning' : 'text-muted-foreground'
          )}>
            {value.length} / {maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
