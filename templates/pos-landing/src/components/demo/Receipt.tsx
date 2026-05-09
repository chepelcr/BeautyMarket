import { Icon } from '@/components/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';
import { fmtCRC } from '@/lib/format';
import type { CartState } from '@/hooks/useCart';

interface ReceiptProps {
  cart:     CartState;
  method:   'cash' | 'card' | 'sinpe';
  change:   number;
  tendered: number;
  onClose:  () => void;
}

export function Receipt({ cart, method, change, tendered, onClose }: ReceiptProps) {
  const { t }   = useTranslation();
  const consec  = '00100001010000' + Math.floor(100000 + Math.random() * 900000);
  const clave   = '506' + Date.now().toString().slice(-22);

  const docTypes  = t('demo.receipt.types') as unknown as Record<string, string>;
  const methods   = t('demo.receipt.methods') as unknown as Record<string, string>;

  const typeLabel   = docTypes?.[cart.docType] ?? cart.docType;
  const methodLabel = methods?.[method] ?? method;

  return (
    <div className="overflow-auto scroll-area">
      <div className="px-6 pt-5 pb-3 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-success/15 text-success flex items-center justify-center mb-2">
          <Icon name="BadgeCheck" size={30} />
        </div>
        <div className="font-display font-extrabold text-[22px]">Aceptado por Hacienda</div>
        <div className="text-[11px] text-muted-foreground mt-1">Comprobante 4.4 firmado y validado</div>
      </div>

      <div className="mx-5 rounded-md border border-border bg-background p-4 font-mono text-[11px] space-y-1.5">
        <div className="flex justify-between"><span className="text-muted-foreground">{t('demo.receipt.typeLabel')}</span><span>{typeLabel}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">{t('demo.receipt.consecLabel')}</span><span className="t-num">{consec}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">{t('demo.receipt.claveLabel')}</span><span className="t-num truncate ml-2">{clave.slice(0, 12)}…{clave.slice(-4)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">{t('demo.receipt.clientLabel')}</span><span className="truncate ml-2">{cart.customer.name}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">{t('demo.receipt.paymentLabel')}</span><span>{methodLabel}</span></div>
        <div className="border-t border-dashed border-border my-1 pt-1"/>
        <div className="flex justify-between"><span className="text-muted-foreground">{t('demo.cart.subtotal')}</span><span className="t-num">{fmtCRC(cart.sub)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">{t('demo.cart.iva')}</span><span className="t-num">{fmtCRC(cart.iva)}</span></div>
        <div className="flex justify-between font-bold text-[13px] pt-1"><span>TOTAL</span><span className="t-num">{fmtCRC(cart.total)}</span></div>
        {method === 'cash' && (
          <>
            <div className="flex justify-between"><span className="text-muted-foreground">Recibido</span><span className="t-num">{fmtCRC(tendered)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Vuelto</span><span className="t-num">{fmtCRC(change)}</span></div>
          </>
        )}
      </div>

      <div className="p-5 grid grid-cols-2 gap-2">
        <button className="h-11 rounded-md border border-border bg-card text-[12px] font-semibold flex items-center justify-center gap-1.5">
          <Icon name="FileText" size={13} />{t('demo.receipt.sendXml')}
        </button>
        <button className="h-11 rounded-md border border-border bg-card text-[12px] font-semibold flex items-center justify-center gap-1.5">
          <Icon name="Receipt" size={13} />{t('demo.receipt.printTicket')}
        </button>
        <button
          onClick={onClose}
          className="col-span-2 h-12 rounded-md bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2"
        >
          {t('demo.checkout.newSaleLabel')}
          <Icon name="ArrowRight" size={15} />
        </button>
      </div>
    </div>
  );
}
