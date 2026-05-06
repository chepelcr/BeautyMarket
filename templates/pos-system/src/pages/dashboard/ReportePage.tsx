import { useQuery } from "@tanstack/react-query";
import { crossAppApi, crossAppOrgPath } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { Icon, Card, CardTitle, CardDescription, Badge, Button } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";

const fmt = (n: number) => "₡" + Math.round(Number(n) || 0).toLocaleString("es-CR");
const fmtNum = (n: number) => Math.round(Number(n) || 0).toLocaleString("es-CR");

interface ReportData {
  session?: {
    name: string;
    date: string;
    location?: string;
    startTime?: string;
    endTime?: string;
  };
  totals?: {
    ventas: number;
    ordenes: number;
    ticket: number;
    diferenciaCaja: number;
    efectivo: number;
    tarjeta: number;
    sinpe: number;
  };
  stands?: Array<{
    name: string;
    cashierName: string;
    sales: number;
    orders: number;
    diff: number;
  }>;
  topProducts?: Array<{
    id: string | number;
    name: string;
    emoji?: string;
    category?: string;
    price: number;
    qty: number;
    revenue: number;
  }>;
}

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "hsl(var(--muted-foreground))",
  textAlign: "left",
  fontFamily: "var(--font-display)",
};
const tdStyle: React.CSSProperties = { padding: "14px 16px", fontSize: 13 };

interface ReportePageProps {
  sessionId?: string;
}

export default function ReportePage({ sessionId }: ReportePageProps = {}) {
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);
  const { t } = useLanguage();

  const { data, isLoading } = useQuery<ReportData>({
    queryKey: ["report", org?.id, sessionId],
    enabled: !!user && !!org,
    queryFn: () =>
      crossAppApi.get<ReportData>(
        crossAppOrgPath(org!.id, `/dashboard${sessionId ? `?session_id=${sessionId}` : ""}`)
      ),
  });

  const session = data?.session;
  const totals = data?.totals ?? {
    ventas: 0,
    ordenes: 0,
    ticket: 0,
    diferenciaCaja: 0,
    efectivo: 0,
    tarjeta: 0,
    sinpe: 0,
  };
  const stands = data?.stands ?? [];
  const topProducts = data?.topProducts ?? [];
  const maxStandSales = Math.max(...stands.map((s) => s.sales), 1);

  const handlePrint = () => window.print();

  if (isLoading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div className="t-body" style={{ color: "hsl(var(--muted-foreground))" }}>
          {t("report.loading")}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: sessionId ? "24px" : "24px 24px 40px", maxWidth: sessionId ? "none" : 1400, margin: "0 auto" }}>
      {/* Header — hide in inline/drawer mode */}
      {!sessionId && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <Badge variant="primary-soft" style={{ marginBottom: 8 }}>
              {t("report.finalReport")}
            </Badge>
            <h1 className="t-h1" style={{ marginBottom: 6 }}>
              {session?.name ?? "Sesión sin nombre"}
            </h1>
            <p className="t-body" style={{ color: "hsl(var(--muted-foreground))" }}>
              {session?.date ? new Date(session.date).toLocaleDateString("es-CR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Fecha no disponible"}
              {session?.location ? ` · ${session.location}` : ""}
              {session?.startTime ? ` · ${session.startTime}` : ""}
              {session?.endTime ? ` → ${session.endTime}` : ""}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" icon="print" onClick={handlePrint}>
              {t("report.print")}
            </Button>
            <Button variant="primary" icon="download">
              {t("report.downloadPdf")}
            </Button>
            <Button variant="outline" icon="store" onClick={() => (window.location.href = "/pos")}>
              {t("dash.goToPOS")}
            </Button>
          </div>
        </div>
      )}

      {/* Hero KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {/* Main KPI */}
        <Card
          style={{
            padding: 22,
            background:
              "linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.02))",
            borderColor: "hsl(var(--primary) / 0.3)",
          }}
        >
          <div className="t-label" style={{ color: "hsl(var(--primary))", marginBottom: 6 }}>
            {t("report.grossIncome")}
          </div>
          <div
            className="t-stat-xl"
            style={{ fontSize: 40, color: "hsl(var(--primary))" }}
          >
            {fmt(totals.ventas)}
          </div>
          <Badge variant="success" style={{ marginTop: 8 }}>
            {stands.length} puestos activos
          </Badge>
        </Card>

        {[
          {
            l: t("report.orders"),
            v: fmtNum(totals.ordenes),
            i: "cart",
            c: "info",
            s: t("analytics.salesCount", { n: String(totals.ordenes) }),
          },
          {
            l: t("report.avgTicket"),
            v: fmt(totals.ticket),
            i: "dollar",
            c: "success",
            s: t("report.avgTicket"),
          },
          {
            l: t("report.cashDiff"),
            v:
              totals.diferenciaCaja === 0
                ? t("report.balanced")
                : (totals.diferenciaCaja > 0 ? "+" : "") + fmt(totals.diferenciaCaja),
            i: "alert",
            c: totals.diferenciaCaja === 0 ? "success" : Math.abs(totals.diferenciaCaja) < 1000 ? "warning" : "destructive",
            s: totals.diferenciaCaja === 0 ? t("report.allStandsBalanced") : t("report.standsWithDiff"),
          },
        ].map((k) => (
          <Card key={k.l} style={{ padding: 18 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div className="t-label">{k.l}</div>
              <div
                className={`icon-pill ${k.c === "primary" ? "" : `icon-pill-${k.c}`}`}
                style={{ width: 32, height: 32 }}
              >
                <Icon name={k.i} size={14} />
              </div>
            </div>
            <div className="t-stat-xl" style={{ fontSize: 28, marginBottom: 4 }}>
              {k.v}
            </div>
            <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
              {k.s}
            </div>
          </Card>
        ))}
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}
      >
        {/* Payment methods */}
        <Card style={{ padding: 22 }}>
          <CardTitle>{t("report.paymentMethods")}</CardTitle>
          <CardDescription style={{ marginBottom: 16 }}>{t("report.distribution")}</CardDescription>
          {(
            [
              { l: t("report.cash"), v: totals.efectivo, c: "success", i: "cash" },
              { l: t("report.card"), v: totals.tarjeta, c: "info", i: "card" },
              { l: t("report.sinpeMobile"), v: totals.sinpe, c: "primary", i: "smartphone" },
            ] as const
          ).map((m) => {
            const pct = totals.ventas > 0 ? (m.v / totals.ventas) * 100 : 0;
            return (
              <div key={m.l} style={{ marginBottom: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
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
                    <div
                      className="t-num"
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {fmt(m.v)}
                    </div>
                    <div
                      className="t-xs t-num"
                      style={{ color: "hsl(var(--muted-foreground))" }}
                    >
                      {pct.toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="progress" style={{ height: 8 }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${pct}%`,
                      background: `hsl(var(--${m.c}))`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </Card>

        {/* Puestos performance */}
        <Card style={{ padding: 22 }}>
          <CardTitle>{t("report.standPerformance")}</CardTitle>
          <CardDescription style={{ marginBottom: 14 }}>{t("report.standPerformance")}</CardDescription>
          {stands.length === 0 && (
            <p className="t-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              {t("report.noStandData")}
            </p>
          )}
          {stands.map((p, i) => {
            const pct = (p.sales / maxStandSales) * 100;
            return (
              <div
                key={p.name}
                style={{
                  padding: "12px 0",
                  borderBottom:
                    i < stands.length - 1 ? "1px solid hsl(var(--border))" : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                    <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {p.cashierName} · {p.orders} órdenes
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      className="t-num"
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {fmt(p.sales)}
                    </div>
                    <Badge
                      variant={
                        p.diff === 0
                          ? "success"
                          : Math.abs(p.diff) < 1000
                          ? "warning"
                          : "destructive"
                      }
                      style={{ marginTop: 2 }}
                    >
                      {p.diff === 0
                        ? t("report.balanced")
                        : (p.diff > 0 ? "+" : "−") + fmt(Math.abs(p.diff))}
                    </Badge>
                  </div>
                </div>
                <div className="progress progress-thin">
                  <div className="progress-bar" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Top products table */}
      <Card style={{ padding: 0 }}>
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid hsl(var(--border))",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <CardTitle>{t("report.productsTable")}</CardTitle>
            <CardDescription>{t("report.productsTable")}</CardDescription>
          </div>
          <Button variant="outline" size="sm" icon="download">
            {t("report.csv")}
          </Button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "hsl(var(--muted) / 0.4)" }}>
                <th style={{ ...thStyle, width: 50 }}>#</th>
                <th style={thStyle}>{t("analytics.colProduct")}</th>
                <th style={{ ...thStyle, textAlign: "right" }}>{t("report.units")}</th>
                <th style={{ ...thStyle, textAlign: "right" }}>{t("products.price")}</th>
                <th style={{ ...thStyle, textAlign: "right" }}>{t("report.revenue")}</th>
                <th style={{ ...thStyle, textAlign: "right" }}>%</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      ...tdStyle,
                      textAlign: "center",
                      color: "hsl(var(--muted-foreground))",
                      padding: 32,
                    }}
                  >
                    {t("report.noProductData")}
                  </td>
                </tr>
              )}
              {topProducts.map((prod, i) => {
                const pct =
                  totals.ventas > 0 ? (prod.revenue / totals.ventas) * 100 : 0;
                return (
                  <tr
                    key={prod.id}
                    style={{
                      borderBottom:
                        i < topProducts.length - 1
                          ? "1px solid hsl(var(--border))"
                          : "none",
                    }}
                  >
                    <td
                      style={{
                        ...tdStyle,
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        color:
                          i < 3
                            ? "hsl(var(--primary))"
                            : "hsl(var(--muted-foreground))",
                      }}
                    >
                      #{i + 1}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 6,
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
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{prod.name}</div>
                          {prod.category && (
                            <div
                              className="t-xs"
                              style={{ color: "hsl(var(--muted-foreground))" }}
                            >
                              {prod.category}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td
                      style={{ ...tdStyle, textAlign: "right", fontWeight: 700, fontFamily: "var(--font-display)" }}
                      className="t-num"
                    >
                      {prod.qty}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }} className="t-num">
                      {fmt(prod.price)}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "right",
                        fontWeight: 700,
                        fontFamily: "var(--font-display)",
                        color: "hsl(var(--primary))",
                      }}
                      className="t-num"
                    >
                      {fmt(prod.revenue)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          justifyContent: "flex-end",
                        }}
                      >
                        <div
                          style={{
                            width: 60,
                            height: 4,
                            borderRadius: 999,
                            background: "hsl(var(--muted))",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: "100%",
                              background: "hsl(var(--primary))",
                            }}
                          />
                        </div>
                        <span
                          className="t-num t-xs"
                          style={{ fontWeight: 700, minWidth: 38 }}
                        >
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {topProducts.length > 0 && (
              <tfoot>
                <tr style={{ background: "hsl(var(--muted) / 0.6)" }}>
                  <td style={tdStyle} />
                  <td style={{ ...tdStyle, fontWeight: 800 }}>{t("report.total")}</td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "right",
                      fontWeight: 800,
                      fontFamily: "var(--font-display)",
                    }}
                    className="t-num"
                  >
                    {topProducts.reduce((s, t) => s + t.qty, 0)}
                  </td>
                  <td style={tdStyle} />
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "right",
                      fontWeight: 800,
                      fontFamily: "var(--font-display)",
                      color: "hsl(var(--primary))",
                    }}
                    className="t-num"
                  >
                    {fmt(topProducts.reduce((s, t) => s + t.revenue, 0))}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 800 }}>100%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>
    </div>
  );
}
