/**
 * DefaultLanguageSection Component
 * Select default language for the site
 */

import { useConfig } from '@/hooks/useConfig';
import { LangToggle } from '../components/LangToggle';

export function DefaultLanguageSection() {
  const { config, setConfig } = useConfig();
  const meta = config.meta;

  const setLang = (val: 'es' | 'en') => {
    setConfig({
      ...config,
      meta: { ...meta, lang: val },
    });
  };

  return (
    <div className="card p-5 space-y-4">
      <h3 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground">
        Idioma por Defecto
      </h3>
      <LangToggle
        label="Idioma del sitio"
        value={meta.lang}
        onChange={setLang}
      />
      <p className="text-xs text-muted-foreground">
        Este es el idioma que se mostrará por defecto cuando alguien visite el sitio.
      </p>
    </div>
  );
}
