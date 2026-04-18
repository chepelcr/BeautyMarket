type PaymentMethod = "Efectivo" | "SINPE" | "Tarjeta";

interface SuccessScreenProps {
  total: number;
  paymentMethod: PaymentMethod;
  change?: number;
  onNewSale: () => void;
}

export default function SuccessScreen({
  total,
  paymentMethod,
  change,
  onNewSale,
}: SuccessScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
      {/* Check circle */}
      <div className="w-20 h-20 rounded-full bg-success/10 border-2 border-success flex items-center justify-center text-4xl">
        ✓
      </div>

      <div className="text-center">
        <div className="text-success font-barlow font-extrabold text-3xl tracking-wide">
          VENTA REGISTRADA
        </div>
        <div className="text-muted text-sm mt-1">
          {paymentMethod} · ₡{total.toLocaleString("es-CR")}
        </div>
      </div>

      {/* Change */}
      {paymentMethod === "Efectivo" && change !== undefined && change >= 0 && (
        <div className="bg-success/10 border border-success/30 rounded-xl px-6 py-4 text-center">
          <div className="text-muted text-xs mb-1 font-barlow tracking-widest">
            DEVOLVER AL CLIENTE
          </div>
          <div className="text-success font-barlow font-extrabold text-4xl">
            ₡{change.toLocaleString("es-CR")}
          </div>
        </div>
      )}

      <div className="text-[11px] text-muted font-mono">🔄 sync pendiente</div>

      <button
        onClick={onNewSale}
        className="w-full py-4 bg-primary text-white rounded-xl font-barlow font-extrabold text-xl tracking-wide active:bg-primary-dark"
      >
        ← NUEVA VENTA
      </button>
    </div>
  );
}
