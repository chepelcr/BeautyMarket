import { useConfigContext } from '@/context/ConfigContext';
import type { AccentKey } from '@/types';

export function useTheme() {
  const { config, setConfig } = useConfigContext();

  const setAccent = (accent: AccentKey) => {
    setConfig({ ...config, theme: { ...config.theme, accent } });
  };

  const setDark = (dark: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof dark === 'function' ? dark(config.theme.dark) : dark;
    setConfig({ ...config, theme: { ...config.theme, dark: next } });
  };

  return {
    accent:    config.theme.accent,
    dark:      config.theme.dark,
    setAccent,
    setDark,
  };
}
