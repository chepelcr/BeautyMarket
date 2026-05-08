import { Card, CardTitle, CardDescription, Icon } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";

const fmt = (n: number) => "₡" + Math.round(Number(n) || 0).toLocaleString("es-CR");

export interface PaymentTotals {
  ventas: number;
  efectivo: number;
  tarjeta: number;
  sinpe: number;
}

interface PaymentBreakdownProps {
  totals: PaymentTotals;
}

export function PaymentBreakdown({ totals }: PaymentBreakdownProps) {
  const { t } = useLanguage();

  const methods = [
    { l: t("report.cash"),        v: totals.efectivo, c: "success", i: "cash"       },
    { l: t("report.card"),        v: totals.tarjeta,  c: "info",    i: "card"       },
    { l: t("report.sinpeMobile"), v: totals.sinpe,    c: "primary", i: "smartphone" },
  ] as const;

  return (
    <Card style={{ padding: 22 }}>
      <CardTitle>{t("report.paymentMethods")}</CardTitle>
      <CardDescription style={{ marginBottom: 16 }}>{t("report.distribution")}</CardDescription>
      {methods.map((m) => {
        const pct = totals.ventas > 0 ? (m.v / totals.ventas) * 100 : 0;
        return (
          <div key={m.l} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  className={`icon-pill ${m.c === "primary" ? "" : `icon-pill-${m.c}`}`}
                  style={{ width: 26, height: 26 }}
                >
                  <Icon name={m.i} size={12} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{m.l}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="t-num" style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>
                  {fmt(m.v)}
                </div>
                <div className="t-xs t-num" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {pct.toFixed(0)}%
                </div>
              </div>
            </div>
            <div className="progress" style={{ height: 8 }}>
              <div className="progress-bar" style={{ width: `${pct}%`, background: `hsl(var(--${m.c}))` }} />
            </div>
          </div>
        );
      })}
    </Card>
  );
}
