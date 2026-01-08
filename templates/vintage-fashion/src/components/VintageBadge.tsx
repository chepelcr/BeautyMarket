import React from 'react';

interface VintageBadgeProps {
  children: React.ReactNode;
  variant?: 'new' | 'sale' | 'bestseller' | 'vintage' | 'limited';
  className?: string;
}

/**
 * Vintage Badge Component
 * Decorative badges for product tags and labels
 */
export function VintageBadge({ children, variant = 'vintage', className = '' }: VintageBadgeProps) {
  const variantStyles = {
    new: 'bg-mustard-500 text-burgundy-900 border-mustard-600',
    sale: 'bg-accent text-accent-foreground border-accent',
    bestseller: 'bg-burgundy-900 text-cream-50 border-burgundy-800',
    vintage: 'bg-cream-100 text-burgundy-900 border-burgundy-900/30',
    limited: 'bg-burgundy-800 text-mustard-500 border-mustard-500',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-serif font-semibold tracking-widest uppercase rounded-full border-2 ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
