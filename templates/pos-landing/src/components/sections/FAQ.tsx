import { Accordion } from '@/components/ui/Accordion';
import { useTranslation } from '@/hooks/useTranslation';

interface FaqItem {
  q: string;
  a: string;
}

export function FAQ() {
  const { t, tRaw } = useTranslation();
  const items = tRaw<FaqItem[]>('faq.items') ?? [];

  return (
    <section id="preguntas" className="py-20 lg:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="t-label">{t('faq.eyebrow')}</div>
          <h2 className="font-display font-extrabold mt-2" style={{ fontSize: 'clamp(2rem,3.4vw,2.75rem)' }}>
            {t('faq.headline')}
          </h2>
        </div>
        <Accordion items={items} />
      </div>
    </section>
  );
}
