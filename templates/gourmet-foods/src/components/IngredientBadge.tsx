import { Leaf, Award, Flame } from 'lucide-react';

interface IngredientBadgeProps {
  type: 'organic' | 'premium' | 'fresh' | 'local' | 'seasonal';
  label: string;
  className?: string;
}

export default function IngredientBadge({ type, label, className = '' }: IngredientBadgeProps) {
  const badges = {
    organic: {
      icon: Leaf,
      className: 'ingredient-badge ingredient-badge-organic',
    },
    premium: {
      icon: Award,
      className: 'ingredient-badge ingredient-badge-premium',
    },
    fresh: {
      icon: Flame,
      className: 'ingredient-badge ingredient-badge-fresh',
    },
    local: {
      icon: Leaf,
      className: 'ingredient-badge bg-blue-100 text-blue-800 border border-blue-200',
    },
    seasonal: {
      icon: Flame,
      className: 'ingredient-badge bg-purple-100 text-purple-800 border border-purple-200',
    },
  };

  const badge = badges[type];
  const Icon = badge.icon;

  return (
    <span className={`${badge.className} ${className}`}>
      <Icon className="w-3.5 h-3.5 mr-1" />
      {label}
    </span>
  );
}
