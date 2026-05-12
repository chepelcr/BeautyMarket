import type { SaleResponse } from '@/types/invoice';

const fmt = (n: number) => '₡' + Math.round(n).toLocaleString('es-CR');

interface ReceiptProps {
  sale?: SaleResponse;
  cartTotal: number;
  itemCount: number;
  onClose: () => void;
}

export function Receipt({ sale, cartTotal, itemCount, onClose }: ReceiptProps) {
  return (
    <div className="px-5 py-6 flex flex-col items-center gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-success/10 border-2 border-success/30 flex items-center justify-center text-3xl">
        ✓
      </div>

      <div>
        <div className="font-display font-bold text-[20px]">¡Venta completada!</div>
        {sale?.consecutive_number ? (
          <div className="text-[13px] text-muted-foreground mt-1">
            Comprobante #{sale.consecutive_number}
          </div>
        ) : (
          <div className="text-[12px] text-muted-foreground mt-1">
            Enviando a Hacienda — pendiente de número consecutivo
          </div>
        )}
      </div>

      <div className="w-full rounded-lg border border-border bg-muted/30 divide-y divide-border text-[13px]">
        <div className="flex justify-between px-4 py-2">
          <span className="text-muted-foreground">Ítems</span>
          <span className="font-semibold">{itemCount}</span>
        </div>
        <div className="flex justify-between px-4 py-2">
          <span className="text-muted-foreground">Total</span>
          <span className="font-mono t-num font-bold text-primary">{fmt(cartTotal)}</span>
        </div>
        {sale?.pdf_url ? (
          <div className="flex justify-between px-4 py-2">
            <span className="text-muted-foreground">PDF</span>
            <a
              href={sale.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline text-[12px]"
            >
              Descargar
            </a>
          </div>
        ) : (
          <div className="flex justify-between px-4 py-2">
            <span className="text-muted-foreground">PDF</span>
            <span className="text-muted-foreground text-[12px]">Pendiente</span>
          </div>
        )}
      </div>

      <button
        onClick={onClose}
        className="w-full h-11 rounded-md bg-primary text-primary-foreground font-semibold text-[13px]"
      >
        Nueva venta
      </button>
    </div>
  );
}
