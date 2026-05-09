import { useState } from 'react';
import { useConfig } from '@/hooks/useConfig';
import { cn } from '@/lib/cn';
import type { LangKey, TranslationMap } from '@/types';

type Lang = LangKey;

function setNestedValue(obj: Record<string, unknown>, path: string[], value: string): Record<string, unknown> {
  if (path.length === 1) return { ...obj, [path[0]]: value };
  const [head, ...rest] = path;
  return {
    ...obj,
    [head]: setNestedValue((obj[head] as Record<string, unknown>) ?? {}, rest, value),
  };
}

interface FieldProps {
  path:    string[];
  value:   unknown;
  lang:    Lang;
}

function Field({ path, value, lang }: FieldProps) {
  const { config, setConfig } = useConfig();

  const onChange = (val: string) => {
    const trans = config.translations[lang] as Record<string, unknown>;
    const updated = setNestedValue(trans, path, val);
    setConfig({
      ...config,
      translations: { ...config.translations, [lang]: updated },
    });
  };

  if (typeof value === 'string') {
    return (
      <div className="space-y-1">
        <label className="block text-[10px] font-mono text-muted-foreground">{path.join('.')}</label>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={value.length > 80 ? 3 : 1}
          className="w-full rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:border-primary resize-none"
        />
      </div>
    );
  }
  return null;
}

function Section({ title, obj, prefix, lang }: { title: string; obj: Record<string, unknown>; prefix: string[]; lang: Lang }) {
  const [open, setOpen] = useState(false);
  const entries = Object.entries(obj).filter(([, v]) => typeof v === 'string');

  if (entries.length === 0) return null;

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 text-sm font-semibold hover:bg-muted/60 transition"
      >
        {title}
        <span className={cn('transition-transform', open ? 'rotate-180' : '')}>▾</span>
      </button>
      {open && (
        <div className="px-4 py-3 space-y-3">
          {entries.map(([k, v]) => (
            <Field key={k} path={[...prefix, k]} value={v} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TranslationsTab() {
  const { config } = useConfig();
  const [lang, setLang] = useState<Lang>('es');

  const translations = config.translations[lang] as Partial<TranslationMap> | undefined;
  if (!translations) return <div className="text-sm text-muted-foreground">No translations for {lang}</div>;

  return (
    <div className="space-y-3">
      {/* Lang picker */}
      <div className="flex gap-2">
        {(['es', 'en'] as Lang[]).map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={cn(
              'h-9 px-4 rounded-md text-sm font-semibold border transition',
              lang === l ? 'bg-primary border-primary text-primary-foreground' : 'border-border hover:border-primary/40',
            )}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Sections */}
      {Object.entries(translations).map(([key, val]) => {
        if (typeof val !== 'object' || Array.isArray(val)) return null;
        return (
          <Section
            key={key}
            title={key}
            obj={val as Record<string, unknown>}
            prefix={[key]}
            lang={lang}
          />
        );
      })}
    </div>
  );
}
