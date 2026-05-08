import { CardTitle, CardDescription } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ProductRankItem } from "@/types";

interface TopProductsPanelProps {
  ranking: ProductRankItem[];
  isLoading: boolean;
  fmt: (n: number) => string;
}

export function TopProductsPanel({ ranking, isLoading, fmt }: TopProductsPanelProps) {
  const { t } = useLanguage();

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <CardTitle>{t("dash.topProducts")}</CardTitle>
          <CardDescription>{t("dash.bestSellers")}</CardDescription>
        </div>
      </div>
      {isLoading ? (
        <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{t("dash.loading")}</div>
      ) : ranking.length === 0 ? (
        <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))", padding: "16px 0" }}>{t("dash.noSalesData")}</div>
      ) : (
        ranking.slice(0, 5).map((item, i) => (
          <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < Math.min(4, ranking.length - 1) ? "1px solid hsl(var(--border))" : "none" }}>
            <div style={{ width: 28, fontSize: 15, fontWeight: 800, fontFamily: "var(--font-display)", color: i === 0 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", flexShrink: 0, textAlign: "center" }}>#{i + 1}</div>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: "hsl(var(--muted))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{item.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{item.name}</div>
              <div className="t-xs t-num" style={{ color: "hsl(var(--muted-foreground))" }}>{t("dash.units", { n: String(item.units) })} · {fmt(item.revenue)}</div>
              <div className="progress progress-thin" style={{ marginTop: 5 }}>
                <div className="progress-bar" style={{ width: `${Math.min(100, (item.units / (ranking[0]?.units || 1)) * 100)}%` }} />
              </div>
            </div>
          </div>
        ))
      )}
    </>
  );
}
