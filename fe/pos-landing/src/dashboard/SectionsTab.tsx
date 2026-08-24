import { useConfig } from '@/hooks/useConfig';
import { Toggle } from './components';
import { cn } from '@/lib/cn';
import type { AppConfig } from '@/types';

type SectionKey = keyof AppConfig['sections'];

const SECTIONS: Array<{ key: SectionKey; label: string; variants?: Array<{ value: string; label: string }> }> = [
  { key: 'hero',          label: 'Hero',           variants: [{ value: 'centered', label: 'Centrado' }, { value: 'split', label: 'Dividido' }] },
  { key: 'vsCompetition', label: 'VS Competencia' },
  { key: 'features',      label: 'Características' },
  { key: 'howItWorks',    label: 'Cómo Funciona' },
  { key: 'hacienda',      label: 'Hacienda 4.4',   variants: [{ value: 'default', label: 'Por defecto' }, { value: 'compact', label: 'Compacto' }] },
  { key: 'pricing',       label: 'Precios',        variants: [{ value: 'default', label: 'Por defecto' }, { value: 'compact', label: 'Compacto' }] },
  { key: 'testimonials',  label: 'Testimonios' },
  { key: 'faq',           label: 'Preguntas' },
  { key: 'finalCta',      label: 'CTA Final' },
  { key: 'footer',        label: 'Footer' },
];

export function SectionsTab() {
  const { config, setConfig } = useConfig();

  const toggleVisible = (key: SectionKey) => {
    const section = config.sections[key];
    setConfig({
      ...config,
      sections: {
        ...config.sections,
        [key]: { ...section, visible: !section.visible },
      },
    });
  };

  const setVariant = (key: SectionKey, variant: string) => {
    const section = config.sections[key];
    setConfig({
      ...config,
      sections: {
        ...config.sections,
        [key]: { ...section, variant },
      },
    });
  };

  return (
    <div className="space-y-2">
      {SECTIONS.map(({ key, label, variants }) => {
        const section = config.sections[key];
        const sectionWithVariant = section as typeof section & { variant?: string };

        return (
          <div key={key} className="card p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-sm">{label}</div>
                {variants && (
                  <div className="flex gap-1.5 mt-2">
                    {variants.map(({ value, label: variantLabel }) => (
                      <button
                        key={value}
                        onClick={() => setVariant(key, value)}
                        className={cn(
                          'h-6 px-2.5 rounded text-[11px] font-semibold border transition',
                          sectionWithVariant.variant === value
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-border text-muted-foreground hover:border-primary/40',
                        )}
                      >
                        {variantLabel}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Toggle
                checked={section.visible}
                onChange={() => toggleVisible(key)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
