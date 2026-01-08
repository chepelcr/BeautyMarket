import React from 'react';

interface VintageButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

/**
 * Vintage Button Component
 * Styled buttons matching vintage fashion aesthetic
 */
export function VintageButton({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: VintageButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-serif font-semibold tracking-wider uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 shadow-vintage hover:shadow-vintage-lg border-2 border-burgundy-900',
    secondary: 'bg-mustard-500 text-burgundy-900 hover:bg-mustard-600 shadow-vintage hover:shadow-vintage-lg border-2 border-mustard-500',
    outline: 'border-2 border-burgundy-900 text-burgundy-900 hover:bg-burgundy-900 hover:text-cream-50',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs rounded-md',
    md: 'px-6 py-3 text-sm rounded-md',
    lg: 'px-8 py-4 text-base rounded-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
