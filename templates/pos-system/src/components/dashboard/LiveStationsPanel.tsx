import { Icon, Badge, CardTitle, CardDescription } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import type { StandData } from "@/types";

interface LiveStationsPanelProps {
  stands: StandData[];
  isLoading: boolean;
  fmt: (n: number) => string;
}

export function LiveStationsPanel({ stands, isLoading, fmt }: LiveStationsPanelProps) {
  const { t } = useLanguage();

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <CardTitle>{t("dash.liveStations")}</CardTitle>
          <CardDescription>{t("dash.stationStatus")}</CardDescription>
        </div>
        <Badge variant="success">{t("dash.active", { n: String(stands.length) })}</Badge>
      </div>
      {isLoading ? (
        <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{t("dash.loading")}</div>
      ) : stands.length === 0 ? (
        <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))", textAlign: "center", padding: "24px 0" }}>{t("dash.noActiveStations")}</div>
      ) : (
        stands.map((p, i) => {
          const diffMin = Math.floor((Date.now() - p.last_sync_at) / 60000);
          const isOnline = diffMin <= 5;
          const maxRevenue = Math.max(...stands.map((s) => s.total_revenue), 1);
          return (
            <div key={p.id} style={{ padding: "14px 0", borderBottom: i < stands.length - 1 ? "1px solid hsl(var(--border))" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={`status-dot status-dot-${isOnline ? "success" : "warning"}`} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                    <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{p.cashier_name} · {p.context}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="t-num" style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>{fmt(p.total_revenue)}</div>
                  <div className="t-xs t-num" style={{ color: "hsl(var(--muted-foreground))" }}>{t("dash.stationOrders", { n: String(p.sales_count) })}</div>
                </div>
              </div>
              <div className="progress progress-thin" style={{ marginBottom: 8 }}>
                <div className="progress-bar" style={{ width: `${Math.min(100, (p.total_revenue / maxRevenue) * 100)}%` }} />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { key: "cash", icon: "cash", val: p.cash, pill: "icon-pill-success" },
                  { key: "sinpe", icon: "smartphone", val: p.sinpe, pill: "icon-pill-info" },
                  { key: "card", icon: "card", val: p.card, pill: "" },
                ].filter((m) => m.val > 0).map((m) => (
                  <div key={m.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div className={`icon-pill ${m.pill}`} style={{ width: 20, height: 20 }}>
                      <Icon name={m.icon} size={10} />
                    </div>
                    <span className="t-xs t-num" style={{ fontWeight: 600 }}>{fmt(m.val)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
