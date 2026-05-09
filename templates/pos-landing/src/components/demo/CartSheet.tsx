import { Sheet } from '@/components/ui/Sheet';
import { Icon } from '@/components/ui/Icon';
import { fmtCRC } from '@/lib/format';
import { useTranslation } from '@/hooks/useTranslation';
import type { CartState } from '@/hooks/useCart';

interface CartSheetProps {
  cart:       CartState;
  onClose:    () => void;
  onCheckout: () => void;
}

export function CartSheet({ cart, onClose, onCheckout }: CartSheetProps) {
  const { t } = useTranslation();
  return (
    <Sheet title={`${t('demo.cart.title')} · ${cart.count} ítems`} onClose={onClose}>
      <div className="flex-1 overflow-auto scroll-area px-3 py-3 space-y-2">
        {cart.items.map(p => (
          <div key={p.id} className="rounded-md border border-border bg-background p-2.5">
            <div className="flex justify-between gap-2">
              <span className="text-[12px] font-semibold leading-tight line-clamp-1">{p.name}</span>
              <span className="text-[11px] font-mono t-num shrink-0">{fmtCRC(p.price * p.q)}</span>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] font-mono text-muted-foreground">{p.sku}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => cart.setQ(p.id, p.q - 1)} className="w-6 h-6 rounded border border-border bg-card flex items-center justify-center text-muted-foreground"><Icon name="Minus" size={11} /></button>
                <span className="w-7 text-center text-[12px] font-mono t-num">{p.q}</span>
                <button onClick={() => cart.setQ(p.id, p.q + 1)} className="w-6 h-6 rounded border border-border bg-card flex items-center justify-center text-muted-foreground"><Icon name="Plus" size={11} /></button>
                <button onClick={() => cart.remove(p.id)} className="w-6 h-6 rounded border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-destructive ml-1"><Icon name="Trash" size={11} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-4 border-t border-border space-y-1 text-[13px] shrink-0">
        <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span className="font-semibold truncate ml-3">{cart.customer.name}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Documento</span><span className="font-display font-bold uppercase tracking-wider">{cart.docType}</span></div>
        <div className="flex justify-between mt-1 pt-1 border-t border-border"><span className="text-muted-foreground">{t('demo.cart.subtotal')}</span><span className="font-mono t-num">{fmtCRC(cart.sub)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">{t('demo.cart.iva')}</span><span className="font-mono t-num">{fmtCRC(cart.iva)}</span></div>
        <div className="flex justify-between text-[17px] font-display font-extrabold pt-1"><span>{t('demo.cart.total')}</span><span className="font-mono t-num text-primary">{fmtCRC(cart.total)}</span></div>
        <button onClick={onCheckout} className="mt-3 w-full h-12 rounded-md bg-primary text-primary-foreground text-[14px] font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-primary/30">
          {t('demo.cart.checkout')} · {fmtCRC(cart.total)}<Icon name="ArrowRight" size={15} />
        </button>
        <button onClick={cart.clear} className="mt-1 w-full h-10 text-[12px] text-muted-foreground hover:text-destructive flex items-center justify-center gap-1.5">
          <Icon name="Trash" size={12} />Vaciar carrito
        </button>
      </div>
    </Sheet>
  );
}
