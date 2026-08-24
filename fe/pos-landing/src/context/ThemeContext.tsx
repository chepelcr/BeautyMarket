import { useEffect } from 'react';
import { useConfigContext } from './ConfigContext';

export function ThemeApplicator() {
  const { config } = useConfigContext();
  const { accent, dark } = config.theme;
  const { tokens } = config;
  const palette = tokens.accentPalettes[accent];
  const neutral = tokens.neutral;
  const semantic = tokens.semantic;

  useEffect(() => {
    const root = document.documentElement;
    const set = (k: string, v: string) => root.style.setProperty(k, v);

    // Accent palette (switches between light/dark variants)
    set('--primary',           dark ? palette.primaryDark      : palette.primary);
    set('--accent',            dark ? palette.accentDark       : palette.accent);
    set('--accent-foreground', dark ? palette.accentFgDark     : palette.accentForeground);
    set('--ring',              dark ? palette.ringDark         : palette.ring);

    // Neutral tokens
    set('--background',        dark ? neutral.backgroundDark   : neutral.background);
    set('--foreground',        dark ? neutral.foregroundDark   : neutral.foreground);
    set('--card',              dark ? neutral.cardDark         : neutral.card);
    set('--card-foreground',   dark ? neutral.foregroundDark   : neutral.foreground);
    set('--muted',             dark ? neutral.mutedDark        : neutral.muted);
    set('--muted-foreground',  dark ? neutral.mutedFgDark      : neutral.mutedFg);
    set('--border',            dark ? neutral.borderDark       : neutral.border);
    set('--input',             dark ? neutral.borderDark       : neutral.border);

    // Semantic tokens
    set('--success',     dark ? semantic.successDark     : semantic.success);
    set('--warning',     dark ? semantic.warningDark     : semantic.warning);
    set('--destructive', dark ? semantic.destructiveDark : semantic.destructive);
    set('--info',        dark ? semantic.infoDark        : semantic.info);

    // Radius
    set('--radius', tokens.radius);

    // Dark class
    root.classList.toggle('dark', dark);
  }, [accent, dark, palette, neutral, semantic, tokens.radius]);

  return null;
}
