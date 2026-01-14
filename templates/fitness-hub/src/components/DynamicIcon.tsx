import * as LucideIcons from 'lucide-react';

interface DynamicIconProps {
  icon?: string | null;
  fallback?: keyof typeof LucideIcons;
  className?: string;
  size?: number;
}

export function DynamicIcon({ icon, fallback = 'Sparkles', className = '', size }: DynamicIconProps) {
  // If no icon provided, use fallback
  if (!icon) {
    const FallbackIcon = LucideIcons[fallback] as React.ComponentType<any>;
    return <FallbackIcon className={className} size={size} />;
  }

  // If it's a URL (starts with http:// or https://)
  if (icon.startsWith('http://') || icon.startsWith('https://')) {
    return <img src={icon} alt="Icon" className={className} />;
  }

  // If it's a Lucide icon name
  const IconComponent = LucideIcons[icon as keyof typeof LucideIcons] as React.ComponentType<any>;
  if (IconComponent) {
    return <IconComponent className={className} size={size} />;
  }

  // Otherwise treat as emoji/text
  return <span className={className}>{icon}</span>;
}
