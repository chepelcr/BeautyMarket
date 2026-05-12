import { useState } from 'react';
import { useConfig } from '@/hooks/useConfig';
import { LangToggle, Collapsible, TextAreaField } from './components';
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
  path: string[];
  value: unknown;
  lang: Lang;
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
      <TextAreaField
        label={<span className="font-mono text-[10px]">{path.join('.')}</span>}
        value={value}
        onChange={onChange}
        rows={value.length > 80 ? 3 : 1}
        className="space-y-1"
        textareaClassName="text-xs resize-none"
      />
    );
  }
  return null;
}

function Section({ title, obj, prefix, lang }: { title: string; obj: Record<string, unknown>; prefix: string[]; lang: Lang }) {
  const entries = Object.entries(obj).filter(([, v]) => typeof v === 'string');

  if (entries.length === 0) return null;

  return (
    <Collapsible title={title} defaultOpen={false}>
      <div className="space-y-3">
        {entries.map(([k, v]) => (
          <Field key={k} path={[...prefix, k]} value={v} lang={lang} />
        ))}
      </div>
    </Collapsible>
  );
}

export function TranslationsTab() {
  const { config } = useConfig();
  const [lang, setLang] = useState<Lang>('es');

  const translations = config.translations[lang] as Partial<TranslationMap> | undefined;
  if (!translations) return <div className="text-sm text-muted-foreground">No translations for {lang}</div>;

  return (
    <div className="space-y-3">
      <LangToggle value={lang} onChange={setLang} />

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
