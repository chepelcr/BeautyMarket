import React from 'react';

interface OrnateBorderProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'single' | 'double' | 'decorative';
}

/**
 * Ornate Border Component
 * Vintage-style decorative borders for cards and sections
 */
export function OrnateBorder({ children, className = '', variant = 'single' }: OrnateBorderProps) {
  const variantStyles = {
    single: 'border-2 border-burgundy-900/30',
    double: 'border-[3px] border-double border-burgundy-900/40',
    decorative: 'border-2 border-burgundy-900/30 relative',
  };

  return (
    <div className={`${variantStyles[variant]} rounded-md p-6 ${className}`}>
      {variant === 'decorative' && (
        <>
          {/* Corner ornaments */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-mustard-500 -translate-x-0.5 -translate-y-0.5" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-mustard-500 translate-x-0.5 -translate-y-0.5" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-mustard-500 -translate-x-0.5 translate-y-0.5" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-mustard-500 translate-x-0.5 translate-y-0.5" />
        </>
      )}
      {children}
    </div>
  );
}
