import { Icon } from '@/components/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';

interface TestimonialItem {
  quote:  string;
  author: string;
  role:   string;
}

export function Testimonials() {
  const { t, tRaw } = useTranslation();
  const items = tRaw<TestimonialItem[]>('testimonials.items') ?? [];

  return (
    <section id="testimonios" className="py-20 lg:py-24 border-y border-border bg-card/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="t-label">{t('testimonials.eyebrow')}</div>
          <h2 className="font-display font-extrabold mt-2" style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)' }}>
            {t('testimonials.headline')}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <figure key={i} className="card p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Icon name="Quote" size={22} className="text-primary shrink-0" />
                <div className="font-display font-bold text-lg">{item.author}</div>
              </div>
              <blockquote className="text-[15px] leading-relaxed text-foreground">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-auto pt-3 border-t border-border">
                <div className="text-xs text-muted-foreground">{item.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
