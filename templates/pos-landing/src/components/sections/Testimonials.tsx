import { Icon } from '@/components/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';

interface TestimonialItem {
  quote:  string;
  author: string;
  role:   string;
}

export function Testimonials() {
  const { t }   = useTranslation();
  const items   = t('testimonials.items') as unknown as TestimonialItem[];
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <section className="py-20 lg:py-24 border-y border-border bg-card/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="t-label">{t('testimonials.eyebrow')}</div>
          <h2 className="font-display font-extrabold mt-2" style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)' }}>
            {t('testimonials.headline')}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {safeItems.map((item, i) => (
            <figure key={i} className="card p-6 flex flex-col gap-4">
              <Icon name="Quote" size={22} className="text-primary" />
              <blockquote className="text-[15px] leading-relaxed text-foreground">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-auto pt-3 border-t border-border">
                <div className="font-display font-bold">{item.author}</div>
                <div className="text-xs text-muted-foreground">{item.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
