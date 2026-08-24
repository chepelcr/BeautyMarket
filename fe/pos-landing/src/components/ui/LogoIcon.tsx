interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 28, className = '' }: LogoIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="2" y="2" width="28" height="28" rx="7" fill="hsl(var(--primary))"/>
      <path d="M9 9h14v3H9zm0 5.5h10v3H9zm0 5.5h14v3H9z" fill="hsl(var(--primary-foreground))"/>
      <circle cx="24" cy="22" r="2.6" fill="hsl(var(--primary-foreground))"/>
    </svg>
  );
}
