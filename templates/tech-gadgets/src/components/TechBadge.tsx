import { LucideIcon } from 'lucide-react';

export type BadgeVariant = 'new' | 'bestseller' | 'sale' | 'limited' | 'featured' | 'popular' | 'default';

export interface TechBadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: LucideIcon;
  glow?: boolean;
  pulse?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  new: 'bg-accent text-accent-foreground border-accent',
  bestseller: 'bg-secondary text-secondary-foreground border-secondary',
  sale: 'bg-destructive text-destructive-foreground border-destructive',
  limited: 'bg-tech-electric text-foreground border-tech-electric',
  featured: 'bg-tech-cyan text-background border-tech-cyan',
  popular: 'bg-primary text-primary-foreground border-primary',
  default: 'bg-card text-foreground border-border',
};

const glowStyles: Record<BadgeVariant, string> = {
  new: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
  bestseller: 'shadow-[0_0_15px_rgba(6,182,212,0.5)]',
  sale: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]',
  limited: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
  featured: 'shadow-[0_0_15px_rgba(6,182,212,0.6)]',
  popular: 'shadow-[0_0_15px_rgba(30,58,138,0.5)]',
  default: 'shadow-[0_0_15px_rgba(71,85,105,0.3)]',
};

export default function TechBadge({
  label,
  variant = 'default',
  icon: Icon,
  glow = false,
  pulse = false,
  className = '',
}: TechBadgeProps) {
  const baseStyles = 'inline-flex items-center space-x-1.5 px-3 py-1 rounded-sm text-xs font-medium border backdrop-blur-sm transition-all duration-300';
  const variantStyle = variantStyles[variant];
  const glowStyle = glow ? glowStyles[variant] : '';
  const pulseStyle = pulse ? 'animate-pulse' : '';

  return (
    <span className={`${baseStyles} ${variantStyle} ${glowStyle} ${pulseStyle} ${className}`}>
      {Icon && <Icon className="h-3 w-3" />}
      <span>{label}</span>
    </span>
  );
}

// Preset Badge Components for common use cases
export function NewBadge({ glow = true }: { glow?: boolean }) {
  return <TechBadge label="New" variant="new" glow={glow} />;
}

export function BestsellerBadge({ glow = true }: { glow?: boolean }) {
  return <TechBadge label="Bestseller" variant="bestseller" glow={glow} />;
}

export function SaleBadge({ glow = true, pulse = true }: { glow?: boolean; pulse?: boolean }) {
  return <TechBadge label="Sale" variant="sale" glow={glow} pulse={pulse} />;
}

export function LimitedBadge({ glow = true }: { glow?: boolean }) {
  return <TechBadge label="Limited" variant="limited" glow={glow} />;
}

export function FeaturedBadge({ glow = true }: { glow?: boolean }) {
  return <TechBadge label="Featured" variant="featured" glow={glow} />;
}

export function PopularBadge({ glow = false }: { glow?: boolean }) {
  return <TechBadge label="Popular" variant="popular" glow={glow} />;
}
