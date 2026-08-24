import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { LogoIcon } from '@/components/ui/LogoIcon';
import { StatusDot } from '@/components/ui/StatusDot';
import { Sheet, Backdrop } from '@/components/ui/Sheet';
import { CartSheet } from './CartSheet';
import { useTranslation } from '@/hooks/useTranslation';
import { useConfig } from '@/hooks/useConfig';
import { fmtCRC } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { CartState } from '@/hooks/useCart';
import type { DemoCustomer } from '@/types';

type SheetType = 'cart' | 'customer' | 'docs' | null;

interface PosMobileProps {
  cart:       CartState;
  onCheckout: () => void;
}

export function PosMobile({ cart, onCheckout }: PosMobileProps) {
  const { t, tRaw } = useTranslation();
  const { config }  = useConfig();
  const [query, setQuery] = useState('');
  const [cat, setCat]     = useState('Todo');
  const [sheet, setSheet] = useState<SheetType>(null);

  const categories = config.demo.categories;
  const products   = config.demo.products;
  const customers  = config.demo.customers;
  const docTypes   = tRaw<Array<{ key: string; name: string; desc: string }>>('demo.docTypes') ?? [];

  const filtered = products.filter(p =>
    (cat === 'Todo' || p.cat === cat) &&
    (!query || p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()))
  );

  const hatched = { backgroundImage: `repeating-linear-gradient(45deg, hsl(var(--muted-foreground) / .15) 0 1px, transparent 1px 9px)` };

  return (
    <div className="h-full flex flex-col bg-background relative overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 bg-card border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="w-8 h-8 -ml-1 rounded hover:bg-muted flex items-center justify-center text-muted-foreground">
              <Icon name="ChevronLeft" size={16} />
            </Link>
            <LogoIcon size={22} />
            <div>
              <div className="font-display font-bold text-[15px] leading-none">Punto de venta</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{t('demo.branchLabel').split(' · ').slice(-1)[0]} · {cart.docType}</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-success/12 text-success border border-success/30 text-[9px] font-bold">
            <StatusDot size={6} />{t('demo.onlineLabel')}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex-1 h-9 rounded-md border border-border bg-background flex items-center px-2.5 gap-1.5">
            <Icon name="Search" size={13} className="text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('demo.searchPlaceholder')}
              className="flex-1 bg-transparent outline-none text-[13px]"
            />
            {query && <button onClick={() => setQuery('')} className="text-muted-foreground"><Icon name="X" size={13} /></button>}
          </div>
          <button className="h-9 w-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
            <Icon name="Scan" size={14} />
          </button>
        </div>
        <div className="mt-2 flex gap-1.5 overflow-x-auto scroll-area pb-1 -mx-1 px-1">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                'shrink-0 h-7 px-3 rounded-full text-[10px] font-display font-bold uppercase tracking-wider border',
                cat === c ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground',
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 py-2 bg-muted/30 border-b border-border flex items-center justify-between gap-2 shrink-0">
        <button
          onClick={() => setSheet('customer')}
          className="flex-1 h-8 rounded-md bg-card border border-border text-[11px] font-semibold flex items-center justify-center gap-1.5 truncate px-2"
        >
          <Icon name="Users" size={12} className="text-muted-foreground shrink-0" />
          <span className="truncate">{cart.customer.name}</span>
        </button>
        <button
          onClick={() => setSheet('docs')}
          className="h-8 px-3 rounded-md bg-card border border-border text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground"
        >
          {cart.docType}
        </button>
      </div>

      {/* Product grid */}
      <div className="flex-1 overflow-auto scroll-area p-3 pb-24">
        {filtered.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
            <Icon name="Search" size={20} />{t('demo.noResults')}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map(p => {
              const inCart = cart.items.find(i => i.id === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => cart.add(p)}
                  className="relative aspect-[5/4] rounded-md border border-border bg-card p-2 flex flex-col text-left active:scale-[0.98] transition"
                >
                  <div className="flex-1 rounded bg-muted relative overflow-hidden">
                    <div className="absolute inset-0" style={hatched} />
                    <span className="absolute top-1 left-1 text-[8px] font-mono px-1 rounded bg-card/80 text-muted-foreground">{p.cat}</span>
                  </div>
                  <div className="text-[11px] font-semibold leading-tight line-clamp-2 mt-1.5">{p.name}</div>
                  <div className="flex justify-between items-center mt-0.5">
                    <span className="text-[9px] font-mono text-muted-foreground">{p.sku}</span>
                    <span className="text-[11px] font-mono font-bold text-primary t-num">{fmtCRC(p.price)}</span>
                  </div>
                  {inCart && (
                    <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center shadow-md t-num">
                      {inCart.q}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <button
        onClick={() => cart.count > 0 && setSheet('cart')}
        disabled={cart.count === 0}
        className="absolute bottom-0 left-0 right-0 p-3 bg-card border-t border-border flex items-center gap-3 disabled:opacity-50 z-20"
      >
        <div className="relative w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          <Icon name="ShoppingCart" size={18} />
          {cart.count > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center t-num">
              {cart.count}
            </span>
          )}
        </div>
        <div className="flex-1 text-left">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-bold">
            {cart.count === 0 ? 'Carrito vacío' : `${cart.count} ítems · ver carrito`}
          </div>
          <div className="font-display font-extrabold text-[18px] leading-none mt-0.5 t-num">{fmtCRC(cart.total)}</div>
        </div>
        <span className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-[12px] font-semibold flex items-center gap-1.5">
          {cart.count === 0 ? 'Agregar' : t('demo.cart.checkout')}
          <Icon name="ArrowRight" size={13} />
        </span>
      </button>

      {/* Bottom sheets */}
      {sheet && <Backdrop onClose={() => setSheet(null)} />}

      {sheet === 'cart' && (
        <CartSheet
          cart={cart}
          onClose={() => setSheet(null)}
          onCheckout={() => { setSheet(null); onCheckout(); }}
        />
      )}

      {sheet === 'customer' && (
        <Sheet title={t('demo.customers.pickLabel')} onClose={() => setSheet(null)}>
          <div className="flex-1 overflow-auto scroll-area p-3 space-y-2">
            {customers.map((c: DemoCustomer) => (
              <button
                key={c.id}
                onClick={() => { cart.setCustomer(c); setSheet(null); }}
                className={`w-full text-left p-3 rounded-md border ${cart.customer.id === c.id ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-semibold text-[14px] truncate">{c.name}</div>
                    <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                      {c.id_doc}{c.email ? ' · ' + c.email : ''}
                    </div>
                  </div>
                  {cart.customer.id === c.id && <Icon name="Check" size={16} className="text-primary shrink-0" />}
                </div>
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {sheet === 'docs' && (
        <Sheet title="Tipo de documento" onClose={() => setSheet(null)}>
          <div className="p-3 space-y-2">
            {(Array.isArray(docTypes) ? docTypes : []).map(({ key, name, desc }) => (
              <button
                key={key}
                onClick={() => { cart.setDocType(key as 'FE' | 'TE' | 'NC'); setSheet(null); }}
                className={`w-full text-left p-3 rounded-md border flex items-start gap-3 ${cart.docType === key ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
              >
                <div className={`w-10 h-10 rounded-md flex items-center justify-center font-display font-extrabold text-[14px] ${cart.docType === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {key}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[14px]">{name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{desc}</div>
                </div>
                {cart.docType === key && <Icon name="Check" size={16} className="text-primary mt-2" />}
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  );
}
