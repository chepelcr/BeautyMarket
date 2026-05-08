import { Card, Icon, Badge } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { fmt } from "@/utils/formatDate";
import type { DashboardData } from "@/types";

interface SessionOverviewTabProps {
  dashboardData?: DashboardData;
  isLoading: boolean;
}

export function SessionOverviewTab({ dashboardData, isLoading }: SessionOverviewTabProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))", textAlign: "center", padding: 32 }}>{t("common.loading")}</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Ventas totales", value: fmt(dashboardData?.total_revenue ?? 0), icon: "dollar", color: "primary" },
          { label: "Órdenes", value: String(dashboardData?.total_sales ?? 0), icon: "cart", color: "info" },
          { label: "Ticket promedio", value: fmt(dashboardData?.avg_ticket ?? 0), icon: "trending", color: "success" },
          { label: "Puestos activos", value: String(dashboardData?.stands?.length ?? 0), icon: "store", color: "warning" },
        ].map((k) => (
          <Card key={k.label} style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div className="t-label" style={{ fontSize: 10 }}>{k.label}</div>
              <div className={`icon-pill icon-pill-${k.color}`} style={{ width: 28, height: 28 }}>
                <Icon name={k.icon} size={12} />
              </div>
            </div>
            <div className="t-stat-xl" style={{ fontSize: 22 }}>{k.value}</div>
          </Card>
        ))}
      </div>

      {/* Stand breakdown */}
      {(dashboardData?.stands?.length ?? 0) > 0 && (
        <Card style={{ padding: 0 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--border))" }}>
            <div className="t-h3" style={{ fontSize: 15 }}>Rendimiento por puesto</div>
          </div>
          {dashboardData!.stands.map((stand, i) => (
            <div key={stand.id} style={{ padding: "14px 20px", borderBottom: i < dashboardData!.stands.length - 1 ? "1px solid hsl(var(--border))" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{stand.name}</div>
                  <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{stand.cashier_name} · {stand.sales_count} órdenes</div>
                </div>
                <div className="t-num" style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-display)", color: "hsl(var(--primary))" }}>
                  {fmt(stand.total_revenue)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { l: "Efectivo", v: stand.cash, c: "success" },
                  { l: "SINPE", v: stand.sinpe, c: "primary" },
                  { l: "Tarjeta", v: stand.card, c: "info" },
                ].map((p) => (
                  <Badge key={p.l} variant={p.c as any} style={{ fontSize: 11 }}>{p.l}: {fmt(p.v)}</Badge>
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
