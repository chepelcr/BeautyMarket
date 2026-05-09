import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?:    Size;
  asChild?: boolean;
}

const variants: Record<Variant, string> = {
  primary:   'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  ghost:     'hover:bg-muted text-foreground',
  outline:   'border border-border bg-card hover:bg-muted',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-sm gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
