import { useConfig } from '@/hooks/useConfig';

export function MetaTab() {
  const { config, setConfig } = useConfig();
  const meta = config.meta;

  const set = (key: keyof typeof meta, val: string) =>
    setConfig({ ...config, meta: { ...meta, [key]: val } });

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          App URL (Login / Iniciar sesión)
        </label>
        <input
          type="url"
          value={meta.appUrl}
          onChange={e => set('appUrl', e.target.value)}
          className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm font-mono focus:outline-none focus:border-primary"
          placeholder="https://pos-system.j-markets.jcampos.dev"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Where "Iniciar sesión" buttons link — both in the nav and the CTA section.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          Site URL
        </label>
        <input
          type="url"
          value={meta.siteUrl}
          onChange={e => set('siteUrl', e.target.value)}
          className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm font-mono focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          Site Title
        </label>
        <input
          type="text"
          value={meta.siteTitle}
          onChange={e => set('siteTitle', e.target.value)}
          className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          Site Description
        </label>
        <textarea
          rows={2}
          value={meta.siteDescription}
          onChange={e => set('siteDescription', e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Default Language
        </label>
        <div className="flex gap-2">
          {(['es', 'en'] as const).map(l => (
            <button
              key={l}
              onClick={() => set('lang', l)}
              className={`h-9 px-5 rounded-md text-sm font-semibold border transition ${
                meta.lang === l
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
