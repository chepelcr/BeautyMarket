import { useState } from "react";
import { cn } from "@/lib/utils";

type PaymentMethod = "Efectivo" | "SINPE" | "Tarjeta";

interface PaymentScreenProps {
  total: number;
  onBack: () => void;
  onConfirm: (method: PaymentMethod, received?: number) => Promise<void>;
}

const METHODS: PaymentMethod[] = ["Efectivo", "SINPE", "Tarjeta"];

export default function PaymentScreen({ total, onBack, onConfirm }: PaymentScreenProps) {
  const [method, setMethod] = useState<PaymentMethod>("Efectivo");
  const [received, setReceived] = useState("");
  const [loading, setLoading] = useState(false);

  const receivedNum = Number(received);
  const change = receivedNum - total;
  const canConfirm =
    method !== "Efectivo" || (received !== "" && receivedNum >= total);

  const handleConfirm = async () => {
    if (!canConfirm || loading) return;
    setLoading(true);
    try {
      await onConfirm(method, method === "Efectivo" ? receivedNum : undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 bg-surface-high border border-surface-border rounded-lg text-muted text-base"
        >
          ←
        </button>
        <span className="font-barlow font-extrabold text-2xl text-foreground">COBRO</span>
      </div>

      {/* Total */}
      <div className="bg-surface border border-surface-border rounded-xl p-5 text-center">
        <div className="text-[11px] text-muted tracking-widest font-barlow mb-1">
          TOTAL A COBRAR
        </div>
        <div className="text-primary font-barlow font-extrabold text-5xl">
          ₡{total.toLocaleString("es-CR")}
        </div>
      </div>

      {/* Method selector */}
      <div className="flex gap-2">
        {METHODS.map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={cn(
              "flex-1 py-2.5 rounded-lg border font-barlow font-bold text-sm transition-colors",
              method === m
                ? "bg-primary border-primary text-white"
                : "bg-surface-high border-surface-border text-muted"
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Method-specific UI */}
      {method === "Efectivo" && (
        <div className="flex flex-col gap-3">
          <label className="text-xs text-muted tracking-widest font-barlow">
            MONTO RECIBIDO
          </label>
          <input
            type="number"
            placeholder="₡0"
            value={received}
            onChange={(e) => setReceived(e.target.value)}
            className={cn(
              "w-full px-4 py-3.5 bg-surface-high border rounded-xl text-foreground font-barlow font-extrabold text-4xl outline-none transition-colors",
              received && receivedNum >= total
                ? "border-success"
                : "border-surface-border focus:border-primary"
            )}
          />
          {received && receivedNum >= total && (
            <div className="bg-success/10 border border-success/30 rounded-xl px-4 py-3 flex justify-between items-center">
              <span className="text-success font-barlow font-bold text-base">
                💵 DEVOLVER
              </span>
              <span className="text-success font-barlow font-extrabold text-2xl">
                ₡{change.toLocaleString("es-CR")}
              </span>
            </div>
          )}
          {received && receivedNum < total && (
            <p className="text-destructive text-sm font-barlow">
              ⚠ Faltan ₡{(total - receivedNum).toLocaleString("es-CR")}
            </p>
          )}
        </div>
      )}

      {method === "SINPE" && (
        <div className="bg-surface border border-surface-border rounded-xl p-5 text-center">
          <div className="text-[11px] text-muted mb-2 font-barlow tracking-widest">
            SINPE MÓVIL — NÚMERO DESTINO
          </div>
          <div className="text-primary font-mono font-extrabold text-4xl tracking-widest mb-3">
            {import.meta.env.VITE_SINPE_NUMBER || "8888-8888"}
          </div>
          <div className="text-muted text-sm">
            Pedile al cliente que transfiera{" "}
            <span className="text-primary font-bold">
              ₡{total.toLocaleString("es-CR")}
            </span>
          </div>
        </div>
      )}

      {method === "Tarjeta" && (
        <div className="bg-surface border border-surface-border rounded-xl p-5 text-center">
          <div className="text-5xl mb-3">💳</div>
          <div className="text-foreground font-barlow font-bold text-lg">
            Pasá la tarjeta por el datafono
          </div>
          <div className="text-muted text-sm mt-2">
            Monto:{" "}
            <span className="text-primary font-bold">
              ₡{total.toLocaleString("es-CR")}
            </span>
          </div>
        </div>
      )}

      {/* Confirm */}
      <button
        onClick={handleConfirm}
        disabled={!canConfirm || loading}
        className={cn(
          "w-full py-4 rounded-xl font-barlow font-extrabold text-xl tracking-wide transition-colors mt-auto",
          canConfirm && !loading
            ? "bg-primary text-white active:bg-primary-dark"
            : "bg-surface-high text-muted cursor-not-allowed"
        )}
      >
        {loading ? "Registrando..." : `✓ CONFIRMAR ${method.toUpperCase()}`}
      </button>
    </div>
  );
}
