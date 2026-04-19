import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { api, orgPath } from "@/lib/api";
import { fmt, fmtCompact } from "@/lib/utils";
import { cn } from "@/lib/utils";
import SessionConfig from "./SessionConfig";
import ProductsPage from "./ProductsPage";
import AnalyticsPage from "./AnalyticsPage";

type Tab = "realtime" | "closings" | "history" | "products" | "analytics" | "session";

interface StandData {
  id: string;
  name: string;
  cashierName: string;
  context: string;
  totalRevenue: number;
  salesCount: number;
  cash: number;
  sinpe: number;
  card: number;
  lastSyncAt: number; // timestamp
}

interface DashboardData {
  stands: StandData[];
  totalRevenue: number;
  totalSales: number;
  avgTicket: number;
  productRanking: Array<{ name: string; emoji: string; units: number; revenue: number }>;
}

interface Closing {
  id: string;
  standName: string;
  cashierName: string;
  expectedCash: number;
  declaredCash: number;
  expectedSinpe: number;
  declaredSinpe: number;
  expectedCard: number;
  declaredCard: number;
  notes: string;
  status: "pending" | "approved" | "rejected";
}

function StandCard({ stand }: { stand: StandData }) {
  const now = Date.now();
  const diffMin = Math.floor((now - stand.lastSyncAt) / 60000);
  const status = diffMin > 15 ? "offline" : diffMin > 5 ? "slow" : "active";
  const statusMap = {
    active: { color: "text-success", label: "Activo" },
    slow: { color: "text-warning", label: "Señal débil" },
    offline: { color: "text-destructive", label: "Sin señal" },
  };
  const s = statusMap[status];

  return (
    <div className="bg-surface border border-surface-border rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary-dark/50" />

      <div className="flex justify-between items-start">
        <div>
          <div className="font-barlow font-extrabold text-xl text-foreground tracking-wide">
            {stand.name}
          </div>
          <div className="text-muted text-xs mt-0.5">
            {stand.salesCount} ventas · {stand.cashierName}
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-surface-high px-2.5 py-1.5 rounded-lg border border-surface-border">
          <span className={cn("text-[8px]", s.color)}>●</span>
          <span className={cn("text-xs font-barlow font-bold", s.color)}>{s.label}</span>
          {diffMin > 0 && (
            <span className="text-muted text-[10px] font-mono">·{diffMin}m</span>
          )}
        </div>
      </div>

      <div className="text-primary font-barlow font-extrabold text-3xl">
        {fmtCompact(stand.totalRevenue)}
      </div>

      <div className="flex gap-3 text-xs">
        {[
          { label: "Efectivo", val: stand.cash, color: "text-primary" },
          { label: "SINPE", val: stand.sinpe, color: "text-blue-400" },
          { label: "Tarjeta", val: stand.card, color: "text-green-400" },
        ].map(({ label, val, color }) => (
          <div key={label} className="flex-1 bg-surface-high rounded-lg p-2 text-center">
            <div className="text-muted mb-0.5">{label}</div>
            <div className={cn("font-barlow font-bold text-sm", color)}>
              {fmtCompact(val)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KPICard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-surface border border-surface-border rounded-xl p-5">
      <div className="text-muted text-xs tracking-widest font-barlow mb-1">{label}</div>
      <div className="text-primary font-barlow font-extrabold text-3xl">{value}</div>
      {sub && <div className="text-muted text-xs mt-1">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { user, org, logout } = useAuthContext();
  const [tab, setTab] = useState<Tab>("realtime");

  // Debug: Check if org is loaded
  if (!org) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-destructive font-barlow font-bold text-xl">
            No hay organización seleccionada
          </div>
          <div className="text-muted text-sm mt-2">
            Redirigiendo...
          </div>
        </div>
      </div>
    );
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard", org?.id],
    enabled: !!user && !!org,
    refetchInterval: 30_000,
    queryFn: () =>
      api.get<DashboardData>(orgPath(user!.userId, org!.id, "/dashboard")),
  });

  const { data: closings = [] } = useQuery({
    queryKey: ["closings", org?.id],
    enabled: !!user && !!org && tab === "closings",
    queryFn: () =>
      api.get<Closing[]>(orgPath(user!.userId, org!.id, "/closings?status=pending")),
  });

  const handleApproveClosing = async (closingId: string) => {
    await api.patch(orgPath(user!.userId, org!.id, `/closings/${closingId}`), {
      status: "approved",
    });
  };

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: "realtime", label: "📊 Tiempo Real" },
    { id: "closings", label: "🔒 Cierres" },
    { id: "history", label: "📁 Historial" },
    { id: "products", label: "🛒 Productos" },
    { id: "analytics", label: "📈 Reportería" },
    { id: "session", label: "⚙️ Sesión" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-surface border-b border-surface-border">
        <span className="font-barlow font-extrabold text-xl text-primary tracking-wide">
          🍗 POLLOS PORTEÑOS — GERENCIA
        </span>
        <div className="flex items-center gap-4">
          <span className="text-muted text-sm">{org?.name}</span>
          <button
            onClick={logout}
            className="text-muted text-sm hover:text-foreground transition-colors"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 py-3 bg-surface border-b border-surface-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2 rounded-lg font-barlow font-bold text-sm transition-colors",
              tab === t.id
                ? "bg-primary text-white"
                : "text-muted hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={() => refetch()}
          className="ml-auto px-3 py-2 bg-surface-high border border-surface-border rounded-lg text-muted text-sm hover:text-foreground transition-colors"
        >
          ↻ Actualizar
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center h-40">
            <div className="text-muted font-barlow animate-pulse">Cargando datos...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <div className="text-4xl mb-4">❌</div>
              <div className="text-destructive font-barlow font-bold text-lg">
                Error al cargar datos
              </div>
              <div className="text-muted text-sm mt-2">
                {error instanceof Error ? error.message : 'Error desconocido'}
              </div>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg font-barlow font-bold"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Real-time tab */}
        {tab === "realtime" && data && (
          <div className="flex flex-col gap-6">
            {/* Global KPIs */}
            <div className="grid grid-cols-3 gap-4">
              <KPICard
                label="INGRESOS TOTALES"
                value={fmtCompact(data.totalRevenue)}
              />
              <KPICard
                label="VENTAS TOTALES"
                value={String(data.totalSales)}
              />
              <KPICard
                label="TICKET PROMEDIO"
                value={fmt(data.avgTicket)}
              />
            </div>

            {/* Stand cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {data.stands.map((stand) => (
                <StandCard key={stand.id} stand={stand} />
              ))}
            </div>

            {/* Product ranking */}
            <div className="bg-surface border border-surface-border rounded-2xl p-6">
              <h2 className="font-barlow font-extrabold text-lg text-foreground mb-4 tracking-wide">
                🏆 RANKING DE PRODUCTOS
              </h2>
              <div className="flex flex-col gap-2">
                {data.productRanking.map((p, i) => {
                  const maxUnits = data.productRanking[0]?.units ?? 1;
                  return (
                    <div key={p.name} className="flex items-center gap-3">
                      <span className="text-muted font-mono text-xs w-5 text-right">
                        {i + 1}
                      </span>
                      <span className="text-xl">{p.emoji}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-barlow font-bold text-sm text-foreground">
                            {p.name}
                          </span>
                          <span className="text-muted text-xs">
                            {p.units} uds · {fmtCompact(p.revenue)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-surface-high rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(p.units / maxUnits) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Closings tab */}
        {tab === "closings" && (
          <div className="flex flex-col gap-4">
            {closings.length === 0 && (
              <div className="text-center text-muted font-barlow py-12">
                No hay cierres pendientes
              </div>
            )}
            {closings.map((c) => {
              const diffCash = c.declaredCash - c.expectedCash;
              const diffSinpe = c.declaredSinpe - c.expectedSinpe;
              const diffCard = c.declaredCard - c.expectedCard;
              const hasDiff = diffCash !== 0 || diffSinpe !== 0 || diffCard !== 0;

              return (
                <div
                  key={c.id}
                  className="bg-surface border border-surface-border rounded-2xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-barlow font-extrabold text-lg text-foreground">
                        {c.standName}
                      </div>
                      <div className="text-muted text-xs">{c.cashierName}</div>
                    </div>
                    {hasDiff && (
                      <span className="bg-warning/20 text-warning text-xs font-bold px-2 py-1 rounded">
                        ⚠ Diferencia
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "Efectivo", exp: c.expectedCash, decl: c.declaredCash, diff: diffCash },
                      { label: "SINPE", exp: c.expectedSinpe, decl: c.declaredSinpe, diff: diffSinpe },
                      { label: "Tarjeta", exp: c.expectedCard, decl: c.declaredCard, diff: diffCard },
                    ].map(({ label, exp, decl, diff }) => (
                      <div key={label} className="bg-surface-high rounded-xl p-3">
                        <div className="text-muted text-xs mb-2">{label}</div>
                        <div className="text-xs text-muted">Esperado: {fmt(exp)}</div>
                        <div className="text-xs text-foreground">Declarado: {fmt(decl)}</div>
                        <div
                          className={cn(
                            "text-xs font-bold mt-1",
                            diff === 0
                              ? "text-success"
                              : diff > 0
                              ? "text-blue-400"
                              : "text-destructive"
                          )}
                        >
                          {diff >= 0 ? "+" : ""}
                          {fmt(diff)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {c.notes && (
                    <div className="bg-warning/10 border border-warning/20 rounded-lg px-3 py-2 text-warning text-xs mb-4">
                      📝 {c.notes}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveClosing(c.id)}
                      className="flex-1 py-2.5 bg-success/20 border border-success/40 text-success font-barlow font-bold rounded-lg hover:bg-success/30 transition-colors"
                    >
                      ✓ Aprobar
                    </button>
                    <button
                      onClick={() =>
                        api.patch(
                          orgPath(user!.userId, org!.id, `/closings/${c.id}`),
                          { status: "rejected" }
                        )
                      }
                      className="flex-1 py-2.5 bg-destructive/20 border border-destructive/40 text-destructive font-barlow font-bold rounded-lg hover:bg-destructive/30 transition-colors"
                    >
                      ✗ Rechazar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* History tab */}
        {tab === "history" && (
          <div className="text-center text-muted font-barlow py-12">
            Historial de sesiones — próximamente
          </div>
        )}

        {/* Products tab */}
        {tab === "products" && <ProductsPage />}

        {/* Analytics tab */}
        {tab === "analytics" && <AnalyticsPage />}

        {/* Session config tab */}
        {tab === "session" && (
          <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden" style={{ minHeight: 500 }}>
            <SessionConfig onDone={() => setTab("realtime")} />
          </div>
        )}
      </div>
    </div>
  );
}
