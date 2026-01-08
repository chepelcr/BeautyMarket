import React from 'react';

interface VintageCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  sepia?: boolean;
}

/**
 * Vintage Card Component
 * Card component with vintage styling and optional sepia effect
 */
export function VintageCard({ children, className = '', hover = false, sepia = false }: VintageCardProps) {
  const hoverStyles = hover ? 'hover:shadow-vintage-lg hover:-translate-y-1 transition-all duration-300' : '';
  const sepiaStyles = sepia ? 'sepia' : '';

  return (
    <div className={`bg-card rounded-md shadow-vintage ${hoverStyles} ${sepiaStyles} ${className}`}>
      {children}
    </div>
  );
}

interface VintageCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function VintageCardHeader({ children, className = '' }: VintageCardHeaderProps) {
  return (
    <div className={`p-6 border-b border-border ${className}`}>
      {children}
    </div>
  );
}

interface VintageCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function VintageCardContent({ children, className = '' }: VintageCardContentProps) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

interface VintageCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function VintageCardFooter({ children, className = '' }: VintageCardFooterProps) {
  return (
    <div className={`p-6 border-t border-border ${className}`}>
      {children}
    </div>
  );
}
