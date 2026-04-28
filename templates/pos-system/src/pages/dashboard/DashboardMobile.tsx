import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { crossAppApi, crossAppOrgPath } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { Icon, Card, CardTitle, CardDescription, Badge } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";

const fmt = (n: number) => "₡" + Math.round(Number(n) || 0).toLocaleString("es-CR");
const timeAgo = (s: number) => s < 60 ? `${s}s` : `${Math.floor(s / 60)}m`;

type MobileTab = "resumen" | "puestos" | "top";

interface DashboardData {
  kpis?: {
    totalSales?: number;
    totalOrders?: number;
    avgTicket?: number;
    activeStands?: number;
    activeCashiers?: number;
  };
  stands?: Array<{
    branch_id: string;
    name: string;
    cashierName?: string;
    totalSales: number;
    totalOrders: number;
    status?: string;
  }>;
  topProducts?: Array<{
    id: string | number;
    name: string;
    emoji?: string;
    unitsSold: number;
    revenue: number;
  }>;
  feed?: Array<{
    id: string | number;
    branchName: string;
    items: string;
    total: number;
    paymentMethod: string;
    secondsAgo: number;
  }>;
  sessionName?: string;
}

export default function DashboardMobile({ onBack }: { onBack?: () => void }) {
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);
  const { t } = useLanguage();

  const [tab, setTab] = useState<MobileTab>("resumen");

  const { data } = useQuery<DashboardData>({
    queryKey: ["dashboard-mobile", org?.id],
    enabled: !!user && !!org,
    refetchInterval: 30_000,
    queryFn: () =>
      crossAppApi.get<DashboardData>(crossAppOrgPath(org!.id, "/dashboard")),
  });

  const kpis = data?.kpis ?? {};
  const stands = data?.stands ?? [];
  const topProducts = data?.topProducts ?? [];
  const feed = data?.feed ?? [];
  const sessionName = data?.sessionName ?? "Sesión activa";
  const totalSales = kpis.totalSales ?? 0;

  return (
    <div
      style={{
        maxWidth: 440,
        margin: "0 auto",
        minHeight: "100vh",
        background: "hsl(var(--background))",
      }}
    >
      {/* Nav bar */}
      <header
        className="nav-bar"
        style={{
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {onBack && (
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onBack}>
            <Icon name="arrowLeft" size={18} />
          </button>
        )}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div className="t-label" style={{ fontSize: 10 }}>
            {t("mobile.panel")}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{sessionName}</div>
        </div>
        <Badge variant="success" style={{ gap: 4 }}>
          <span className="status-dot status-dot-live" style={{ width: 5, height: 5 }} />
          {t("mobile.live")}
        </Badge>
      </header>

      <div style={{ padding: "14px 16px 100px" }}>
        {/* Hero stat */}
        <Card
          style={{
            padding: 18,
            marginBottom: 14,
            background:
              "linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.02))",
            borderColor: "hsl(var(--primary) / 0.3)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="t-label" style={{ color: "hsl(var(--primary))", marginBottom: 6 }}>
            {t("mobile.sessionSales")}
          </div>
          <div className="t-stat-xl" style={{ fontSize: 42, color: "hsl(var(--primary))" }}>
            {fmt(totalSales)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <Badge variant="success">{t("mobile.live")}</Badge>
            <span className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
              {t("mobile.stationOrders", { n: String(kpis.activeStands ?? 0) })}
            </span>
          </div>
        </Card>

        {/* Mini KPIs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 14,
          }}
        >
          {[
            { l: t("mobile.orders"), v: String(kpis.totalOrders ?? 0), icon: "cart", c: "info" },
            {
              l: t("mobile.ticket"),
              v: fmt(kpis.avgTicket ?? 0),
              icon: "dollar",
              c: "success",
            },
            {
              l: t("mobile.stations"),
              v: `${kpis.activeStands ?? 0}/${stands.length || 0}`,
              icon: "store",
              c: "primary",
            },
            {
              l: t("mobile.cashiers"),
              v: String(kpis.activeCashiers ?? stands.length ?? 0),
              icon: "users",
              c: "warning",
            },
          ].map((k) => (
            <Card key={k.l} style={{ padding: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <div className="t-label">{k.l}</div>
                <div
                  className={`icon-pill ${k.c === "primary" ? "" : `icon-pill-${k.c}`}`}
                  style={{ width: 26, height: 26 }}
                >
                  <Icon name={k.icon} size={12} />
                </div>
              </div>
              <div className="t-stat" style={{ fontSize: 22 }}>
                {k.v}
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ width: "100%", marginBottom: 14 }}>
          {(
            [
              { id: "resumen", l: t("mobile.summary") },
              { id: "puestos", l: t("mobile.stationsTab") },
              { id: "top", l: t("mobile.topTab") },
            ] as const
          ).map((tabItem) => (
            <button
              key={tabItem.id}
              className="tab"
              aria-selected={tab === tabItem.id}
              onClick={() => setTab(tabItem.id)}
              style={{ flex: 1, textAlign: "center" }}
            >
              {tabItem.l}
            </button>
          ))}
        </div>

        {/* Tab: Resumen — feed */}
        {tab === "resumen" && (
          <Card style={{ padding: 16 }}>
            <CardTitle>{t("mobile.lastSales")}</CardTitle>
            <CardDescription style={{ marginBottom: 12 }}>
              {t("mobile.liveFeed")}
            </CardDescription>
            {feed.length === 0 && (
              <p className="t-sm" style={{ color: "hsl(var(--muted-foreground))", padding: "8px 0" }}>
                {t("mobile.noSales")}
              </p>
            )}
            {feed.slice(0, 10).map((f, i) => (
              <div
                key={f.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 0",
                  borderBottom:
                    i < Math.min(feed.length, 10) - 1
                      ? "1px solid hsl(var(--border))"
                      : "none",
                }}
              >
                <div
                  className={`icon-pill ${
                    f.paymentMethod === "cash"
                      ? "icon-pill-success"
                      : f.paymentMethod === "card"
                      ? "icon-pill-info"
                      : ""
                  }`}
                  style={{ width: 30, height: 30, flexShrink: 0 }}
                >
                  <Icon
                    name={
                      f.paymentMethod === "cash"
                        ? "cash"
                        : f.paymentMethod === "card"
                        ? "card"
                        : "smartphone"
                    }
                    size={13}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{f.branchName}</div>
                  <div
                    className="t-xs"
                    style={{
                      color: "hsl(var(--muted-foreground))",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {f.items}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div
                    className="t-num"
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {fmt(f.total)}
                  </div>
                  <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {t("mobile.timeAgo", { time: timeAgo(f.secondsAgo) })}
                  </div>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Tab: Puestos */}
        {tab === "puestos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {stands.length === 0 && (
              <p className="t-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                {t("mobile.noActiveStations")}
              </p>
            )}
            {stands.map((p) => {
              const max = Math.max(...stands.map((s) => s.totalSales), 1);
              const pct = (p.totalSales / max) * 100;
              return (
                <Card key={p.branch_id} style={{ padding: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        className={`status-dot status-dot-${
                          p.status === "online" ? "success" : "warning"
                        }`}
                      />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                        <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                          {p.cashierName ?? t("mobile.noCashier")}
                        </div>
                      </div>
                    </div>
                    <div
                      className="t-num"
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {fmt(p.totalSales)}
                    </div>
                  </div>
                  <div className="progress progress-thin">
                    <div className="progress-bar" style={{ width: `${pct}%` }} />
                  </div>
                  <div
                    className="t-xs t-num"
                    style={{ marginTop: 6, color: "hsl(var(--muted-foreground))" }}
                  >
                    {t("mobile.stationOrders", { n: String(p.totalOrders) })}
                    {p.totalOrders > 0
                      ? ` · ${t("mobile.ticket")} ${fmt(Math.round(p.totalSales / p.totalOrders))}`
                      : ""}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Tab: Top productos */}
        {tab === "top" && (
          <Card style={{ padding: 14 }}>
            {topProducts.length === 0 && (
              <p className="t-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                {t("mobile.noProductData")}
              </p>
            )}
            {topProducts.map((prod, i) => (
              <div
                key={prod.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 0",
                  borderBottom:
                    i < topProducts.length - 1 ? "1px solid hsl(var(--border))" : "none",
                }}
              >
                <div
                  className="t-stat"
                  style={{
                    fontSize: 18,
                    width: 24,
                    color: "hsl(var(--muted-foreground))",
                    flexShrink: 0,
                  }}
                >
                  #{i + 1}
                </div>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "hsl(var(--muted))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {prod.emoji ?? "🍗"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{prod.name}</div>
                  <div className="t-xs t-num" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {prod.unitsSold} {t("dash.units")}
                  </div>
                </div>
                <div
                  className="t-num"
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "hsl(var(--primary))",
                    flexShrink: 0,
                  }}
                >
                  {fmt(prod.revenue)}
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
