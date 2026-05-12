import { Icon, type IconName } from '@/components/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';
import { useConfig } from '@/hooks/useConfig';
import { parseTitle } from '@/lib/parseTitle';

interface HaciendaCard {
  icon:  string;
  title: string;
  desc:  string;
}

export function Hacienda() {
  const { config } = useConfig();
  const { t, tRaw } = useTranslation();
  const compact  = config.sections.hacienda.variant === 'compact';
  const cards    = tRaw<HaciendaCard[]>('hacienda.cards') ?? [];

  return (
    <section id="hacienda" className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-display font-bold uppercase tracking-[0.16em]">
            <Icon name="ShieldCheck" size={13} />
            {t('hacienda.eyebrow')}
          </div>
          <h2
            className="font-display font-extrabold mt-3"
            style={{ fontSize: 'clamp(2rem,3.6vw,3rem)' }}
          >
            {parseTitle(t('hacienda.headline'))}
          </h2>
          <p className="mt-3 text-muted-foreground">{t('hacienda.subheadline')}</p>
        </div>

        {/* Cards — 6 cards matching wireframe */}
        <div className={`grid gap-4 ${compact ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {cards.map((card, i) => (
            <div key={i} className={`card p-5 ${compact ? '' : 'lg:p-6'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-md bg-accent text-accent-foreground flex items-center justify-center">
                  <Icon name={card.icon as IconName} size={20} />
                </div>
                <h4 className="font-display font-bold text-lg leading-tight">{card.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Promo banner */}
        <div className="mt-10 card p-6 lg:p-8 flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="w-14 h-14 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <Icon name="Sparkles" size={26} />
          </div>
          <div className="flex-1">
            <h4 className="font-display font-bold text-xl">{t('hacienda.promoTitle')}</h4>
            <p className="text-sm text-muted-foreground mt-1.5">{t('hacienda.promoDesc')}</p>
          </div>
          <span className="badge bg-warning/15 text-warning border border-warning/30 px-3 py-1 rounded-full text-[11px] font-display font-bold uppercase tracking-wider">
            {t('hacienda.promoBadge')}
          </span>
        </div>
      </div>
    </section>
  );
}
