import { Icon } from "@/components/ui";
import { POS } from "@/theme/pos";
import { useLanguage } from "@/contexts/LanguageContext";
import type { PayMethod } from "@/hooks/useCartFlow";

const fmt = (n: number) => "₡" + Math.round(n).toLocaleString("es-CR");

interface SaleSuccessOverlayProps {
  total: number;
  change: number;
  method: PayMethod;
  orderNum: number;
  onNewSale: () => void;
}

export function SaleSuccessOverlay({ total, change, method, orderNum, onNewSale }: SaleSuccessOverlayProps) {
  const { t } = useLanguage();

  const methodLabel = method === "cash" ? "Efectivo" : method === "card" ? "Tarjeta" : "SINPE";

  return (
    <div
      style={{
        height: "100%",
        minHeight: "60vh",
        background: POS.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(50,215,75,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            border: "2px solid rgba(50,215,75,0.4)",
          }}
        >
          <Icon name="check" size={36} style={{ color: POS.success }} strokeWidth={3} />
        </div>

        <div style={{ fontFamily: POS.fontDisplay, fontSize: 32, fontWeight: 600, color: POS.text, marginBottom: 8 }}>
          {t("pos.saleRegistered")}
        </div>
        <div style={{ fontFamily: POS.fontUI, fontSize: 14, color: POS.muted, marginBottom: 24 }}>
          Orden #{orderNum} · {fmt(total)} · {methodLabel}
        </div>

        {method === "cash" && change > 0 && (
          <div
            style={{
              background: "rgba(50,215,75,0.1)",
              border: "1px solid rgba(50,215,75,0.3)",
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 24,
            }}
          >
            <div style={{ fontFamily: POS.fontUI, fontSize: 12, color: POS.success, marginBottom: 4 }}>
              {t("pos.deliverChange")}
            </div>
            <div style={{ fontFamily: POS.fontDisplay, fontSize: 40, fontWeight: 700, color: POS.success }}>
              {fmt(change)}
            </div>
          </div>
        )}

        <button
          onClick={onNewSale}
          style={{
            width: "100%",
            padding: "14px 0",
            background: POS.rose,
            color: "#1C1C1E",
            border: "none",
            borderRadius: 12,
            fontFamily: POS.fontUI,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {t("pos.newSale")}
        </button>
      </div>
    </div>
  );
}
