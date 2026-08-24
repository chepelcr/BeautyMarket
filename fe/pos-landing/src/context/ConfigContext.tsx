import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AppConfig, LangKey } from '@/types';
import { getConfig } from '@/lib/configApi';

interface ConfigContextValue {
  config:    AppConfig;
  setConfig: (c: AppConfig) => void;
  lang:      LangKey;
  setLang:   (l: LangKey) => void;
  loading:   boolean;
  error:     string | null;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [lang, setLang]     = useState<LangKey>('es');
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    getConfig()
      .then((cfg) => {
        setConfig(cfg);
        setLang(cfg.meta.lang === 'en' ? 'en' : 'es');
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(String(e));
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-muted border-t-primary animate-spin"/>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-destructive text-sm p-4">
        Error loading config: {error ?? 'Unknown error'}
      </div>
    );
  }

  return (
    <ConfigContext.Provider value={{ config, setConfig, lang, setLang, loading, error }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfigContext(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfigContext must be used inside ConfigProvider');
  return ctx;
}
