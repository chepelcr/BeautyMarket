import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { crossAppApi, crossAppOrgPath } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { Icon, Card, CardTitle, CardDescription, Badge } from "@/components/ui";

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
            Panel gerente
          </div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{sessionName}</div>
        </div>
        <Badge variant="success" style={{ gap: 4 }}>
          <span className="status-dot status-dot-live" style={{ width: 5, height: 5 }} />
          Live
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
            Ventas del partido
          </div>
          <div className="t-stat-xl" style={{ fontSize: 42, color: "hsl(var(--primary))" }}>
            {fmt(totalSales)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <Badge variant="success">En vivo</Badge>
            <span className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
              {kpis.activeStands ?? 0} puestos activos
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
            { l: "Órdenes", v: String(kpis.totalOrders ?? 0), icon: "cart", c: "info" },
            {
              l: "Ticket",
              v: fmt(kpis.avgTicket ?? 0),
              icon: "dollar",
              c: "success",
            },
            {
              l: "Puestos",
              v: `${kpis.activeStands ?? 0}/${stands.length || 0}`,
              icon: "store",
              c: "primary",
            },
            {
              l: "Cajeros",
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
              { id: "resumen", l: "Resumen" },
              { id: "puestos", l: "Puestos" },
              { id: "top", l: "Top" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              className="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              style={{ flex: 1, textAlign: "center" }}
            >
              {t.l}
            </button>
          ))}
        </div>

        {/* Tab: Resumen — feed */}
        {tab === "resumen" && (
          <Card style={{ padding: 16 }}>
            <CardTitle>Últimas ventas</CardTitle>
            <CardDescription style={{ marginBottom: 12 }}>
              Feed en tiempo real
            </CardDescription>
            {feed.length === 0 && (
              <p className="t-sm" style={{ color: "hsl(var(--muted-foreground))", padding: "8px 0" }}>
                Sin ventas aún.
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
                    hace {timeAgo(f.secondsAgo)}
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
                Sin puestos activos.
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
                          {p.cashierName ?? "Sin cajero"}
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
                    {p.totalOrders} órdenes
                    {p.totalOrders > 0
                      ? ` · ticket ${fmt(Math.round(p.totalSales / p.totalOrders))}`
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
                Sin datos de productos.
              </p>
            )}
            {topProducts.map((t, i) => (
              <div
                key={t.id}
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
                  {t.emoji ?? "🍗"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{t.name}</div>
                  <div className="t-xs t-num" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {t.unitsSold} unidades
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
                  {fmt(t.revenue)}
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
