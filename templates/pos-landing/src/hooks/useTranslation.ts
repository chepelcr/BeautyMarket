import { useCallback } from 'react';
import { useConfigContext } from '@/context/ConfigContext';

type Path = string;

export function useTranslation() {
  const { config, lang, setLang } = useConfigContext();

  const t = useCallback((path: Path, vars?: Record<string, string | number>): string => {
    const langMap = (lang === 'en' ? config.translations.en : config.translations.es) as Record<string, unknown>;
    const esFallback = config.translations.es as Record<string, unknown>;
    const keys = path.split('.');

    const traverse = (obj: Record<string, unknown>, ks: string[]): unknown => {
      let node: unknown = obj;
      for (const k of ks) {
        if (node == null || typeof node !== 'object') return undefined;
        node = (node as Record<string, unknown>)[k];
      }
      return node;
    };

    let result = traverse(langMap, keys);
    if (result == null || typeof result !== 'string') {
      result = traverse(esFallback, keys);
    }

    let str = typeof result === 'string' ? result : path;

    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
      });
    }

    return str;
  }, [config, lang]);

  return { t, lang, setLang };
}
