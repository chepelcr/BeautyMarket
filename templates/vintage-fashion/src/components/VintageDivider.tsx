import React from 'react';

interface VintageDividerProps {
  text?: string;
  className?: string;
}

/**
 * Vintage Divider Component
 * Decorative section divider with optional centered text
 */
export function VintageDivider({ text, className = '' }: VintageDividerProps) {
  return (
    <div className={`ornate-divider my-8 ${className}`}>
      {text && (
        <span className="inline-block px-4 bg-background font-serif text-burgundy-900 text-sm tracking-widest uppercase">
          {text}
        </span>
      )}
    </div>
  );
}
