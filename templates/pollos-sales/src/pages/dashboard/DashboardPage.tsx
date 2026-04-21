import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { api, orgPath, crossAppApi, crossAppOrgPath } from "@/lib/api";
import { fmt, fmtCompact } from "@/lib/utils";
import { cn } from "@/lib/utils";
import SessionConfig from "./SessionConfig";
import AssignmentsPage from "./AssignmentsPage";
import ProductsPage from "./ProductsPage";
import AnalyticsPage from "./AnalyticsPage";
import ErrorDisplay from "@/components/ErrorDisplay";
import { StandCardSkeleton, KPICardSkeleton, ProductRankingSkeleton, ClosingCardSkeleton } from "@/components/SkeletonLoader";

type Tab = "realtime" | "closings" | "assignments" | "history" | "products" | "analytics" | "session";

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
  last_sync_at: number; // timestamp
}

interface DashboardData {
  stands: StandData[];
  total_revenue: number;
  total_sales: number;
  avg_ticket: number;
  product_ranking: Array<{ name: string; emoji: string; units: number; revenue: number }>;
}

interface Closing {
  closing_id: string;
  cashier_id: string;
  branch_id: string;
  session_id: string;
  assignment_id: string;
  expected_cash: number;
  expected_sinpe: number;
  expected_card: number;
  expected_total: number;
  declared_cash: number;
  declared_sinpe: number;
  declared_card: number;
  declared_total: number;
  cash_difference: number;
  sinpe_difference: number;
  card_difference: number;
  total_difference: number;
  notes: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

interface Session {
  session_id: string;
  name: string;
  type: "match" | "shift";
  context: string;
  start_time: string;
  is_active: boolean;
  branch_id: string | null;
}

function StandCard({ stand }: { stand: StandData }) {
  const now = Date.now();
  const diffMin = Math.floor((now - stand.last_sync_at) / 60000);
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
            {stand.sales_count} ventas · {stand.cashier_name}
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
        {fmtCompact(stand.total_revenue)}
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
  console.log('[DashboardPage] ===== COMPONENT MOUNTING =====');
  
  const { user, logout } = useAuthContext();
  console.log('[DashboardPage] User from context:', user);
  
  const { useDefaultOrganization } = useOrganization();
  const { data: org, isLoading: orgLoading } = useDefaultOrganization(user?.userId);
  console.log('[DashboardPage] Org query result:', { org, orgLoading });
  
  const [tab, setTab] = useState<Tab>("realtime");
  const [sessionView, setSessionView] = useState<"list" | "create">("list");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const qcDashboard = useQueryClient();

  // ALL HOOKS MUST BE AT THE TOP - React Rules of Hooks
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["dashboard", org?.id],
    enabled: !!user && !!org,
    refetchInterval: 30_000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    queryFn: async () => {
      console.log('[Dashboard] Fetching dashboard data for org:', org!.id);
      const result = await api.get<DashboardData>(crossAppOrgPath(org!.id, "/dashboard"));
      console.log('[Dashboard] Data received:', result);
      return result;
    },
  });

  const { data: closings = [], isLoading: closingsLoading, error: closingsError, refetch: refetchClosings } = useQuery({
    queryKey: ["closings", org?.id],
    enabled: !!user && !!org && tab === "closings",
    retry: 2,
    retryDelay: 1000,
    queryFn: () =>
      api.get<Closing[]>(crossAppOrgPath(org!.id, "/closings?status=pending")),
  });

  const { data: sessions = [], isLoading: sessionsLoading, refetch: refetchSessions } = useQuery({
    queryKey: ["sessions", org?.id],
    enabled: !!user && !!org && tab === "session",
    queryFn: () =>
      api.get<Session[]>(crossAppOrgPath(org!.id, "/sessions?is_active=true")),
  });

  const deactivateSession = useMutation({
    mutationFn: (sessionId: string) =>
      api.patch(crossAppOrgPath(org!.id, `/sessions/${sessionId}`), { is_active: false }),
    onSuccess: () => {
      qcDashboard.invalidateQueries({ queryKey: ["sessions", org?.id] });
      refetchSessions();
    },
  });

  // Debug logging
  console.log('[DashboardPage] Full state:', { 
    hasUser: !!user, 
    userId: user?.userId,
    org, 
    orgLoading, 
    queryEnabled: !!user && !!org,
    dashboardData: data,
    dashboardLoading: isLoading,
    dashboardError: error
  });

  // Loading state
  if (orgLoading) {
    console.log('[DashboardPage] Rendering loading state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted font-barlow text-lg animate-pulse">Cargando organización...</div>
      </div>
    );
  }

  // No org selected
  if (!org) {
    console.warn('[DashboardPage] No organization found - rendering error state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-destructive font-barlow font-bold text-xl">
            No hay organización seleccionada
          </div>
          <div className="text-muted text-sm mt-2">
            Por favor selecciona una organización
          </div>
          <button
            onClick={() => window.location.href = '/organizations/select'}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg font-barlow font-bold"
          >
            Seleccionar Organización
          </button>
        </div>
      </div>
    );
  }

  console.log('[DashboardPage] Organization loaded:', org.id, 'Dashboard query should be running...');
  console.log('[DashboardPage] About to render main dashboard UI');

  const handleApproveClosing = async (closingId: string) => {
    try {
      await api.patch(crossAppOrgPath(org!.id, `/closings/${closingId}`), {
        status: "approved",
      });
      refetchClosings();
    } catch (error) {
      console.error('[DashboardPage] Error approving closing:', error);
      alert('Error al aprobar el cierre. Por favor intenta nuevamente.');
    }
  };

  const handleRejectClosing = async (closingId: string, notes: string) => {
    try {
      await api.patch(crossAppOrgPath(org!.id, `/closings/${closingId}`), {
        status: "rejected",
        notes: notes || undefined,
      });
      setRejectingId(null);
      setRejectNotes("");
      refetchClosings();
    } catch (error) {
      console.error('[DashboardPage] Error rejecting closing:', error);
      alert('Error al rechazar el cierre. Por favor intenta nuevamente.');
    }
  };

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: "realtime", label: "📊 Tiempo Real" },
    { id: "closings", label: "🔒 Cierres" },
    { id: "assignments", label: "👤 Asignaciones" },
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
          <span className="text-muted text-sm">{org.name}</span>
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
          disabled={isRefetching}
          className={cn(
            "ml-auto px-3 py-2 bg-surface-high border border-surface-border rounded-lg text-sm transition-colors",
            isRefetching 
              ? "text-primary animate-pulse cursor-not-allowed" 
              : "text-muted hover:text-foreground hover:border-primary/50"
          )}
        >
          <span className={cn(isRefetching && "inline-block animate-spin")}>
            {isRefetching ? "⟳" : "↻"}
          </span>
          {" "}
          {isRefetching ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Real-time tab */}
        {tab === "realtime" && (
          <>
            {error && (
              <ErrorDisplay 
                error={error} 
                onRetry={() => refetch()} 
                className="h-40"
              />
            )}

            {!error && (
              <div className="flex flex-col gap-6">
                {/* Global KPIs */}
                <div className="grid grid-cols-3 gap-4">
                  {isLoading ? (
                    <>
                      <KPICardSkeleton />
                      <KPICardSkeleton />
                      <KPICardSkeleton />
                    </>
                  ) : data ? (
                    <>
                      <KPICard
                        label="INGRESOS TOTALES"
                        value={fmtCompact(data.total_revenue)}
                      />
                      <KPICard
                        label="VENTAS TOTALES"
                        value={String(data.total_sales)}
                      />
                      <KPICard
                        label="TICKET PROMEDIO"
                        value={fmt(data.avg_ticket)}
                      />
                    </>
                  ) : null}
                </div>

                {/* Stand cards */}
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <StandCardSkeleton />
                    <StandCardSkeleton />
                    <StandCardSkeleton />
                  </div>
                ) : data && data.stands.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {data.stands.map((stand) => (
                      <StandCard key={stand.id} stand={stand} />
                    ))}
                  </div>
                ) : !isLoading && data && data.stands.length === 0 ? (
                  <div className="text-center text-muted font-barlow py-12">
                    No hay puestos activos en este momento
                  </div>
                ) : null}

                {/* Product ranking */}
                {isLoading ? (
                  <ProductRankingSkeleton />
                ) : data && data.product_ranking.length > 0 ? (
                  <div className="bg-surface border border-surface-border rounded-2xl p-6">
                    <h2 className="font-barlow font-extrabold text-lg text-foreground mb-4 tracking-wide">
                      🏆 RANKING DE PRODUCTOS
                    </h2>
                    <div className="flex flex-col gap-2">
                      {data.product_ranking.map((p, i) => {
                        const maxUnits = data.product_ranking[0]?.units ?? 1;
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
                ) : null}
              </div>
            )}
          </>
        )}

        {/* Closings tab */}
        {tab === "closings" && (
          <div className="flex flex-col gap-4">
            {closingsError && (
              <ErrorDisplay 
                error={closingsError} 
                onRetry={() => refetchClosings()} 
                className="h-40"
              />
            )}
            {closingsLoading && (
              <>
                <ClosingCardSkeleton />
                <ClosingCardSkeleton />
              </>
            )}
            {!closingsLoading && !closingsError && closings.length === 0 && (
              <div className="text-center text-muted font-barlow py-12">
                No hay cierres pendientes
              </div>
            )}
            {!closingsLoading && !closingsError && closings.map((c) => {
              const hasDiff = c.total_difference !== 0;
              const isRejecting = rejectingId === c.closing_id;

              return (
                <div
                  key={c.closing_id}
                  className="bg-surface border border-surface-border rounded-2xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-barlow font-extrabold text-lg text-foreground">
                        Cierre #{c.closing_id.slice(0, 8)}
                      </div>
                      <div className="text-muted text-xs">Cajero: {c.cashier_id}</div>
                    </div>
                    {hasDiff && (
                      <span className="bg-warning/20 text-warning text-xs font-bold px-2 py-1 rounded">
                        ⚠ Diferencia
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "Efectivo", exp: c.expected_cash, decl: c.declared_cash, diff: c.cash_difference },
                      { label: "SINPE", exp: c.expected_sinpe, decl: c.declared_sinpe, diff: c.sinpe_difference },
                      { label: "Tarjeta", exp: c.expected_card, decl: c.declared_card, diff: c.card_difference },
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

                  {/* Total row */}
                  <div className="flex justify-between items-center bg-surface-high rounded-xl px-4 py-2 mb-4 text-sm">
                    <span className="text-muted font-barlow">Total declarado</span>
                    <span className="font-barlow font-extrabold text-foreground">{fmt(c.declared_total)}</span>
                    <span className={cn("font-barlow font-bold text-xs",
                      c.total_difference === 0 ? "text-success" : c.total_difference > 0 ? "text-blue-400" : "text-destructive"
                    )}>
                      {c.total_difference >= 0 ? "+" : ""}{fmt(c.total_difference)}
                    </span>
                  </div>

                  {c.notes && (
                    <div className="bg-warning/10 border border-warning/20 rounded-lg px-3 py-2 text-warning text-xs mb-4">
                      📝 {c.notes}
                    </div>
                  )}

                  {/* Rejection notes input */}
                  {isRejecting && (
                    <div className="mb-4 flex flex-col gap-2">
                      <label className="text-xs text-warning tracking-widest font-barlow">MOTIVO DE RECHAZO (opcional)</label>
                      <textarea
                        value={rejectNotes}
                        onChange={(e) => setRejectNotes(e.target.value)}
                        placeholder="Explicá el motivo..."
                        rows={2}
                        className="px-3 py-2 bg-surface-high border border-warning/40 rounded-lg text-foreground font-barlow text-sm outline-none focus:border-warning resize-none"
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    {!isRejecting ? (
                      <>
                        <button
                          onClick={() => handleApproveClosing(c.closing_id)}
                          className="flex-1 py-2.5 bg-success/20 border border-success/40 text-success font-barlow font-bold rounded-lg hover:bg-success/30 transition-colors"
                        >
                          ✓ Aprobar
                        </button>
                        <button
                          onClick={() => { setRejectingId(c.closing_id); setRejectNotes(""); }}
                          className="flex-1 py-2.5 bg-destructive/20 border border-destructive/40 text-destructive font-barlow font-bold rounded-lg hover:bg-destructive/30 transition-colors"
                        >
                          ✗ Rechazar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setRejectingId(null)}
                          className="flex-1 py-2.5 bg-surface-high border border-surface-border text-muted font-barlow font-bold rounded-lg"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleRejectClosing(c.closing_id, rejectNotes)}
                          className="flex-1 py-2.5 bg-destructive/20 border border-destructive/40 text-destructive font-barlow font-bold rounded-lg hover:bg-destructive/30 transition-colors"
                        >
                          ✗ Confirmar rechazo
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Assignments tab */}
        {tab === "assignments" && <AssignmentsPage />}

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

        {/* Session tab */}
        {tab === "session" && (
          <div className="flex flex-col gap-4">
            {/* Toggle bar */}
            <div className="flex gap-2">
              <button
                onClick={() => setSessionView("list")}
                className={cn(
                  "px-4 py-2 rounded-lg font-barlow font-bold text-sm transition-colors",
                  sessionView === "list" ? "bg-primary text-white" : "bg-surface-high text-muted border border-surface-border"
                )}
              >
                📋 Sesiones activas
              </button>
              <button
                onClick={() => setSessionView("create")}
                className={cn(
                  "px-4 py-2 rounded-lg font-barlow font-bold text-sm transition-colors",
                  sessionView === "create" ? "bg-primary text-white" : "bg-surface-high text-muted border border-surface-border"
                )}
              >
                ＋ Nueva sesión
              </button>
            </div>

            {/* Session list */}
            {sessionView === "list" && (
              <div className="flex flex-col gap-3">
                {sessionsLoading && (
                  <div className="text-center text-muted font-barlow py-8 animate-pulse">Cargando sesiones...</div>
                )}
                {!sessionsLoading && sessions.length === 0 && (
                  <div className="text-center text-muted font-barlow py-12">
                    No hay sesiones activas. Crea una nueva.
                  </div>
                )}
                {sessions.map((s) => (
                  <div key={s.session_id} className="bg-surface border border-surface-border rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="font-barlow font-bold text-foreground">{s.name}</div>
                      <div className="text-muted text-xs mt-0.5">
                        {s.type === "match" ? "⚽ Partido" : "🍽 Turno"} · {s.context} · {new Date(s.start_time).toLocaleString("es-CR")}
                      </div>
                    </div>
                    <button
                      onClick={() => deactivateSession.mutate(s.session_id)}
                      disabled={deactivateSession.isPending}
                      className="ml-4 px-3 py-1.5 bg-destructive/20 border border-destructive/30 text-destructive font-barlow font-bold text-xs rounded-lg hover:bg-destructive/30 transition-colors disabled:opacity-50"
                    >
                      🔒 Cerrar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Session creation form */}
            {sessionView === "create" && (
              <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden" style={{ minHeight: 500 }}>
                <SessionConfig onDone={() => { setSessionView("list"); }} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
