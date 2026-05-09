import { useConfig } from '@/hooks/useConfig';
import { cn } from '@/lib/cn';

export function PricingTab() {
  const { config, setConfig } = useConfig();
  const pricing = config.pricing;
  const trans   = config.translations.es.pricing;

  const set = (key: keyof typeof pricing, val: unknown) =>
    setConfig({ ...config, pricing: { ...pricing, [key]: val } });

  const setFreeBullet = (i: number, text: string) => {
    const bullets = [...trans.freeBullets] as Array<[string, boolean]>;
    bullets[i] = [text, bullets[i][1]];
    setConfig({
      ...config,
      translations: {
        ...config.translations,
        es: { ...config.translations.es, pricing: { ...trans, freeBullets: bullets } },
      },
    });
  };

  const setProBullet = (i: number, text: string) => {
    const bullets = [...trans.proBullets] as Array<[string, boolean]>;
    bullets[i] = [text, bullets[i][1]];
    setConfig({
      ...config,
      translations: {
        ...config.translations,
        es: { ...config.translations.es, pricing: { ...trans, proBullets: bullets } },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Currency */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Currency</label>
        <div className="grid grid-cols-2 gap-2">
          {(['CRC', 'USD'] as const).map(c => (
            <button
              key={c}
              onClick={() => set('currency', c)}
              className={cn('h-10 rounded-md border-2 text-sm font-semibold transition',
                pricing.currency === c ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40')}
            >
              {c === 'CRC' ? '₡ CRC' : '$ USD'}
            </button>
          ))}
        </div>
      </div>

      {/* USD rate */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">USD Rate (₡ per $1)</label>
        <input
          type="number"
          value={pricing.usdRateCRC}
          onChange={e => set('usdRateCRC', Number(e.target.value))}
          className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {/* One-time price */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          One-Time Price (₡) — {pricing.oneTimePrice.toLocaleString('es-CR')}
        </label>
        <input
          type="range"
          min={99000} max={399000} step={1000}
          value={pricing.oneTimePrice}
          onChange={e => set('oneTimePrice', Number(e.target.value))}
          className="w-full"
        />
        <input
          type="number"
          value={pricing.oneTimePrice}
          onChange={e => set('oneTimePrice', Number(e.target.value))}
          className="mt-2 w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {/* Free docs */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Free Plan — Docs / Month: {pricing.freeDocs}
        </label>
        <input
          type="range"
          min={5} max={100} step={5}
          value={pricing.freeDocs}
          onChange={e => set('freeDocs', Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Amortization months */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Amortization Months</label>
        <input
          type="number"
          value={pricing.amortizationMonths}
          onChange={e => set('amortizationMonths', Number(e.target.value))}
          className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {/* Free bullets */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Free Plan Bullets</label>
        <div className="space-y-2">
          {trans.freeBullets.map(([text, ok], i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={cn('w-4 h-4 rounded-full shrink-0', ok ? 'bg-success' : 'bg-muted-foreground/30')} />
              <input
                type="text"
                value={text}
                onChange={e => setFreeBullet(i, e.target.value)}
                className="flex-1 h-8 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pro bullets */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Pro Plan Bullets</label>
        <div className="space-y-2">
          {trans.proBullets.map(([text], i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-primary shrink-0" />
              <input
                type="text"
                value={text}
                onChange={e => setProBullet(i, e.target.value)}
                className="flex-1 h-8 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
