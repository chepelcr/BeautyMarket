import { useConfig } from '@/hooks/useConfig';
import { cn } from '@/lib/cn';
import type { AppConfig } from '@/types';

type SectionKey = keyof AppConfig['sections'];

const SECTIONS: Array<{ key: SectionKey; label: string; variants?: string[] }> = [
  { key: 'hero',          label: 'Hero',           variants: ['centered', 'split'] },
  { key: 'vsCompetition', label: 'VS Competition' },
  { key: 'features',      label: 'Features' },
  { key: 'howItWorks',    label: 'How It Works' },
  { key: 'hacienda',      label: 'Hacienda 4.4',   variants: ['default', 'compact'] },
  { key: 'pricing',       label: 'Pricing',         variants: ['default', 'compact'] },
  { key: 'testimonials',  label: 'Testimonials' },
  { key: 'faq',           label: 'FAQ' },
  { key: 'finalCta',      label: 'Final CTA' },
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
                    {variants.map(v => (
                      <button
                        key={v}
                        onClick={() => setVariant(key, v)}
                        className={cn(
                          'h-6 px-2.5 rounded text-[11px] font-semibold border transition',
                          sectionWithVariant.variant === v
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-border text-muted-foreground hover:border-primary/40',
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Visibility toggle */}
              <button
                onClick={() => toggleVisible(key)}
                className={cn(
                  'relative w-11 h-6 rounded-full border-2 transition-colors shrink-0',
                  section.visible ? 'bg-primary border-primary' : 'bg-muted border-border',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                    section.visible ? 'translate-x-5' : 'translate-x-0.5',
                  )}
                />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
