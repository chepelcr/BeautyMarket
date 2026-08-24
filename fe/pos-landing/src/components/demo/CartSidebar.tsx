import { Icon } from '@/components/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';
import { fmtCRC } from '@/lib/format';
import type { CartState } from '@/hooks/useCart';

interface CartSidebarProps {
  cart:        CartState;
  onCheckout:  () => void;
  onCustomers: () => void;
}

export function CartSidebar({ cart, onCheckout, onCustomers }: CartSidebarProps) {
  const { t }  = useTranslation();
  const docs: Array<['FE' | 'TE' | 'NC', string]> = [
    ['FE', 'Factura'],
    ['TE', 'Tiquete'],
    ['NC', 'Nota crédito'],
  ];

  return (
    <aside className="flex flex-col bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Icon name="ShoppingCart" size={16} />
          <span className="font-display font-bold text-[15px]">{t('demo.cart.title')}</span>
          <span className="px-1.5 h-5 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold t-num">
            {cart.count}
          </span>
        </div>
        {cart.items.length > 0 && (
          <button
            onClick={cart.clear}
            className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1"
          >
            <Icon name="Trash" size={11} />{t('demo.cart.clear')}
          </button>
        )}
      </div>

      {/* Doc type */}
      <div className="px-3 py-2 border-b border-border shrink-0">
        <div className="grid grid-cols-3 gap-1 p-0.5 rounded-md bg-muted">
          {docs.map(([k, l]) => (
            <button
              key={k}
              onClick={() => cart.setDocType(k)}
              className={`h-7 rounded text-[11px] font-display font-bold uppercase tracking-wider ${cart.docType === k ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Customer */}
      <div className="px-3 py-2 border-b border-border shrink-0">
        <button
          onClick={onCustomers}
          className="w-full h-9 rounded-md border border-dashed border-border text-[12px] hover:bg-muted flex items-center justify-between px-3"
        >
          <span className="flex items-center gap-2 truncate">
            <Icon name="Users" size={13} className="text-muted-foreground shrink-0" />
            <span className="truncate">{cart.customer.name}</span>
          </span>
          <Icon name="ArrowRight" size={12} className="text-muted-foreground shrink-0" />
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-auto scroll-area px-3 py-2 space-y-2">
        {cart.items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-8 gap-2">
            <Icon name="ShoppingCart" size={28} className="opacity-40" />
            <div className="text-[12px]">{t('demo.emptyCart')}<br />{t('demo.emptyCartSub')}</div>
          </div>
        ) : (
          cart.items.map(p => (
            <div key={p.id} className="rounded-md border border-border bg-background p-2.5">
              <div className="flex justify-between gap-2">
                <span className="text-[12px] font-semibold leading-tight line-clamp-1">{p.name}</span>
                <span className="text-[11px] font-mono t-num shrink-0">{fmtCRC(p.price * p.q)}</span>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] font-mono text-muted-foreground">{p.sku}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => cart.setQ(p.id, p.q - 1)}
                    className="w-6 h-6 rounded border border-border bg-card flex items-center justify-center text-muted-foreground hover:border-primary/40"
                  >
                    <Icon name="Minus" size={11} />
                  </button>
                  <span className="w-7 text-center text-[12px] font-mono t-num">{p.q}</span>
                  <button
                    onClick={() => cart.setQ(p.id, p.q + 1)}
                    className="w-6 h-6 rounded border border-border bg-card flex items-center justify-center text-muted-foreground hover:border-primary/40"
                  >
                    <Icon name="Plus" size={11} />
                  </button>
                  <button
                    onClick={() => cart.remove(p.id)}
                    className="w-6 h-6 rounded border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 ml-1"
                  >
                    <Icon name="Trash" size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <div className="px-4 py-3 border-t border-border space-y-1 text-[12px] shrink-0">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('demo.cart.subtotal')}</span>
          <span className="font-mono t-num">{fmtCRC(cart.sub)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('demo.cart.iva')}</span>
          <span className="font-mono t-num">{fmtCRC(cart.iva)}</span>
        </div>
        <div className="flex justify-between text-[15px] font-display font-extrabold pt-1">
          <span>{t('demo.cart.total')}</span>
          <span className="font-mono t-num text-primary">{fmtCRC(cart.total)}</span>
        </div>
        <button
          onClick={onCheckout}
          disabled={cart.count === 0}
          className="mt-2 w-full h-11 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('demo.cart.checkout')} · {fmtCRC(cart.total)}
          <Icon name="ArrowRight" size={14} />
        </button>
      </div>
    </aside>
  );
}
