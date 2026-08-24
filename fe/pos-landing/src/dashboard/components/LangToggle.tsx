import { cn } from '@/lib/cn';

interface LangToggleProps {
  value: 'es' | 'en';
  onChange: (lang: 'es' | 'en') => void;
  label?: string;
  className?: string;
}

/**
 * Language toggle component (ES/EN)
 * Used across 11+ dashboard tabs for consistent language switching
 * 
 * @example
 * <LangToggle value={lang} onChange={setLang} />
 */
export function LangToggle({ value, onChange, label = 'Idioma', className }: LangToggleProps) {
  return (
    <div className={cn('card p-5', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-base">{label}</h3>
        <div className="flex gap-2">
          {(['es', 'en'] as const).map(l => (
            <button
              key={l}
              onClick={() => onChange(l)}
              className={cn(
                'h-9 px-4 rounded-md text-sm font-semibold transition',
                value === l
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/70'
              )}
            >
              {l === 'es' ? '🇪🇸 Español' : '🇬🇧 English'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
