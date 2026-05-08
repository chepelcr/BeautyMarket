import { Icon } from "@/components/ui";
import { POS } from "@/theme/pos";
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
    <div style={{ padding: "16px 20px 20px", borderTop: `1px solid ${POS.border}`, flexShrink: 0 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <PayTab icon="cash" label="Efectivo" selected={payMethod === "cash"} onClick={() => onPayMethodChange("cash")} />
        <PayTab icon="card" label="Tarjeta" selected={payMethod === "card"} onClick={() => onPayMethodChange("card")} />
        <PayTab icon="smartphone" label="SINPE" selected={payMethod === "sinpe"} onClick={() => onPayMethodChange("sinpe")} />
      </div>

      {payMethod === "cash" && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: POS.fontUI, fontSize: 12, color: POS.muted, display: "block", marginBottom: 6 }}>
            Monto recibido
          </label>
          <div style={{ position: "relative", marginBottom: 8 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: POS.muted, fontWeight: 600, fontFamily: POS.fontUI }}>₡</span>
            <input
              type="number"
              value={cashGiven}
              onChange={(e) => onCashGivenChange(e.target.value)}
              placeholder="0"
              style={{
                width: "100%",
                padding: "12px 14px 12px 30px",
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${POS.border}`,
                borderRadius: 10,
                color: POS.text,
                fontFamily: POS.fontDisplay,
                fontSize: 22,
                fontWeight: 700,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[1000, 2000, 5000, 10000, 20000].map((v) => (
              <button
                key={v}
                onClick={() => onCashGivenChange(String(v))}
                style={{ flex: 1, padding: "6px 2px", background: "rgba(255,255,255,0.06)", border: `1px solid ${POS.border}`, borderRadius: 8, color: POS.muted, fontFamily: POS.fontUI, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
              >
                {v / 1000}k
              </button>
            ))}
          </div>
          {given > 0 && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(50,215,75,0.08)", border: "1px solid rgba(50,215,75,0.2)", borderRadius: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: POS.fontUI, fontSize: 12, color: POS.muted }}>Vuelto</span>
                <span style={{ fontFamily: POS.fontDisplay, fontSize: 20, fontWeight: 700, color: POS.success }}>{fmt(change)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {payMethod === "card" && (
        <div style={{ textAlign: "center", padding: "16px 0", marginBottom: 16 }}>
          <Icon name="card" size={28} style={{ color: POS.info, margin: "0 auto 8px", display: "block" }} />
          <div style={{ fontFamily: POS.fontUI, fontSize: 13, fontWeight: 600, color: POS.text }}>Deslizar tarjeta</div>
          <div style={{ fontFamily: POS.fontUI, fontSize: 12, color: POS.muted }}>Cobrar {fmt(cartTotal)}</div>
        </div>
      )}

      {payMethod === "sinpe" && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: POS.fontUI, fontSize: 12, color: POS.muted, display: "block", marginBottom: 6 }}>
            Últimos 4 dígitos
          </label>
          <input
            maxLength={4}
            value={sinpeCode}
            onChange={(e) => onSinpeCodeChange(e.target.value)}
            placeholder="0000"
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${POS.border}`,
              borderRadius: 10,
              color: POS.text,
              fontFamily: POS.fontDisplay,
              fontSize: 22,
              fontWeight: 700,
              outline: "none",
              boxSizing: "border-box",
              letterSpacing: "0.3em",
            }}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onBack}
          style={{ flex: "0 0 48px", padding: "12px 0", background: "rgba(255,255,255,0.06)", border: `1px solid ${POS.border}`, borderRadius: 10, color: POS.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Icon name="arrowLeft" size={18} />
        </button>
        <button
          onClick={onConfirm}
          disabled={!canConfirm}
          style={{
            flex: 1,
            padding: "14px 0",
            background: canConfirm ? POS.rose : "rgba(255,255,255,0.1)",
            color: canConfirm ? "#1C1C1E" : POS.muted,
            border: "none",
            borderRadius: 10,
            fontFamily: POS.fontUI,
            fontSize: 14,
            fontWeight: 700,
            cursor: canConfirm ? "pointer" : "not-allowed",
          }}
        >
          Confirmar {fmt(cartTotal)}
        </button>
      </div>
    </div>
  );
}
