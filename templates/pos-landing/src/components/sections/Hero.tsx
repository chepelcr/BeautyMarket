import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { LogoIcon } from '@/components/ui/LogoIcon';
import { Ticker } from '@/components/ui/Ticker';
import { StatusDot } from '@/components/ui/StatusDot';
import { useTranslation } from '@/hooks/useTranslation';
import { useConfig } from '@/hooks/useConfig';
import { fmtCRC } from '@/lib/format';
import { cn } from '@/lib/cn';
import { parseTitle } from '@/lib/parseTitle';

export function Hero() {
  const { config } = useConfig();
  const { t, tRaw } = useTranslation();
  const variant  = config.sections.hero.variant;
  const ticker   = tRaw<string[]>('hero.ticker') ?? [];

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[480px] bg-gradient-to-b from-primary/8 to-transparent pointer-events-none" />
      <div className="absolute -top-24 right-[-10%] w-[480px] h-[480px] rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      {variant === 'split' ? <HeroSplit /> : <HeroCentered />}
      <Ticker items={ticker} />
    </section>
  );
}

function HeroCentered() {
  const { t, tRaw } = useTranslation();
  const trustBadges = tRaw<string[]>('hero.trustBadges') ?? [];

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 lg:pt-20 lg:pb-16">
      <div className="max-w-3xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border shadow-sm text-[12px] font-semibold">
          <StatusDot />
          <span>{t('hero.badge')}</span>
          <span className="text-muted-foreground">{t('hero.badgeSub')}</span>
        </div>

        {/* Headline */}
        <h1
          className="font-display font-extrabold mt-6 leading-[0.95] tracking-tight"
          style={{ fontSize: 'clamp(2.5rem,6.4vw,5.25rem)' }}
        >
          {parseTitle(t('hero.headline'))}
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t('hero.subheadline')}
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/precios"
            className="inline-flex h-12 px-6 items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-lg shadow-primary/25"
          >
            {t('hero.ctaPrimary')}
            <Icon name="ArrowRight" size={16} />
          </Link>
          <Link
            to="/demo"
            className="inline-flex h-12 px-6 items-center justify-center gap-2 rounded-md border border-border bg-card font-semibold hover:bg-muted"
          >
            {t('hero.ctaSecondary')}
            <Icon name="ArrowUpRight" size={14} />
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {trustBadges.map((badge) => (
            <span key={badge} className="flex items-center gap-1.5">
              <Icon name="Check" size={16} className="text-success" />
              {badge}
            </span>
          ))}
        </div>
      </div>

      <PosScreenshot />
    </div>
  );
}

function HeroSplit() {
  const { t } = useTranslation();

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12 lg:pt-20 lg:pb-16 grid lg:grid-cols-12 gap-10 items-center">
      <div className="lg:col-span-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-[12px] font-semibold">
          <Icon name="Sparkles" size={13} />
          {t('hero.badge')} · 2025
        </div>
        <h1
          className="font-display font-extrabold mt-5 leading-[0.95]"
          style={{ fontSize: 'clamp(2.5rem,5.6vw,4.75rem)' }}
        >
          Tu punto de venta.<br />
          <span className="text-primary">Sin renta mensual.</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-xl">
          {t('hero.subheadline')}
        </p>
        <div className="mt-7 flex flex-col sm:flex-row gap-3">
          <Link
            to="/precios"
            className="inline-flex h-12 px-6 items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-lg shadow-primary/25"
          >
            {t('hero.ctaPrimary')}
            <Icon name="ArrowRight" size={16} />
          </Link>
          <Link
            to="/caracteristicas"
            className="inline-flex h-12 px-6 items-center justify-center gap-2 rounded-md border border-border font-semibold hover:bg-muted"
          >
            {t('nav.features')}
          </Link>
        </div>
      </div>
      <div className="lg:col-span-6">
        <PosScreenshot compact />
      </div>
    </div>
  );
}

function PosScreenshot({ compact = false }: { compact?: boolean }) {
  const { t }     = useTranslation();
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const products = [
    { name: 'Shampoo Argán 250ml',   sku: 'SH-ARG-250', price: 6500,  q: 1 },
    { name: 'Crema Hidratante 50ml', sku: 'CR-FAC-50',  price: 8400,  q: 2 },
    { name: 'Mascarilla Carbón',     sku: 'MK-CAR-X1',  price: 3200,  q: 1 },
  ];
  const grid = [
    { n: 'Shampoo Argán 250ml',   p: 6500  },
    { n: 'Crema Hidratante 50ml', p: 8400  },
    { n: 'Mascarilla Carbón',     p: 3200  },
    { n: 'Acondicionador Coco',   p: 5800  },
    { n: 'Sérum Vitamina C',      p: 12400 },
    { n: 'Tónico Facial 200ml',   p: 4900  },
    { n: 'Bloqueador SPF 50',     p: 9200  },
    { n: 'Exfoliante Corporal',   p: 6700  },
    { n: 'Aceite Esencial 30ml',  p: 8100  },
  ];
  const sub      = products.reduce((a, p) => a + p.price * p.q, 0);
  const iva      = Math.round(sub * 0.13);
  const total    = sub + iva;
  const cartCount = products.reduce((a, p) => a + p.q, 0);

  return (
    <div className={cn('mx-auto max-w-5xl', compact ? '' : 'mt-12')}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div className="inline-flex items-center gap-1 p-1 rounded-md bg-muted/70 border border-border">
          {(['desktop', 'mobile'] as const).map(d => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={cn(
                'inline-flex items-center gap-1.5 h-8 px-3 rounded text-[12px] font-semibold',
                device === d ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon name={d === 'desktop' ? 'Monitor' : 'Smartphone'} size={13} />
              {d === 'desktop' ? t('hero.deviceDesktop') : t('hero.deviceMobile')}
            </button>
          ))}
        </div>
        <Link
          to="/demo"
          className="text-[12px] font-semibold text-primary hover:underline inline-flex items-center gap-1"
        >
          {t('hero.demoLabel')}
          <Icon name="ArrowUpRight" size={13} />
        </Link>
      </div>

      {device === 'mobile'
        ? <PosScreenshotMobile products={products} sub={sub} iva={iva} total={total} cartCount={cartCount} />
        : <PosScreenshotDesktop products={products} sub={sub} iva={iva} total={total} cartCount={cartCount} grid={grid} />
      }

      <div className="mt-3 flex justify-center items-center gap-2 text-[11px] font-mono text-muted-foreground">
        <StatusDot size={7} />
        {t('hero.statusLabel')}
      </div>
    </div>
  );
}

interface MockProps {
  products: Array<{ name: string; sku: string; price: number; q: number }>;
  sub: number; iva: number; total: number; cartCount: number;
  grid?: Array<{ n: string; p: number }>;
}

function PosScreenshotDesktop({ products, sub, iva, total, cartCount, grid = [] }: MockProps) {
  const hatched = { backgroundImage: `repeating-linear-gradient(45deg, hsl(var(--muted-foreground) / .14) 0 1px, transparent 1px 9px)` };
  return (
    <div className="relative rounded-2xl border border-border bg-card shadow-2xl shadow-foreground/10 overflow-hidden">
      {/* Browser chrome */}
      <div className="h-9 bg-muted/60 border-b border-border flex items-center gap-2 px-4">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-destructive/70"/>
          <span className="w-3 h-3 rounded-full bg-warning/80"/>
          <span className="w-3 h-3 rounded-full bg-success/80"/>
        </div>
        <div className="flex-1 flex justify-center">
          <span className="px-3 py-0.5 rounded text-[11px] font-mono text-muted-foreground bg-background/60 border border-border">
            pos.j-markets.jcampos.dev
          </span>
        </div>
        <span className="hidden md:inline text-[11px] font-mono text-muted-foreground">v4.4</span>
      </div>
      {/* App header */}
      <div className="h-[52px] flex items-center justify-between px-5 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <LogoIcon size={22} />
          <span className="font-display font-semibold text-[18px] leading-none">Punto de venta</span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-[13px] text-muted-foreground">Sucursal Central · Terminal 02</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-muted-foreground hidden sm:inline">JCampos</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/12 text-success border border-success/30 text-[11px] font-semibold">
            <StatusDot size={7} />En línea
          </span>
        </div>
      </div>
      {/* Grid */}
      <div className="grid min-h-[460px]" style={{ gridTemplateColumns: '1fr 320px' }}>
        {/* Products */}
        <div className="flex flex-col border-r border-border">
          <div className="flex border-b border-border bg-card">
            {['Productos', 'Clientes'].map((l, i) => (
              <button key={i} className={cn('flex-1 py-3 text-[13px] font-semibold', i === 0 ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground border-b-2 border-transparent')}>{l}</button>
            ))}
          </div>
          <div className="p-3 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-9 rounded-md border border-border bg-background flex items-center px-3 gap-2 text-[12px] text-muted-foreground">
                <Icon name="Search" size={14} /><span>Buscar producto · escaneá el código</span>
              </div>
              <button className="h-9 w-9 rounded-md border border-border bg-background flex items-center justify-center text-muted-foreground">
                <Icon name="Scan" size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {grid.map((g, i) => (
                <div key={i} className="aspect-[5/4] rounded-md border border-border bg-background p-2 flex flex-col hover:border-primary/40 transition">
                  <div className="flex-1 rounded bg-muted/70 mb-1.5 relative overflow-hidden">
                    <div className="absolute inset-0" style={hatched} />
                  </div>
                  <div className="text-[10px] font-semibold leading-tight line-clamp-1">{g.n}</div>
                  <div className="text-[10px] font-mono text-primary t-num">{fmtCRC(g.p)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Cart */}
        <aside className="flex flex-col bg-card">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="ShoppingCart" size={16} />
              <span className="font-display font-bold text-[15px]">Carrito</span>
              <span className="px-1.5 h-5 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold t-num">{cartCount}</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">FE-04</span>
          </div>
          <div className="px-4 py-3 border-b border-border">
            <button className="w-full h-9 rounded-md border border-dashed border-border text-[12px] text-muted-foreground hover:bg-muted flex items-center justify-center gap-2">
              <Icon name="Users" size={14} />Seleccionar cliente
            </button>
          </div>
          <div className="flex-1 px-3 py-2 space-y-2 overflow-hidden">
            {products.map((p, i) => (
              <div key={i} className="rounded-md border border-border bg-background p-2.5">
                <div className="flex justify-between gap-2">
                  <span className="text-[12px] font-semibold leading-tight">{p.name}</span>
                  <span className="text-[11px] font-mono t-num">{fmtCRC(p.price * p.q)}</span>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] font-mono text-muted-foreground">{p.sku}</span>
                  <div className="flex items-center gap-1">
                    <button className="w-6 h-6 rounded border border-border flex items-center justify-center text-muted-foreground"><Icon name="Minus" size={12} /></button>
                    <span className="w-6 text-center text-[11px] font-mono t-num">{p.q}</span>
                    <button className="w-6 h-6 rounded border border-border flex items-center justify-center text-muted-foreground"><Icon name="Plus" size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-border space-y-1 text-[12px]">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono t-num">{fmtCRC(sub)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">IVA 13%</span><span className="font-mono t-num">{fmtCRC(iva)}</span></div>
            <div className="flex justify-between text-[15px] font-display font-extrabold pt-1">
              <span>TOTAL</span><span className="font-mono t-num text-primary">{fmtCRC(total)}</span>
            </div>
            <button className="mt-2 w-full h-10 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-primary/20">
              Cobrar · {fmtCRC(total)}<Icon name="ArrowRight" size={14} />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PosScreenshotMobile({ products, sub, iva, total, cartCount }: MockProps) {
  const [tab, setTab] = useState<'productos' | 'carrito'>('productos');
  const hatched = { backgroundImage: `repeating-linear-gradient(45deg, hsl(var(--muted-foreground) / .14) 0 1px, transparent 1px 9px)` };
  const grid = [
    { n: 'Shampoo Argán',    p: 6500  },
    { n: 'Crema Hidratante', p: 8400  },
    { n: 'Mascarilla',       p: 3200  },
    { n: 'Acondicionador',   p: 5800  },
    { n: 'Sérum Vitamina C', p: 12400 },
    { n: 'Tónico Facial',    p: 4900  },
  ];
  return (
    <div className="flex justify-center">
      <div className="relative w-[320px] rounded-[36px] border-[10px] border-foreground/85 bg-foreground/85 shadow-2xl shadow-foreground/30 overflow-hidden">
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-24 h-5 bg-foreground rounded-b-2xl z-10"/>
        <div className="rounded-[26px] overflow-hidden bg-card">
          <div className="h-7 flex items-center justify-between px-5 text-[10px] font-mono bg-card pt-1.5">
            <span>9:41</span>
            <span className="flex gap-1 items-center"><Icon name="Wifi" size={10}/><Icon name="Battery" size={10}/></span>
          </div>
          <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-[15px] leading-none">Punto de venta</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Central · T-02</div>
            </div>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-success/12 text-success border border-success/30 text-[9px] font-bold">
              <StatusDot size={6}/>EN LÍNEA
            </span>
          </div>
          <div className="grid grid-cols-2 p-1 m-2 rounded-md bg-muted gap-0.5">
            {(['productos', 'carrito'] as const).map(id => (
              <button key={id} onClick={() => setTab(id)}
                className={cn('relative h-8 rounded text-[11px] font-semibold', tab === id ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground')}>
                {id === 'productos' ? 'Productos' : 'Carrito'}
                {id === 'carrito' && cartCount > 0 && (
                  <span className="ml-1 px-1 h-3.5 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold t-num align-middle">{cartCount}</span>
                )}
              </button>
            ))}
          </div>
          {tab === 'productos' ? (
            <div className="px-2 pb-2">
              <div className="flex items-center gap-1.5 mb-2 px-1">
                <div className="flex-1 h-8 rounded-md border border-border bg-background flex items-center px-2 gap-1.5 text-[10px] text-muted-foreground"><Icon name="Search" size={11}/><span>Buscar / escanear</span></div>
                <button className="h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center"><Icon name="Scan" size={12}/></button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {grid.map((g, i) => (
                  <div key={i} className="aspect-[5/4] rounded-md border border-border bg-background p-1.5 flex flex-col">
                    <div className="flex-1 rounded bg-muted/70 mb-1 relative overflow-hidden"><div className="absolute inset-0" style={hatched}/></div>
                    <div className="text-[9px] font-semibold leading-tight line-clamp-1">{g.n}</div>
                    <div className="text-[9px] font-mono text-primary t-num">{fmtCRC(g.p)}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setTab('carrito')} className="mt-2 w-full h-11 rounded-md bg-primary text-primary-foreground text-[12px] font-semibold flex items-center justify-between px-3 shadow-sm shadow-primary/20">
                <span className="flex items-center gap-1.5"><Icon name="ShoppingCart" size={14}/>{cartCount} ítems</span>
                <span className="font-mono t-num">{fmtCRC(total)} <Icon name="ArrowRight" size={12} className="inline"/></span>
              </button>
            </div>
          ) : (
            <div className="px-3 pb-3">
              <button className="w-full h-8 rounded-md border border-dashed border-border text-[10px] text-muted-foreground flex items-center justify-center gap-1.5 mb-2">
                <Icon name="Users" size={12}/>Seleccionar cliente
              </button>
              <div className="space-y-1.5">
                {products.map((p, i) => (
                  <div key={i} className="rounded-md border border-border bg-background p-2">
                    <div className="flex justify-between gap-2">
                      <span className="text-[11px] font-semibold leading-tight line-clamp-1">{p.name}</span>
                      <span className="text-[10px] font-mono t-num shrink-0">{fmtCRC(p.price * p.q)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] font-mono text-muted-foreground">{p.sku}</span>
                      <div className="flex items-center gap-1">
                        <button className="w-5 h-5 rounded border border-border flex items-center justify-center text-muted-foreground"><Icon name="Minus" size={10}/></button>
                        <span className="w-5 text-center text-[10px] font-mono t-num">{p.q}</span>
                        <button className="w-5 h-5 rounded border border-border flex items-center justify-center text-muted-foreground"><Icon name="Plus" size={10}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-border space-y-0.5 text-[10px]">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono t-num">{fmtCRC(sub)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">IVA 13%</span><span className="font-mono t-num">{fmtCRC(iva)}</span></div>
                <div className="flex justify-between text-[12px] font-display font-extrabold pt-0.5"><span>TOTAL</span><span className="font-mono t-num text-primary">{fmtCRC(total)}</span></div>
              </div>
              <button className="mt-2 w-full h-11 rounded-md bg-primary text-primary-foreground text-[12px] font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-primary/20">
                Cobrar · {fmtCRC(total)}<Icon name="ArrowRight" size={13}/>
              </button>
            </div>
          )}
          <div className="h-5 flex items-end justify-center pb-1.5"><span className="w-24 h-1 rounded-full bg-foreground/30"/></div>
        </div>
      </div>
    </div>
  );
}
