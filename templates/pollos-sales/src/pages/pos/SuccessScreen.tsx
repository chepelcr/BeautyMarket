import { Icon, Card, Button } from "@/components/ui";

type PaymentMethod = "Efectivo" | "SINPE" | "Tarjeta";

interface SuccessScreenProps {
  total: number;
  paymentMethod: PaymentMethod;
  change?: number;
  onNewSale: () => void;
}

const fmt = (n: number) => "₡" + n.toLocaleString("es-CR");

const METHOD_ICON: Record<PaymentMethod, string> = {
  Efectivo: "cash",
  SINPE: "smartphone",
  Tarjeta: "card",
};

export default function SuccessScreen({ total, paymentMethod, change, onNewSale }: SuccessScreenProps) {
  return (
    <div
      className="fade-up"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: 32,
      }}
    >
      {/* Success icon-pill */}
      <div
        className="icon-pill"
        style={{
          width: 72,
          height: 72,
          background: "hsl(var(--success) / 0.12)",
          color: "hsl(var(--success))",
          border: "2px solid hsl(var(--success) / 0.4)",
        }}
      >
        <Icon name="checkCircle" size={32} />
      </div>

      {/* Title */}
      <div style={{ textAlign: "center" }}>
        <div
          className="t-h2"
          style={{ color: "hsl(var(--success))", marginBottom: 6 }}
        >
          Venta registrada
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            color: "hsl(var(--muted-foreground))",
          }}
        >
          <Icon name={METHOD_ICON[paymentMethod]} size={14} />
          <span className="t-sm">
            {paymentMethod} · {fmt(total)}
          </span>
        </div>
      </div>

      {/* Change card */}
      {paymentMethod === "Efectivo" && change !== undefined && change >= 0 && (
        <Card
          style={{
            padding: "20px 28px",
            textAlign: "center",
            background: "hsl(var(--success) / 0.08)",
            border: "1px solid hsl(var(--success) / 0.3)",
            width: "100%",
            maxWidth: 280,
          }}
        >
          <div className="t-label" style={{ marginBottom: 8, letterSpacing: "0.06em" }}>
            DEVOLVER AL CLIENTE
          </div>
          <div
            className="t-stat-xl"
            style={{ fontSize: 40, color: "hsl(var(--success))" }}
          >
            {fmt(change)}
          </div>
        </Card>
      )}

      {/* Sync note */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "hsl(var(--muted-foreground))",
        }}
      >
        <Icon name="refresh" size={12} />
        <span className="t-xs" style={{ fontFamily: "var(--font-mono)" }}>
          sync pendiente
        </span>
      </div>

      {/* New sale button */}
      <Button
        variant="primary"
        size="xl"
        icon="arrowLeft"
        onClick={onNewSale}
        style={{ width: "100%" }}
      >
        Nueva venta
      </Button>
    </div>
  );
}
