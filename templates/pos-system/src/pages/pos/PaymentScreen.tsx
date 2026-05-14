import { useState } from "react";
import { Icon, Card, Button, Input, FormLabel } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";

type PaymentMethod = "Efectivo" | "SINPE" | "Tarjeta";

interface PaymentScreenProps {
  total: number;
  onBack: () => void;
  onConfirm: (method: PaymentMethod, received?: number) => Promise<void>;
}

const fmt = (n: number) => "₡" + n.toLocaleString("es-CR");

export default function PaymentScreen({ total, onBack, onConfirm }: PaymentScreenProps) {
  const { t } = useLanguage();
  const [method, setMethod] = useState<PaymentMethod>("Efectivo");
  const [received, setReceived] = useState("");
  const [loading, setLoading] = useState(false);

  const METHODS: { id: PaymentMethod; icon: string; label: string }[] = [
    { id: "Efectivo", icon: "cash", label: t("pos.cash") },
    { id: "SINPE", icon: "smartphone", label: t("pos.sinpe") },
    { id: "Tarjeta", icon: "card", label: t("pos.card") },
  ];

  const receivedNum = Number(received);
  const change = receivedNum - total;
  const canConfirm = method !== "Efectivo" || (received !== "" && receivedNum >= total);

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
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 16, gap: 14, overflowY: "auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Button variant="ghost" size="sm" icon="arrowLeft" onClick={onBack} />
        <h2 className="t-h2" style={{ margin: 0 }}>{t("payment.title")}</h2>
      </div>

      {/* Total card */}
      <Card style={{ padding: "20px 24px", textAlign: "center" }}>
        <div className="t-label" style={{ marginBottom: 8, letterSpacing: "0.08em" }}>
          {t("payment.totalLabel")}
        </div>
        <div
          className="t-stat-xl"
          style={{ fontSize: 48, color: "hsl(var(--primary))" }}
        >
          {fmt(total)}
        </div>
      </Card>

      {/* Method selector */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {METHODS.map(({ id, icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMethod(id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              padding: "14px 8px",
              borderRadius: 12,
              border: `2px solid ${method === id ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
              background: method === id ? "hsl(var(--primary) / 0.08)" : "transparent",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <div
              className="icon-pill"
              style={{
                width: 36,
                height: 36,
                background: method === id ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted))",
                color: method === id ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
              }}
            >
              <Icon name={icon} size={16} />
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                color: method === id ? "hsl(var(--primary))" : "hsl(var(--foreground))",
              }}
            >
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Efectivo */}
      {method === "Efectivo" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <FormLabel style={{ letterSpacing: "0.06em" }}>
            {t("payment.receivedLabel")}
          </FormLabel>
          <Input
            type="number"
            placeholder="₡0"
            value={received}
            onChange={(e) => setReceived(e.target.value)}
            inputSize="lg"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 32,
              textAlign: "center",
              borderColor:
                received
                  ? receivedNum >= total
                    ? "hsl(var(--success))"
                    : "hsl(var(--destructive))"
                  : undefined,
            }}
          />

          {/* Quick amount chips */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[1000, 2000, 5000, 10000, 20000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setReceived(String(amt))}
                className="btn btn-outline btn-xs"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ₡{amt.toLocaleString("es-CR")}
              </button>
            ))}
          </div>

          {/* Change card */}
          {received && receivedNum >= total && (
            <Card
              style={{
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "hsl(var(--success) / 0.08)",
                border: "1px solid hsl(var(--success) / 0.3)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="cash" size={16} style={{ color: "hsl(var(--success))" } as any} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--success))" }}>
                  {t("payment.return")}
                </span>
              </div>
              <span
                className="t-stat"
                style={{ fontSize: 22, color: "hsl(var(--success))" }}
              >
                {fmt(change)}
              </span>
            </Card>
          )}

          {received && receivedNum < total && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "hsl(var(--destructive))",
              }}
            >
              <Icon name="alertTri" size={14} />
              <span className="t-sm" style={{ fontWeight: 600 }}>
                {t("payment.remaining", { amount: fmt(total - receivedNum) })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* SINPE */}
      {method === "SINPE" && (
        <Card style={{ padding: "24px", textAlign: "center" }}>
          <div className="t-label" style={{ marginBottom: 10, letterSpacing: "0.06em" }}>
            {t("payment.sinpeTitle")}
          </div>
          <div
            className="t-num"
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: "hsl(var(--primary))",
              letterSpacing: "0.08em",
              marginBottom: 12,
            }}
          >
            {import.meta.env.VITE_SINPE_NUMBER || "8888-8888"}
          </div>
          <p className="t-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            {t("payment.sinpeInstruction", { amount: fmt(total) })}
          </p>
        </Card>
      )}

      {/* Tarjeta */}
      {method === "Tarjeta" && (
        <Card style={{ padding: "32px 24px", textAlign: "center" }}>
          <div
            className="icon-pill"
            style={{
              width: 64,
              height: 64,
              margin: "0 auto 16px",
              background: "hsl(var(--primary) / 0.1)",
              color: "hsl(var(--primary))",
            }}
          >
            <Icon name="card" size={28} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "var(--font-display)", marginBottom: 6 }}>
            {t("payment.cardInstruction")}
          </div>
          <p className="t-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            {t("payment.amountLabel")} <strong style={{ color: "hsl(var(--primary))" }}>{fmt(total)}</strong>
          </p>
        </Card>
      )}

      {/* Confirm button */}
      <Button
        variant="primary"
        size="xl"
        onClick={handleConfirm}
        disabled={!canConfirm || loading}
        icon={loading ? undefined : "checkCircle"}
        style={{ width: "100%", marginTop: "auto" }}
      >
        {loading
          ? t("payment.registering")
          : t("payment.confirm", { method: METHODS.find((m) => m.id === method)?.label ?? method })}
      </Button>
    </div>
  );
}
