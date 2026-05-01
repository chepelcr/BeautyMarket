import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ROUTES } from "@/routePaths";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { crossAppApi, crossAppOrgPath } from "@/lib/api";
import DashboardShell from "@/components/layout/DashboardShell";
import SessionsPage from "./SessionsPage";
import PuestosPage from "./PuestosPage";
import ProductsPage from "./ProductsPage";
import ReportePage from "./ReportePage";
import POSIntegratedPage from "./POSIntegratedPage";
import { Icon, Card, CardTitle, CardDescription, Badge, Button } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";

const fmt = (n: number) => "₡" + Math.round(Number(n) || 0).toLocaleString("es-CR");
const fmtAgo = (ts: number) => {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return "hace " + Math.floor(diff) + "s";
  if (diff < 3600) return "hace " + Math.floor(diff / 60) + " min";
  return "hace " + Math.floor(diff / 3600) + " h";
};

type Page = "dashboard" | "config" | "puestos" | "productos" | "reporte" | "pos";

interface StandData {
  id: string;
  name: string;
  cashier_name: string;
  context: string;
  total_revenue: number;
  sales_count: number;
  cash: number;
  sinpe: number;
  card: number;
  last_sync_at: number;
}

interface DashboardData {
  stands: StandData[];
  total_revenue: number;
  total_sales: number;
  avg_ticket: number;
  product_ranking: Array<{ name: string; emoji: string; units: number; revenue: number }>;
}

interface Session {
  session_id: string;
  name: string;
  type: string;
  context: string;
  start_time: string;
  is_active: boolean;
}

function SalesChart() {
  const data = [0, 4, 12, 25, 35, 48, 62, 75, 85, 92, 100, 95, 88, 76, 65];
  const max = 100;
  const w = 520, h = 180;
  const points = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - (v / max) * h,
  ]);
  const pathLine = "M " + points.map((p) => `${p[0]} ${p[1]}`).join(" L ");
  const pathArea = pathLine + ` L ${w} ${h} L 0 ${h} Z`;

  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        background: "hsl(var(--muted) / 0.3)",
        borderRadius: 8,
        padding: 12,
      }}
    >
      <svg
        viewBox={`0 0 ${w} ${h + 30}`}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((t, i) => (
          <line
            key={i}
            x1="0"
            x2={w}
            y1={t * h}
            y2={t * h}
            stroke="hsl(var(--border))"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
        ))}
        <path d={pathArea} fill="url(#salesGradient)" />
        <path
          d={pathLine}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) =>
          i === points.length - 3 ? (
            <circle
              key={i}
              cx={p[0]}
              cy={p[1]}
              r="4"
              fill="hsl(var(--primary))"
              stroke="hsl(var(--card))"
              strokeWidth="2"
            />
          ) : null
        )}
        {["18:00", "19:00", "20:00", "21:00"].map((lbl, i) => (
          <text
            key={lbl}
            x={(i / 3) * w}
            y={h + 20}
            fontSize="11"
            fill="hsl(var(--muted-foreground))"
            textAnchor={i === 0 ? "start" : i === 3 ? "end" : "middle"}
            fontFamily="var(--font-sans)"
          >
            {lbl}
          </text>
        ))}
      </svg>
    </div>
  );
}

function DashboardPanel({ data, isLoading, refetch, isRefetching }: {
  data?: DashboardData;
  isLoading: boolean;
  refetch: () => void;
  isRefetching: boolean;
}) {
  const { user } = useAuthContext();
  const { t } = useLanguage();
  const totalRevenue = data?.total_revenue ?? 0;
  const totalSales = data?.total_sales ?? 0;
  const avgTicket = data?.avg_ticket ?? 0;
  const stands = data?.stands ?? [];
  const ranking = data?.product_ranking ?? [];

  // Dominant payment method per stand (for feed icons)
  const dominantMethod = (s: StandData): "cash" | "sinpe" | "card" => {
    if (s.cash >= s.sinpe && s.cash >= s.card) return "cash";
    if (s.sinpe >= s.card) return "sinpe";
    return "card";
  };

  return (
    <div style={{ padding: "24px 24px 40px", maxWidth: 1500, margin: "0 auto" }}>
      {/* Welcome */}
      <div
        className="fade-up"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
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
        <Button
          variant="outline"
          size="sm"
          icon="refresh"
          onClick={refetch}
          disabled={isRefetching}
        >
          {isRefetching ? t("dash.refreshing") : t("dash.refresh")}
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon="store"
          onClick={() => (window.location.href = "/pos")}
        >
          {t("dash.goToPOS")}
        </Button>
      </div>

      {/* Hero stat card */}
      <Card
        className="fade-up"
        style={{
          padding: "20px 24px",
          marginBottom: 16,
          background: "linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.02))",
          borderColor: "hsl(var(--primary) / 0.25)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div className="t-label" style={{ color: "hsl(var(--primary))", marginBottom: 8 }}>
              {t("dash.sessionSales")}
            </div>
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

      {/* Main 2-col */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 14,
          marginBottom: 14,
        }}
      >
        {/* Sales chart */}
        <Card style={{ padding: 22, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 18,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <CardTitle>{t("dash.hourlyChart")}</CardTitle>
              <CardDescription>{t("dash.currentSession")}</CardDescription>
            </div>
            <Badge variant="success">↗ +22% vs anterior</Badge>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div className="t-stat-xl" style={{ fontSize: 38 }}>
              {fmt(totalRevenue)}
            </div>
            <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
              Pico entre 19:30 — 20:15
            </div>
          </div>
          <SalesChart />
        </Card>

        {/* Puestos en vivo */}
        <Card style={{ padding: 22, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <div>
              <CardTitle>{t("dash.liveStations")}</CardTitle>
              <CardDescription>{t("dash.stationStatus")}</CardDescription>
            </div>
            <Badge variant="success">{t("dash.active", { n: String(stands.length) })}</Badge>
          </div>
          {isLoading ? (
            <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              {t("dash.loading")}
            </div>
          ) : stands.length === 0 ? (
            <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))", textAlign: "center", padding: "24px 0" }}>
              {t("dash.noActiveStations")}
            </div>
          ) : (
            stands.map((p, i) => {
              const diffMin = Math.floor((Date.now() - p.last_sync_at) / 60000);
              const isOnline = diffMin <= 5;
              const maxRevenue = Math.max(...stands.map((s) => s.total_revenue), 1);
              return (
                <div
                  key={p.id}
                  style={{
                    padding: "14px 0",
                    borderBottom: i < stands.length - 1 ? "1px solid hsl(var(--border))" : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className={`status-dot status-dot-${isOnline ? "success" : "warning"}`} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                        <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                          {p.cashier_name} · {p.context}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="t-num" style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>
                        {fmt(p.total_revenue)}
                      </div>
                      <div className="t-xs t-num" style={{ color: "hsl(var(--muted-foreground))" }}>
                        {t("dash.stationOrders", { n: String(p.sales_count) })}
                      </div>
                    </div>
                  </div>
                  <div className="progress progress-thin" style={{ marginBottom: 8 }}>
                    <div className="progress-bar" style={{ width: `${Math.min(100, (p.total_revenue / maxRevenue) * 100)}%` }} />
                  </div>
                  {/* Payment breakdown */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[
                      { key: "cash",  icon: "cash",      label: "Efectivo", val: p.cash,  pill: "icon-pill-success" },
                      { key: "sinpe", icon: "smartphone", label: "SINPE",    val: p.sinpe, pill: "icon-pill-info" },
                      { key: "card",  icon: "card",       label: "Tarjeta",  val: p.card,  pill: "" },
                    ]
                      .filter((m) => m.val > 0)
                      .map((m) => (
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
        </Card>
      </div>

      {/* Bottom row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
        }}
      >
        {/* Top productos */}
        <Card style={{ padding: 22, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <CardTitle>{t("dash.topProducts")}</CardTitle>
              <CardDescription>{t("dash.bestSellers")}</CardDescription>
            </div>
          </div>
          {isLoading ? (
            <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{t("dash.loading")}</div>
          ) : ranking.length === 0 ? (
            <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))", padding: "16px 0" }}>
              {t("dash.noSalesData")}
            </div>
          ) : (
            ranking.slice(0, 5).map((item, i) => (
              <div
                key={item.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom: i < Math.min(4, ranking.length - 1) ? "1px solid hsl(var(--border))" : "none",
                }}
              >
                {/* Rank number */}
                <div
                  style={{
                    width: 28,
                    fontSize: 15,
                    fontWeight: 800,
                    fontFamily: "var(--font-display)",
                    color: i === 0 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                    flexShrink: 0,
                    textAlign: "center",
                  }}
                >
                  #{i + 1}
                </div>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    background: "hsl(var(--muted))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {item.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{item.name}</div>
                  <div className="t-xs t-num" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {t("dash.units", { n: String(item.units) })} · {fmt(item.revenue)}
                  </div>
                  <div className="progress progress-thin" style={{ marginTop: 5 }}>
                    <div
                      className="progress-bar"
                      style={{ width: `${Math.min(100, (item.units / (ranking[0]?.units || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </Card>

        {/* Feed en vivo */}
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
            <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))", padding: "16px 0" }}>
              {t("dash.noRecentSales")}
            </div>
          ) : (
            stands.slice(0, 5).map((f, i) => {
              const method = dominantMethod(f);
              const pillClass = method === "cash" ? "icon-pill-success" : method === "sinpe" ? "icon-pill-info" : "";
              const iconName = method === "cash" ? "cash" : method === "sinpe" ? "smartphone" : "card";
              return (
                <div
                  key={f.id}
                  className="fade-up"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: i < stands.length - 1 ? "1px solid hsl(var(--border))" : "none",
                  }}
                >
                  <div className={`icon-pill ${pillClass}`} style={{ width: 34, height: 34, flexShrink: 0 }}>
                    <Icon name={iconName} size={15} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{f.name}</span>
                      <span className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                        · {f.cashier_name}
                      </span>
                    </div>
                    <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t("dash.ordersRegistered", { n: String(f.sales_count) })}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div className="t-num" style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)", color: "hsl(var(--primary))" }}>
                      {fmt(f.total_revenue)}
                    </div>
                    <div className="t-xs t-num" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {fmtAgo(f.last_sync_at)}
                    </div>
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

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org, isLoading: orgLoading } = useDefaultOrganization(user?.userId);
  const { t } = useLanguage();
  const [location, navigate] = useLocation();

  const page: Page = (() => {
    if (location.startsWith(ROUTES.DASHBOARD_SESSIONS)) return "config";
    if (location.startsWith(ROUTES.DASHBOARD_STATIONS)) return "puestos";
    if (location.startsWith(ROUTES.DASHBOARD_PRODUCTS)) return "productos";
    if (location.startsWith(ROUTES.DASHBOARD_REPORTS))  return "reporte";
    if (location.startsWith(ROUTES.DASHBOARD_POS))      return "pos";
    return "dashboard";
  })();

  const { data: sessionsData } = useQuery({
    queryKey: ["sessions", org?.id],
    enabled: !!org,
    queryFn: () =>
      crossAppApi.get<{ data: Session[] }>(crossAppOrgPath(org!.id, "/sessions?is_active=true")),
  });
  const activeSession = sessionsData?.data?.[0];

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["dashboard", org?.id],
    enabled: !!user && !!org,
    refetchInterval: 30_000,
    retry: 3,
    queryFn: () =>
      crossAppApi.get<DashboardData>(crossAppOrgPath(org!.id, "/dashboard")),
  });

  if (orgLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "hsl(var(--background))" }}
      >
        <div className="t-body" style={{ color: "hsl(var(--muted-foreground))" }}>
          {t("common.loading")}
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 p-6"
        style={{ background: "hsl(var(--background))" }}
      >
        <div
          className="icon-pill icon-pill-lg"
          style={{
            width: 64,
            height: 64,
            background: "hsl(var(--warning) / 0.15)",
            color: "hsl(var(--warning))",
          }}
        >
          <Icon name="alertTri" size={28} />
        </div>
        <div className="t-h3">{t("dash.noOrgSelected")}</div>
        <Button
          variant="primary"
          onClick={() => (window.location.href = ROUTES.SELECT_ORG)}
        >
          {t("dash.selectOrg")}
        </Button>
      </div>
    );
  }

  const handleNav = (id: string) => {
    const paths: Record<string, string> = {
      dashboard: ROUTES.DASHBOARD,
      config:    ROUTES.DASHBOARD_SESSIONS,
      puestos:   ROUTES.DASHBOARD_STATIONS,
      productos: ROUTES.DASHBOARD_PRODUCTS,
      reporte:   ROUTES.DASHBOARD_REPORTS,
      pos:       ROUTES.DASHBOARD_POS,
    };
    navigate(paths[id] ?? ROUTES.DASHBOARD);
  };

  return (
    <DashboardShell
      active={page}
      onNav={handleNav}
      sessionName={activeSession?.name}
      sessionLocation={activeSession?.context}
    >
      {page === "dashboard" && (
        <DashboardPanel
          data={data ?? undefined}
          isLoading={isLoading}
          refetch={refetch}
          isRefetching={isRefetching}
        />
      )}
      {page === "config" && <SessionsPage />}
      {page === "puestos" && <PuestosPage />}
      {page === "productos" && <ProductsPage />}
      {page === "reporte" && <ReportePage />}
      {page === "pos" && <POSIntegratedPage />}
    </DashboardShell>
  );
}
