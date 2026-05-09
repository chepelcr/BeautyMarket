import { Icon, type IconName } from '@/components/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';
import { useConfig } from '@/hooks/useConfig';
import { fmtCRC, fmtUSD } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { Plan, PlanFeature, FeatureColor } from '@/types';

interface Addon {
  icon:        string;
  title:       string;
  description: string;
}

const COLOR_CLASS: Record<FeatureColor, string> = {
  success:     'text-success',
  warning:     'text-warning',
  destructive: 'text-destructive',
  primary:     'text-primary',
  muted:       'text-muted-foreground/50',
};

export function Pricing() {
  const { config } = useConfig();
  const { t, tRaw } = useTranslation();
  const { currency, usdRateCRC, freeDocs, amortizationMonths, moneyBackDays, plans } = config.pricing;
  const addons = tRaw<Addon[]>('pricing.addons') ?? [];

  const fmt = (n: number) => currency === 'USD' ? fmtUSD(n, usdRateCRC) : fmtCRC(n);

  // Auto-fit grid: 1 col on mobile, up to 4 cols on large screens
  const gridStyle = {
    gridTemplateColumns: `repeat(auto-fit, minmax(min(280px, 100%), 1fr))`,
  };

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

        {/* Plan grid */}
        <div className="grid gap-5 max-w-5xl mx-auto" style={gridStyle}>
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              fmt={fmt}
              freeDocs={freeDocs}
              amortizationMonths={amortizationMonths}
              moneyBackDays={moneyBackDays}
            />
          ))}
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

interface PlanCardProps {
  plan:               Plan;
  fmt:                (n: number) => string;
  freeDocs:           number;
  amortizationMonths: number;
  moneyBackDays:      number;
}

function PlanCard({ plan, fmt, freeDocs, amortizationMonths, moneyBackDays }: PlanCardProps) {
  const { t } = useTranslation();
  const monthly  = fmt(Math.round(plan.priceCRC / amortizationMonths));
  const nextYear = Math.floor(amortizationMonths / 12) + 1;

  const moneyBack = t('pricing.moneyBackLabel', { days: String(moneyBackDays) });
  const amort     = t('pricing.amortizationLabel', {
    monthly,
    months:   String(Math.floor(amortizationMonths / 12)),
    nextYear: String(nextYear),
  });

  const cardClass = plan.highlighted
    ? 'relative rounded-2xl border-2 border-primary bg-card p-7 lg:p-8 flex flex-col shadow-2xl shadow-primary/15'
    : 'relative rounded-2xl border border-border bg-card p-7 lg:p-8 flex flex-col';

  return (
    <div className={cardClass}>
      {/* Highlight badge */}
      {plan.highlighted && plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-display font-extrabold uppercase tracking-[0.16em]">
          {plan.badge}
        </div>
      )}

      {/* Title row */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display font-extrabold text-2xl flex items-center gap-2">
          {plan.name}
          {plan.highlighted && <Icon name="Sparkles" size={18} className="text-primary" />}
        </h3>
        {!plan.highlighted && plan.badge && (
          <span className="badge bg-muted text-muted-foreground border border-border px-2.5 py-1 rounded-full text-[10px] font-display font-bold uppercase tracking-wider">
            {plan.badge}
          </span>
        )}
      </div>

      {/* Tagline */}
      <p className="text-sm text-muted-foreground mb-5">{plan.tagline}</p>

      {/* Price */}
      <div className="flex items-baseline gap-2 mb-1">
        <span className={cn(
          'font-display font-extrabold text-5xl t-num',
          plan.highlighted && 'text-primary',
        )}>
          {fmt(plan.priceCRC)}
        </span>
        <span className="text-muted-foreground">{plan.priceSuffix}</span>
      </div>

      {/* Subline / amortization */}
      {plan.showAmortization
        ? <p className="text-xs text-muted-foreground mb-2">{amort}</p>
        : plan.subline && <p className="text-xs text-muted-foreground mb-2">{plan.subline}</p>
      }

      {/* CTA */}
      <a
        href={plan.ctaHref}
        className={cn(
          'mt-4 h-11 rounded-md font-semibold flex items-center justify-center gap-2 mb-6',
          plan.highlighted
            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/30'
            : 'border border-border bg-background hover:bg-muted',
        )}
      >
        {plan.ctaLabel}
        <Icon name="ArrowRight" size={15} />
      </a>

      {/* Features */}
      <ul className="space-y-2.5 text-sm">
        {plan.features.map((f, i) => (
          <FeatureRow key={i} feature={f} freeDocs={freeDocs} />
        ))}
      </ul>

      {/* Money back */}
      {plan.showMoneyBack && (
        <div className="mt-6 pt-5 border-t border-border flex items-center gap-3">
          <Icon name="ShieldCheck" size={20} className="text-primary" />
          <p className="text-xs text-muted-foreground">{moneyBack}</p>
        </div>
      )}
    </div>
  );
}

function FeatureRow({ feature, freeDocs }: { feature: PlanFeature; freeDocs: number }) {
  const label = feature.label.replace('{{freeDocs}}', String(freeDocs));
  const color = feature.color ?? (feature.enabled ? 'success' : 'muted');
  const colorClass = COLOR_CLASS[color];

  return (
    <li className={cn('flex items-start gap-2.5', !feature.enabled && 'text-muted-foreground/60 line-through')}>
      {feature.enabled
        ? <Icon name="Check" size={16} className={cn(colorClass, 'mt-0.5 shrink-0')} />
        : <Icon name="X"     size={16} className="mt-0.5 shrink-0 text-muted-foreground/50" />
      }
      <span>{label}</span>
    </li>
  );
}
