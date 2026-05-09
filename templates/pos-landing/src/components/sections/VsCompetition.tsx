import { Icon } from '@/components/ui/Icon';
import { LogoIcon } from '@/components/ui/LogoIcon';
import { useTranslation } from '@/hooks/useTranslation';

interface VsRow {
  feature: string;
  jm:      string;
  alt1:    string;
  alt2:    string;
}

export function VsCompetition() {
  const { t } = useTranslation();
  const rows  = t('vs.rows') as unknown as VsRow[];
  const cols  = t('vs.cols') as unknown as string[];
  const safeRows = Array.isArray(rows) ? rows : [];
  const safeCols = Array.isArray(cols) ? cols : [];

  return (
    <section id="vs" className="py-20 lg:py-28 bg-muted/40 border-y border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="t-label">{t('vs.eyebrow')}</div>
          <h2
            className="font-display font-extrabold mt-2"
            style={{ fontSize: 'clamp(2rem,3.6vw,3rem)' }}
            dangerouslySetInnerHTML={{
              __html: t('vs.headline')
                .replace('una vez', '<span class="text-primary">una vez</span>')
                .replace('para siempre', '<span class="text-primary">para siempre</span>'),
            }}
          />
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{t('vs.subheadline')}</p>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-card">
          {safeCols.length > 0 && (
            <div className="grid grid-cols-12 bg-muted/60 border-b border-border">
              <div className="col-span-3 p-4 t-label">{safeCols[0]}</div>
              <div className="col-span-3 p-4 t-label flex items-center gap-2">
                <LogoIcon size={16} />{safeCols[1]}
              </div>
              <div className="col-span-3 p-4 t-label">{safeCols[2]}</div>
              <div className="col-span-3 p-4 t-label">{safeCols[3]}</div>
            </div>
          )}
          {safeRows.map((r, i) => (
            <div key={i} className={`grid grid-cols-12 border-b border-border last:border-b-0 ${i % 2 ? 'bg-muted/20' : ''}`}>
              <div className="col-span-3 p-4 text-sm font-semibold">{r.feature}</div>
              <div className="col-span-3 p-4 text-sm flex items-center gap-2">
                <Icon name="BadgeCheck" size={16} className="text-primary shrink-0" />
                <span className="font-semibold">{r.jm}</span>
              </div>
              <div className="col-span-3 p-4 text-sm text-muted-foreground">{r.alt1}</div>
              <div className="col-span-3 p-4 text-sm text-muted-foreground">{r.alt2}</div>
            </div>
          ))}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {safeRows.map((r, i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/40 border-b border-border t-label">{r.feature}</div>
              <div className="divide-y divide-border">
                <div className="p-4 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <LogoIcon size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-display font-bold uppercase tracking-wider text-primary">JMarkets POS</div>
                    <div className="text-sm font-semibold flex items-center gap-1.5 mt-0.5">
                      <Icon name="BadgeCheck" size={14} className="text-primary shrink-0" />
                      {r.jm}
                    </div>
                  </div>
                </div>
                {[{ label: safeCols[2] ?? 'Alt 1', val: r.alt1 }, { label: safeCols[3] ?? 'Alt 2', val: r.alt2 }].map(({ label, val }) => (
                  <div key={label} className="p-4">
                    <div className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{val}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 text-[12px] text-muted-foreground text-center">{t('vs.disclaimer')}</p>
      </div>
    </section>
  );
}
