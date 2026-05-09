import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { LogoIcon } from '@/components/ui/LogoIcon';
import { StatusDot } from '@/components/ui/StatusDot';
import { CartSidebar } from './CartSidebar';
import { CustomerList } from './CustomerList';
import { useTranslation } from '@/hooks/useTranslation';
import { useConfig } from '@/hooks/useConfig';
import { fmtCRC } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { CartState } from '@/hooks/useCart';

interface PosDesktopProps {
  cart:       CartState;
  onCheckout: () => void;
}

export function PosDesktop({ cart, onCheckout }: PosDesktopProps) {
  const { t }       = useTranslation();
  const { config }  = useConfig();
  const [query, setQuery]           = useState('');
  const [cat, setCat]               = useState('Todo');
  const [showCustomers, setShowCustomers] = useState(false);

  const categories = config.demo.categories;
  const products   = config.demo.products;
  const customers  = config.demo.customers;

  const filtered = products.filter(p =>
    (cat === 'Todo' || p.cat === cat) &&
    (!query || p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()))
  );

  const hatched = { backgroundImage: `repeating-linear-gradient(45deg, hsl(var(--muted-foreground) / .15) 0 1px, transparent 1px 9px)` };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="h-[52px] flex items-center justify-between px-5 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/" className="w-8 h-8 -ml-2 rounded hover:bg-muted flex items-center justify-center text-muted-foreground">
            <Icon name="ChevronLeft" size={16} />
          </Link>
          <LogoIcon size={26} />
          <span className="font-display font-bold text-[18px] leading-none">Punto de venta</span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-[13px] text-muted-foreground">{t('demo.branchLabel')}</span>
          <span className="ml-2 px-1.5 py-0.5 rounded bg-info/10 text-info text-[10px] font-display font-bold uppercase tracking-wider">
            {t('demo.demoLabel')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-muted-foreground hidden md:inline">JCampos</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/12 text-success border border-success/30 text-[11px] font-semibold">
            <StatusDot size={7} />{t('demo.onlineLabel')}
          </span>
        </div>
      </div>

      {/* Body grid */}
      <div className="flex-1 grid overflow-hidden" style={{ gridTemplateColumns: '1fr 360px' }}>
        {/* Left: catalog */}
        <div className="flex flex-col border-r border-border overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border bg-card shrink-0">
            <button
              onClick={() => setShowCustomers(false)}
              className={cn('flex-1 py-3 text-[13px] font-semibold', !showCustomers ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground border-b-2 border-transparent')}
            >
              Productos
            </button>
            <button
              onClick={() => setShowCustomers(true)}
              className={cn('flex-1 py-3 text-[13px] font-semibold', showCustomers ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground border-b-2 border-transparent')}
            >
              Clientes
            </button>
          </div>

          {showCustomers ? (
            <CustomerList
              customers={customers}
              activeId={cart.customer.id}
              onPick={c => { cart.setCustomer(c); setShowCustomers(false); }}
            />
          ) : (
            <>
              {/* Search + categories */}
              <div className="p-3 space-y-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-10 rounded-md border border-border bg-card flex items-center px-3 gap-2">
                    <Icon name="Search" size={15} className="text-muted-foreground" />
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder={t('demo.searchPlaceholder')}
                      className="flex-1 bg-transparent outline-none text-sm"
                    />
                    {query && (
                      <button onClick={() => setQuery('')} className="text-muted-foreground">
                        <Icon name="X" size={14} />
                      </button>
                    )}
                  </div>
                  <button className="h-10 w-10 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:bg-muted">
                    <Icon name="Scan" size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(c => (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className={cn(
                        'h-7 px-3 rounded-full text-[11px] font-display font-bold uppercase tracking-wider border',
                        cat === c ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground hover:border-primary/40',
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product grid */}
              <div className="flex-1 overflow-auto scroll-area px-3 pb-3">
                {filtered.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                    <Icon name="Search" size={20} />
                    {t('demo.noResults')} &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                    {filtered.map(p => (
                      <button
                        key={p.id}
                        onClick={() => cart.add(p)}
                        className="group aspect-[5/4] rounded-md border border-border bg-card p-2 flex flex-col text-left hover:border-primary/60 hover:shadow-md hover:shadow-primary/5 transition"
                      >
                        <div className="flex-1 rounded bg-muted relative overflow-hidden">
                          <div className="absolute inset-0" style={hatched} />
                          <span className="absolute top-1 left-1 text-[8px] font-mono px-1 rounded bg-card/80 text-muted-foreground">{p.cat}</span>
                          {p.stock < 15 && (
                            <span className="absolute top-1 right-1 text-[8px] font-display font-bold uppercase px-1 rounded bg-warning/90 text-warning-foreground">{p.stock}</span>
                          )}
                        </div>
                        <div className="text-[11px] font-semibold leading-tight line-clamp-2 mt-1.5">{p.name}</div>
                        <div className="flex justify-between items-center mt-0.5">
                          <span className="text-[9px] font-mono text-muted-foreground">{p.sku}</span>
                          <span className="text-[11px] font-mono font-bold text-primary t-num">{fmtCRC(p.price)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: cart */}
        <CartSidebar cart={cart} onCheckout={onCheckout} onCustomers={() => setShowCustomers(true)} />
      </div>
    </div>
  );
}
