import { Card, CardTitle, CardDescription, Badge } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";

const fmt = (n: number) => "₡" + Math.round(Number(n) || 0).toLocaleString("es-CR");

export interface StandStat {
  name: string;
  cashierName: string;
  sales: number;
  orders: number;
  diff: number;
}

interface StandBreakdownProps {
  stands: StandStat[];
  title?: string;
  subtitle?: string;
}

export function StandBreakdown({ stands, title, subtitle }: StandBreakdownProps) {
  const { t } = useLanguage();
  const maxStandSales = Math.max(...stands.map((s) => s.sales), 1);

  return (
    <Card style={{ padding: 22 }}>
      <CardTitle>{title ?? t("report.standPerformance")}</CardTitle>
      <CardDescription style={{ marginBottom: 14 }}>{subtitle ?? t("report.standPerformance")}</CardDescription>
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
            style={{ padding: "12px 0", borderBottom: i < stands.length - 1 ? "1px solid hsl(var(--border))" : "none" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {p.cashierName} · {p.orders} órdenes
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="t-num" style={{ fontSize: 14, fontWeight: 800, fontFamily: "var(--font-display)" }}>
                  {fmt(p.sales)}
                </div>
                <Badge
                  variant={p.diff === 0 ? "success" : Math.abs(p.diff) < 1000 ? "warning" : "destructive"}
                  style={{ marginTop: 2 }}
                >
                  {p.diff === 0 ? t("report.balanced") : (p.diff > 0 ? "+" : "−") + fmt(Math.abs(p.diff))}
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
  );
}
