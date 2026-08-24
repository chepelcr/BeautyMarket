import { useCallback } from 'react';
import { useConfigContext } from '@/context/ConfigContext';

type Path = string;

function traverse(obj: Record<string, unknown>, keys: string[]): unknown {
  let node: unknown = obj;
  for (const k of keys) {
    if (node == null || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[k];
  }
  return node;
}

export function useTranslation() {
  const { config, lang, setLang } = useConfigContext();

  // For string values — with ES fallback and {{var}} interpolation
  const t = useCallback((path: Path, vars?: Record<string, string | number>): string => {
    const langMap = (lang === 'en' ? config.translations.en : config.translations.es) as Record<string, unknown>;
    const esFallback = config.translations.es as Record<string, unknown>;
    const keys = path.split('.');

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

  // For array / object values — returns raw value with ES fallback
  const tRaw = useCallback(<T>(path: Path): T => {
    const langMap = (lang === 'en' ? config.translations.en : config.translations.es) as Record<string, unknown>;
    const esFallback = config.translations.es as Record<string, unknown>;
    const keys = path.split('.');

    let result = traverse(langMap, keys);
    if (result == null) {
      result = traverse(esFallback, keys);
    }
    return result as T;
  }, [config, lang]);

  return { t, tRaw, lang, setLang };
}
