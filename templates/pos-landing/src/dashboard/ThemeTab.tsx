import { useConfig } from '@/hooks/useConfig';
import { cn } from '@/lib/cn';
import type { AccentKey } from '@/types';

const ACCENTS: Array<{ key: AccentKey; label: string; color: string }> = [
  { key: 'orange', label: 'Orange', color: '#e0640a' },
  { key: 'indigo', label: 'Indigo', color: '#4651cc' },
  { key: 'teal',   label: 'Teal',   color: '#1a7a6d' },
  { key: 'violet', label: 'Violet', color: '#6b3eb8' },
];

export function ThemeTab() {
  const { config, setConfig } = useConfig();
  const { accent, dark }      = config.theme;
  const { tokens }            = config;

  const setAccent = (a: AccentKey) =>
    setConfig({ ...config, theme: { ...config.theme, accent: a } });
  const setDark = (d: boolean) =>
    setConfig({ ...config, theme: { ...config.theme, dark: d } });
  const setRadius = (r: string) =>
    setConfig({ ...config, tokens: { ...tokens, radius: r } });

  return (
    <div className="space-y-6">
      {/* Accent */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Accent Color
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ACCENTS.map(a => (
            <button
              key={a.key}
              onClick={() => setAccent(a.key)}
              className={cn(
                'h-12 rounded-md border-2 flex items-center gap-3 px-3 text-sm font-semibold transition',
                accent === a.key ? 'border-foreground' : 'border-border hover:border-foreground/40',
              )}
            >
              <span className="w-6 h-6 rounded-full" style={{ background: a.color }} />
              {a.label}
              {accent === a.key && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Dark mode */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Dark Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[false, true].map(d => (
            <button
              key={String(d)}
              onClick={() => setDark(d)}
              className={cn(
                'h-12 rounded-md border-2 text-sm font-semibold transition',
                dark === d ? 'border-foreground bg-muted' : 'border-border hover:border-foreground/40',
              )}
            >
              {d ? '🌙 Dark' : '☀️ Light'}
            </button>
          ))}
        </div>
      </div>

      {/* Border radius */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Border Radius
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={16}
            step={1}
            value={parseFloat(tokens.radius) * 16}
            onChange={e => setRadius(`${Number(e.target.value) / 16}rem`)}
            className="flex-1"
          />
          <span className="text-sm font-mono w-16 text-right">{tokens.radius}</span>
        </div>
      </div>

      {/* Custom palette per accent */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Active Palette ({accent}) — Advanced
        </label>
        <div className="space-y-2">
          {Object.entries(tokens.accentPalettes[accent]).map(([key, val]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground w-36 shrink-0">{key}</span>
              <input
                type="text"
                value={val}
                onChange={e => {
                  const newPalettes = {
                    ...tokens.accentPalettes,
                    [accent]: { ...tokens.accentPalettes[accent], [key]: e.target.value },
                  };
                  setConfig({ ...config, tokens: { ...tokens, accentPalettes: newPalettes } });
                }}
                className="flex-1 h-8 rounded border border-border bg-background px-2 text-xs font-mono focus:outline-none focus:border-primary"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
