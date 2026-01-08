import React, { useState, useEffect } from 'react';
import { useCmsContent } from '@/hooks/use-cms-content';

interface BackgroundSectionProps {
  section: string;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function BackgroundSection({ section, className = '', children, style = {} }: BackgroundSectionProps) {
  const { getSectionStyles } = useCmsContent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className={className} style={style}>
        {children}
      </section>
    );
  }

  const backgroundStyles = getSectionStyles(section);
  
  return (
    <section 
      className={className}
      style={{
        ...backgroundStyles,
        ...style
      }}
    >
      {children}
    </section>
  );
}