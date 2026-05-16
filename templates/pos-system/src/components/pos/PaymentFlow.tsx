import { Icon } from "@/components/ui";
import { PayTab } from "./PayTab";
import type { PayMethod } from "@/hooks/useCartFlow";

const fmt = (n: number) => "₡" + Math.round(n).toLocaleString("es-CR");

interface PaymentFlowProps {
  cartTotal: number;
  payMethod: PayMethod;
  cashGiven: string;
  sinpeCode: string;
  given: number;
  change: number;
  canConfirm: boolean;
  onPayMethodChange: (m: PayMethod) => void;
  onCashGivenChange: (v: string) => void;
  onSinpeCodeChange: (v: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}

export function PaymentFlow({
  cartTotal,
  payMethod,
  cashGiven,
  sinpeCode,
  given,
  change,
  canConfirm,
  onPayMethodChange,
  onCashGivenChange,
  onSinpeCodeChange,
  onBack,
  onConfirm,
}: PaymentFlowProps) {
  return (
    <div className="px-5 pt-4 pb-5 border-t border-border flex-shrink-0">
      <div className="flex gap-2 mb-4">
        <PayTab icon="cash" label="Efectivo" selected={payMethod === "cash"} onClick={() => onPayMethodChange("cash")} />
        <PayTab icon="card" label="Tarjeta" selected={payMethod === "card"} onClick={() => onPayMethodChange("card")} />
        <PayTab icon="smartphone" label="SINPE" selected={payMethod === "sinpe"} onClick={() => onPayMethodChange("sinpe")} />
      </div>

      {payMethod === "cash" && (
        <div className="mb-4">
          <label className="text-xs text-muted-foreground block mb-1.5">Monto recibido</label>
          <div className="relative mb-2">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₡</span>
            <input
              type="number"
              value={cashGiven}
              onChange={(e) => onCashGivenChange(e.target.value)}
              placeholder="0"
              className="w-full pl-[30px] pr-3.5 py-3 bg-foreground/[0.06] border border-border rounded-lg text-foreground font-display text-[22px] font-bold outline-none box-border"
            />
          </div>
          <div className="flex gap-1.5">
            {[1000, 2000, 5000, 10000, 20000].map((v) => (
              <button
                key={v}
                onClick={() => onCashGivenChange(String(v))}
                className="flex-1 py-1.5 px-0.5 bg-foreground/[0.06] border border-border rounded-lg text-muted-foreground text-[11px] font-semibold cursor-pointer"
              >
                {v / 1000}k
              </button>
            ))}
          </div>
          {given > 0 && (
            <div className="mt-3 px-3.5 py-2.5 bg-success/[0.08] border border-success/20 rounded-lg">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Vuelto</span>
                <span className="font-display text-xl font-bold text-success">{fmt(change)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {payMethod === "card" && (
        <div className="text-center py-4 mb-4">
          <Icon name="card" size={28} className="text-info mx-auto mb-2 block" />
          <div className="text-[13px] font-semibold text-foreground">Deslizar tarjeta</div>
          <div className="text-xs text-muted-foreground">Cobrar {fmt(cartTotal)}</div>
        </div>
      )}

      {payMethod === "sinpe" && (
        <div className="mb-4">
          <label className="text-xs text-muted-foreground block mb-1.5">Últimos 4 dígitos</label>
          <input
            maxLength={4}
            value={sinpeCode}
            onChange={(e) => onSinpeCodeChange(e.target.value)}
            placeholder="0000"
            className="w-full px-3.5 py-3 bg-foreground/[0.06] border border-border rounded-lg text-foreground font-display text-[22px] font-bold outline-none box-border tracking-[0.3em]"
          />
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="basis-12 flex-shrink-0 py-3 bg-foreground/[0.06] border border-border rounded-lg text-muted-foreground cursor-pointer flex items-center justify-center"
        >
          <Icon name="arrowLeft" size={18} />
        </button>
        <button
          onClick={onConfirm}
          disabled={!canConfirm}
          className={`flex-1 py-3.5 border-0 rounded-lg text-sm font-bold ${
            canConfirm
              ? "bg-accent-rose text-background cursor-pointer"
              : "bg-foreground/10 text-muted-foreground cursor-not-allowed"
          }`}
        >
          Confirmar {fmt(cartTotal)}
        </button>
      </div>
    </div>
  );
}
