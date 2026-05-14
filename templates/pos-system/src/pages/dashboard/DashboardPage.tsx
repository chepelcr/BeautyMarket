import { useQuery } from "@tanstack/react-query";
import { ROUTES } from "@/routePaths";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { crossAppApi, crossAppOrgPath } from "@/lib/api";
import { Icon, Card, CardTitle, CardDescription, Badge, Button } from "@/components/ui";
import { FadeIn } from "@/components/ui/FadeIn";
import { useLanguage } from "@/contexts/LanguageContext";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { LiveStationsPanel } from "@/components/dashboard/LiveStationsPanel";
import { TopProductsPanel } from "@/components/dashboard/TopProductsPanel";
import { DashboardStatSkeleton } from "@/components/dashboard/DashboardStatSkeleton";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";
import { QuickDocActionsCard } from "@/components/dashboard/QuickDocActionsCard";
import type { StandData, DashboardData } from "@/types";

const fmt = (n: number) => "₡" + Math.round(Number(n) || 0).toLocaleString("es-CR");
const fmtAgo = (ts: number) => {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return "hace " + Math.floor(diff) + "s";
  if (diff < 3600) return "hace " + Math.floor(diff / 60) + " min";
  return "hace " + Math.floor(diff / 3600) + " h";
};

const dominantMethod = (s: StandData): "cash" | "sinpe" | "card" => {
  if (s.cash >= s.sinpe && s.cash >= s.card) return "cash";
  if (s.sinpe >= s.card) return "sinpe";
  return "card";
};

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);
  const { t } = useLanguage();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["dashboard", org?.id],
    enabled: !!user && !!org,
    refetchInterval: 30_000,
    retry: 3,
    queryFn: () => crossAppApi.get<DashboardData>(crossAppOrgPath(org!.id, "/dashboard")),
  });

  const totalRevenue = data?.total_revenue ?? 0;
  const totalSales = data?.total_sales ?? 0;
  const avgTicket = data?.avg_ticket ?? 0;
  const stands = data?.stands ?? [];
  const ranking = data?.product_ranking ?? [];

  return (
    <div style={{ padding: "24px 24px 40px", maxWidth: 1500, margin: "0 auto" }}>
      {/* Welcome */}
      <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="t-h1" style={{ marginBottom: 6 }}>
            {(() => {
              const hour = new Date().getHours();
              if (hour < 12) return t("dash.morningGreeting");
              if (hour < 18) return t("dash.afternoonGreeting");
              return t("dash.eveningGreeting");
            })()},{" "}
            {user?.firstName ?? user?.name?.split(" ")[0] ?? ""}
          </h1>
          <p className="t-body" style={{ color: "hsl(var(--muted-foreground))" }}>
            {t("dash.activeStations", { n: String(stands.length) })}
          </p>
        </div>
        <Button variant="outline" size="sm" icon="refresh" onClick={() => void refetch()} disabled={isRefetching}>
          {isRefetching ? t("dash.refreshing") : t("dash.refresh")}
        </Button>
      </div>

      {/* Hero stat card */}
      <Card className="fade-up" style={{ padding: "20px 24px", marginBottom: 16, background: "linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.02))", borderColor: "hsl(var(--primary) / 0.25)", position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div className="t-label" style={{ color: "hsl(var(--primary))", marginBottom: 8 }}>{t("dash.sessionSales")}</div>
            <div className="t-stat-xl" style={{ fontSize: 44, color: "hsl(var(--primary))", lineHeight: 1 }}>
              {isLoading ? "…" : fmt(totalRevenue)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <Badge variant="success" style={{ gap: 5 }}>
                <span className="status-dot status-dot-live" style={{ width: 5, height: 5 }} />
                {t("dash.live")}
              </Badge>
              <span className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                {t("dash.stationOrders", { n: String(totalSales) })} · {stands.length} {t("dash.activeStationsLabel").toLowerCase()}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { label: t("dash.orders"), value: isLoading ? "…" : String(totalSales), icon: "cart", color: "icon-pill-info" },
              { label: t("dash.avgTicket"), value: isLoading ? "…" : fmt(avgTicket), icon: "chart", color: "icon-pill-success" },
              { label: t("dash.activeStationsLabel"), value: isLoading ? "…" : String(stands.length), icon: "store", color: "icon-pill-warning" },
            ].map((k) => (
              <div key={k.label} style={{ textAlign: "center", minWidth: 72 }}>
                <div className={`icon-pill ${k.color}`} style={{ width: 36, height: 36, margin: "0 auto 6px" }}>
                  <Icon name={k.icon} size={16} />
                </div>
                <div className="t-stat" style={{ fontSize: 18, fontWeight: 800 }}>{k.value}</div>
                <div className="t-label" style={{ fontSize: 10, marginTop: 2 }}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick document actions */}
      <FadeIn duration={0.4}>
        <div style={{ marginBottom: 16 }}>
          <QuickDocActionsCard />
        </div>
      </FadeIn>

      {/* Main 2-col */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14, marginBottom: 14 }}>
          <ChartSkeleton />
          <DashboardStatSkeleton />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14, marginBottom: 14 }}>
          <FadeIn duration={0.4}>
            <Card style={{ padding: 22, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <CardTitle>{t("dash.hourlyChart")}</CardTitle>
                  <CardDescription>{t("dash.currentSession")}</CardDescription>
                </div>
                <Badge variant="success">↗ +22% vs anterior</Badge>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div className="t-stat-xl" style={{ fontSize: 38 }}>{fmt(totalRevenue)}</div>
                <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Pico entre 19:30 — 20:15</div>
              </div>
              <SalesChart />
            </Card>
          </FadeIn>

          <FadeIn delay={0.1} duration={0.4}>
            <Card style={{ padding: 22, minWidth: 0 }}>
              <LiveStationsPanel stands={stands} isLoading={false} fmt={fmt} />
            </Card>
          </FadeIn>
        </div>
      )}

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        <Card style={{ padding: 22, minWidth: 0 }}>
          <TopProductsPanel ranking={ranking} isLoading={isLoading} fmt={fmt} />
        </Card>

        {/* Live sales feed */}
        <Card style={{ padding: 22, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <CardTitle>{t("dash.salesFeed")}</CardTitle>
              <CardDescription>{t("dash.realTime")}</CardDescription>
            </div>
            <Badge variant="primary-soft">
              <span className="status-dot status-dot-live" style={{ width: 6, height: 6 }} />{" "}
              {t("dash.live")}
            </Badge>
          </div>
          {stands.length === 0 && !isLoading ? (
            <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))", padding: "16px 0" }}>{t("dash.noRecentSales")}</div>
          ) : (
            stands.slice(0, 5).map((f, i) => {
              const method = dominantMethod(f);
              const pillClass = method === "cash" ? "icon-pill-success" : method === "sinpe" ? "icon-pill-info" : "";
              const iconName = method === "cash" ? "cash" : method === "sinpe" ? "smartphone" : "card";
              return (
                <div key={f.id} className="fade-up" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < stands.length - 1 ? "1px solid hsl(var(--border))" : "none" }}>
                  <div className={`icon-pill ${pillClass}`} style={{ width: 34, height: 34, flexShrink: 0 }}>
                    <Icon name={iconName} size={15} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{f.name}</span>
                      <span className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>· {f.cashier_name}</span>
                    </div>
                    <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t("dash.ordersRegistered", { n: String(f.sales_count) })}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div className="t-num" style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)", color: "hsl(var(--primary))" }}>{fmt(f.total_revenue)}</div>
                    <div className="t-xs t-num" style={{ color: "hsl(var(--muted-foreground))" }}>{fmtAgo(f.last_sync_at)}</div>
                  </div>
                </div>
              );
            })
          )}
        </Card>
      </div>
    </div>
  );
}
