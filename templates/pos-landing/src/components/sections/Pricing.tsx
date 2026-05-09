import { Icon, type IconName } from '@/components/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';
import { useConfig } from '@/hooks/useConfig';
import { fmtCRC, fmtUSD } from '@/lib/format';

interface Addon {
  icon:        string;
  title:       string;
  description: string;
}

export function Pricing() {
  const { config }  = useConfig();
  const { t, tRaw } = useTranslation();
  const compact     = config.sections.pricing.variant === 'compact';
  const { currency, usdRateCRC, oneTimePrice, freeDocs, amortizationMonths, moneyBackDays } = config.pricing;

  const fmt     = (n: number) => currency === 'USD' ? fmtUSD(n, usdRateCRC) : fmtCRC(n);
  const monthly = fmt(Math.round(oneTimePrice / amortizationMonths));
  const nextYear = Math.floor(amortizationMonths / 12) + 1;

  const freeBullets = tRaw<Array<[string, boolean]>>('pricing.freeBullets') ?? [];
  const proBullets  = tRaw<Array<[string, boolean]>>('pricing.proBullets')  ?? [];
  const addons      = tRaw<Addon[]>('pricing.addons') ?? [];

  const proPrice = fmt(oneTimePrice);

  const moneyBack = t('pricing.moneyBackLabel', { days: String(moneyBackDays) });
  const amort     = t('pricing.amortizationLabel', {
    monthly,
    months:   String(Math.floor(amortizationMonths / 12)),
    nextYear: String(nextYear),
  });

  return (
    <section id="precios" className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[680px] h-[460px] rounded-full bg-primary/12 blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="t-label">{t('pricing.eyebrow')}</div>
          <h2
            className="font-display font-extrabold mt-2"
            style={{ fontSize: 'clamp(2rem,3.6vw,3rem)' }}
            dangerouslySetInnerHTML={{
              __html: t('pricing.headline')
                .replace('Crecé sin atarte.', '<span class="text-primary">Crecé sin atarte.</span>'),
            }}
          />
          <p className="mt-3 text-muted-foreground">{t('pricing.subheadline')}</p>
        </div>

        <div className={`grid gap-5 ${compact ? 'lg:grid-cols-2 max-w-4xl mx-auto' : 'lg:grid-cols-2 max-w-5xl mx-auto'}`}>
          {/* FREE */}
          <div className="relative rounded-2xl border border-border bg-card p-7 lg:p-8 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-extrabold text-2xl">{t('pricing.freeName')}</h3>
              <span className="badge bg-muted text-muted-foreground border border-border px-2.5 py-1 rounded-full text-[10px] font-display font-bold uppercase tracking-wider">
                {t('pricing.freeBadge')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-5">{t('pricing.freeTagline')}</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-display font-extrabold text-5xl t-num">{t('pricing.freePrice')}</span>
              <span className="text-muted-foreground">/ {t('pricing.freePriceSub')}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-6">{t('pricing.freeSubline')}</p>
            <a href="#" className="h-11 rounded-md border border-border bg-background hover:bg-muted font-semibold flex items-center justify-center gap-2 mb-6">
              {t('pricing.freeCta')}<Icon name="ArrowRight" size={15} />
            </a>
            <ul className="space-y-2.5 text-sm">
              {freeBullets.map(([text, ok], i) => {
                const label = text.replace('{{freeDocs}}', String(freeDocs));
                return (
                  <li key={i} className={`flex items-start gap-2.5 ${ok ? '' : 'text-muted-foreground/60 line-through'}`}>
                    {ok
                      ? <Icon name="Check" size={16} className="text-success mt-0.5 shrink-0" />
                      : <Icon name="X" size={16} className="mt-0.5 shrink-0 text-muted-foreground/50" />
                    }
                    <span>{label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* PRO */}
          <div className="relative rounded-2xl border-2 border-primary bg-card p-7 lg:p-8 flex flex-col shadow-2xl shadow-primary/15">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-display font-extrabold uppercase tracking-[0.16em]">
              {t('pricing.proBadge')}
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-extrabold text-2xl flex items-center gap-2">
                {t('pricing.proName')}
                <Icon name="Sparkles" size={18} className="text-primary" />
              </h3>
              <span className="badge bg-primary/10 text-primary border border-primary/30 px-2.5 py-1 rounded-full text-[10px] font-display font-bold uppercase tracking-wider">
                Pago único
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-5">{t('pricing.proTagline')}</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-display font-extrabold text-5xl t-num text-primary">{proPrice}</span>
              <span className="text-muted-foreground">una vez</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{amort}</p>
            <a href="#" className="mt-4 h-11 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-semibold flex items-center justify-center gap-2 mb-6 shadow-md shadow-primary/30">
              {t('pricing.proCta')}<Icon name="ArrowRight" size={15} />
            </a>
            <ul className="space-y-2.5 text-sm">
              {proBullets.map(([text], i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Icon name="Check" size={16} className="text-primary mt-0.5 shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-5 border-t border-border flex items-center gap-3">
              <Icon name="ShieldCheck" size={20} className="text-primary" />
              <p className="text-xs text-muted-foreground">{moneyBack}</p>
            </div>
          </div>
        </div>

        {/* Add-ons */}
        {addons.length > 0 && (
          <div className="mt-10 grid sm:grid-cols-3 gap-3 text-sm">
            {addons.map((addon, i) => (
              <div key={i} className="card p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-md bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                  <Icon name={addon.icon as IconName} size={18} />
                </div>
                <div>
                  <div className="font-display font-bold">{addon.title}</div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{addon.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
