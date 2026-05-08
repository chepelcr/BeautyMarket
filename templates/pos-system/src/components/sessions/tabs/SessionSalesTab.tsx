import { Card, Icon } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { fmt } from "@/utils/formatDate";
import type { StandData } from "@/types";

interface SessionSalesTabProps {
  stands?: StandData[];
  isLoading: boolean;
}

export function SessionSalesTab({ stands, isLoading }: SessionSalesTabProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))", textAlign: "center", padding: 32 }}>{t("common.loading")}</div>;
  }

  if (!stands || stands.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <div className="icon-pill icon-pill-lg" style={{ margin: "0 auto 12px", background: "hsl(var(--muted) / 0.3)", color: "hsl(var(--muted-foreground))", width: 56, height: 56 }}>
          <Icon name="dollar" size={24} />
        </div>
        <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Sin ventas registradas</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "grid", gap: 14 }}>
        {stands.map((stand) => {
          const total = stand.total_revenue || 1;
          return (
            <Card key={stand.id} style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{stand.name}</div>
                  <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{stand.cashier_name} · {stand.context}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="t-num" style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--font-display)", color: "hsl(var(--primary))" }}>
                    {fmt(stand.total_revenue)}
                  </div>
                  <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{stand.sales_count} ventas</div>
                </div>
              </div>
              {[
                { l: "Efectivo", v: stand.cash, c: "hsl(var(--success))" },
                { l: "SINPE", v: stand.sinpe, c: "hsl(var(--primary))" },
                { l: "Tarjeta", v: stand.card, c: "hsl(var(--info))" },
              ].map((p) => {
                const pct = (p.v / total) * 100;
                return (
                  <div key={p.l} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{p.l}</span>
                      <span className="t-num" style={{ fontSize: 12 }}>
                        {fmt(p.v)}{" "}
                        <span style={{ color: "hsl(var(--muted-foreground))" }}>({pct.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div className="progress progress-thin">
                      <div className="progress-bar" style={{ width: `${pct}%`, background: p.c }} />
                    </div>
                  </div>
                );
              })}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
