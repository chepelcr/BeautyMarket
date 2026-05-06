import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { crossAppApi, crossAppOrgPath } from "@/lib/api";
import { Icon, Card, Badge, Button, Drawer } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import SessionConfig from "./SessionConfig";
import ReportePage from "./ReportePage";

type SessionFilter = "all" | "active" | "closed";
type DrawerTab = "overview" | "assignments" | "sales" | "report";

interface Session {
  session_id: string;
  name: string;
  type: string;
  context: string;
  start_time: string;
  end_time?: string;
  status: number; // 1=Active, 2=Inactive, 3=Deleted
  branch_id?: string;
  expected_revenue?: number;
  actual_revenue?: number;
  created_at: string;
}

interface AssignmentUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface Assignment {
  assignment_id: string;
  user_id: string;
  branch_id: string;
  terminal_id?: string;
  role: string;
  start_time: string;
  end_time?: string;
  status: number;
  user?: AssignmentUser;
}

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
}

interface DashboardData {
  stands: StandData[];
  total_revenue: number;
  total_sales: number;
  avg_ticket: number;
  product_ranking: Array<{ name: string; emoji: string; units: number; revenue: number }>;
}

export default function SessionsPage() {
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const searchParams = useSearch();

  const [configOpen, setConfigOpen] = useState(false);
  const [editSession, setEditSession] = useState<Session | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("overview");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Get filter from search params
  const filter = (new URLSearchParams(searchParams).get("filter") as SessionFilter) || "all";

  const setFilter = (f: SessionFilter) => {
    const params = new URLSearchParams(searchParams);
    if (f === "all") {
      params.delete("filter");
    } else {
      params.set("filter", f);
    }
    setLocation(`?${params.toString()}`, { replace: true });
  };

  // Fetch sessions — use search=status:1/2 so the backend search system handles it
  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ["sessions", org?.id, filter],
    enabled: !!org,
    queryFn: () => {
      const qs = new URLSearchParams();
      if (filter === "active") qs.set("search", "status:1");
      if (filter === "closed") qs.set("search", "status:2");
      const query = qs.size ? `?${qs}` : "";
      return crossAppApi.get<{ data: Session[] }>(crossAppOrgPath(org!.id, `/sessions${query}`));
    },
  });

  const sessions = sessionsData?.data ?? [];

  // Assignments for selected session
  const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["session-assignments", org?.id, selectedSession?.session_id],
    enabled: !!org && !!selectedSession,
    queryFn: () =>
      crossAppApi.get<{ data: Assignment[] }>(
        crossAppOrgPath(org!.id, `/assignments?search=session_id:${selectedSession!.session_id}`)
      ),
  });

  const assignments = assignmentsData?.data ?? [];

  // Dashboard/sales data for selected session
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["session-dashboard", org?.id, selectedSession?.session_id],
    enabled: !!org && !!selectedSession,
    queryFn: () =>
      crossAppApi.get<DashboardData>(
        crossAppOrgPath(org!.id, `/dashboard?session_id=${selectedSession!.session_id}`)
      ),
  });

  // Delete session mutation
  const deleteMutation = useMutation({
    mutationFn: (sessionId: string) =>
      crossAppApi.patch(crossAppOrgPath(org!.id, `/sessions/${sessionId}/status`), { status: 3 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", org?.id] });
      setDeleteConfirmId(null);
    },
  });

  // End session mutation — set status to 2 (Inactive)
  const endSessionMutation = useMutation({
    mutationFn: (sessionId: string) =>
      crossAppApi.patch(crossAppOrgPath(org!.id, `/sessions/${sessionId}/status`), { status: 2 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", org?.id] });
      queryClient.invalidateQueries({ queryKey: ["session-dashboard", org?.id] });
      if (selectedSession) {
        setSelectedSession((s) => s ? { ...s, status: 2 } : null);
      }
    },
  });

  const handleDelete = (sessionId: string) => deleteMutation.mutate(sessionId);

  const handleEndSession = (sessionId: string) => {
    if (confirm(t("session.confirmEnd"))) endSessionMutation.mutate(sessionId);
  };

  const handleView = (session: Session) => {
    setSelectedSession(session);
    setDrawerTab("overview");
    setViewOpen(true);
  };

  const handleEdit = (session: Session) => {
    setEditSession(session);
    setConfigOpen(true);
  };

  const handleConfigClose = () => {
    setConfigOpen(false);
    setEditSession(null);
  };

  const fmt = (n: number) => "₡" + Math.round(Number(n) || 0).toLocaleString("es-CR");

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-CR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const isActive = (s: Session) => s.status === 1;

  const getUserDisplayName = (a: Assignment) => {
    if (a.user?.firstName || a.user?.lastName) {
      return `${a.user.firstName ?? ""} ${a.user.lastName ?? ""}`.trim();
    }
    return a.user?.username ?? a.user_id.slice(0, 8);
  };

  return (
    <div style={{ padding: "24px 24px 40px", maxWidth: 1280, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="t-h1" style={{ marginBottom: 6 }}>{t("session.title")}</h1>
          <p className="t-body" style={{ color: "hsl(var(--muted-foreground))" }}>{t("session.manageActiveSessions")}</p>
        </div>
        <Button variant="primary" icon="plus" onClick={() => { setEditSession(null); setConfigOpen(true); }}>
          {t("session.newSession")}
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["all", "active", "closed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
          >
            {f === "all" ? t("session.allSessions") : f === "active" ? t("session.activeSessions") : t("session.closedSessions")}
          </button>
        ))}
      </div>

      {/* Sessions list */}
      {isLoading ? (
        <div className="t-body" style={{ color: "hsl(var(--muted-foreground))", padding: "40px 0", textAlign: "center" }}>
          {t("common.loading")}
        </div>
      ) : sessions.length === 0 ? (
        <Card style={{ padding: 40, textAlign: "center" }}>
          <div className="icon-pill icon-pill-lg" style={{ margin: "0 auto 16px", background: "hsl(var(--muted) / 0.3)", color: "hsl(var(--muted-foreground))", width: 64, height: 64 }}>
            <Icon name="calendar" size={28} />
          </div>
          <div className="t-h3" style={{ marginBottom: 6 }}>{t("session.noSessions")}</div>
          <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))", marginBottom: 20 }}>{t("session.createFirstSession")}</div>
          <Button variant="primary" icon="plus" onClick={() => setConfigOpen(true)}>{t("session.newSession")}</Button>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {sessions.map((session) => (
            <Card key={session.session_id} style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div className={`icon-pill ${isActive(session) ? "" : "icon-pill-muted"}`} style={{ width: 40, height: 40 }}>
                      <Icon name={session.type === "match" ? "trending" : "store"} size={18} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <h3 className="t-h3" style={{ fontSize: 18 }}>{session.name}</h3>
                        {isActive(session) && (
                          <Badge variant="success" style={{ gap: 5 }}>
                            <span className="status-dot status-dot-live" style={{ width: 5, height: 5 }} />
                            {t("session.active")}
                          </Badge>
                        )}
                        {session.status === 2 && <Badge variant="secondary">{t("session.closed") ?? "Cerrada"}</Badge>}
                      </div>
                      <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                        {session.type === "match" ? t("session.match") : t("session.regular")} · {session.context}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
                    <div>
                      <div className="t-label" style={{ fontSize: 10 }}>{t("session.startTime")}</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(session.start_time)}</div>
                    </div>
                    {session.end_time && (
                      <div>
                        <div className="t-label" style={{ fontSize: 10 }}>{t("session.endTime")}</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(session.end_time)}</div>
                      </div>
                    )}
                    {session.expected_revenue != null && (
                      <div>
                        <div className="t-label" style={{ fontSize: 10 }}>Meta</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{fmt(session.expected_revenue)}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, width: "100%", maxWidth: 400 }} className="session-actions">
                  {isActive(session) && (
                    <Button variant="secondary" size="sm" icon="lock" onClick={() => handleEndSession(session.session_id)} disabled={endSessionMutation.isPending} style={{ gridColumn: "span 3" }}>
                      {t("session.endSession")}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" icon="eye" onClick={() => handleView(session)}>
                    {t("common.view")}
                  </Button>
                  {isActive(session) && (
                    <Button variant="outline" size="sm" icon="edit" onClick={() => handleEdit(session)}>
                      {t("common.edit") ?? "Editar"}
                    </Button>
                  )}
                  {!isActive(session) && (
                    <Button variant="ghost" size="sm" icon="trash" onClick={() => setDeleteConfirmId(session.session_id)} disabled={deleteMutation.isPending} style={{ gridColumn: "span 2" }}>
                      {t("common.delete")}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Session Drawer */}
      <Drawer open={configOpen} onClose={handleConfigClose} width="min(900px, 100vw)" title={editSession ? "Editar sesión" : t("session.newSession")}>
        <SessionConfig
          initialSession={editSession ?? undefined}
          onSuccess={handleConfigClose}
        />
      </Drawer>

      {/* Session Detail Drawer */}
      <Drawer open={viewOpen} onClose={() => setViewOpen(false)} width="min(860px, 100vw)" title={selectedSession?.name ?? ""}>
        {selectedSession && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
            {/* Drawer Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid hsl(var(--border))", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div className={`icon-pill ${isActive(selectedSession) ? "" : "icon-pill-muted"}`} style={{ width: 44, height: 44 }}>
                  <Icon name={selectedSession.type === "match" ? "trending" : "store"} size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <h2 className="t-h2" style={{ marginBottom: 0 }}>{selectedSession.name}</h2>
                    {isActive(selectedSession) && (
                      <Badge variant="success" style={{ gap: 5 }}>
                        <span className="status-dot status-dot-live" style={{ width: 5, height: 5 }} />
                        {t("session.active")}
                      </Badge>
                    )}
                    {selectedSession.status === 2 && <Badge variant="secondary">{t("session.closed") ?? "Cerrada"}</Badge>}
                  </div>
                  <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {selectedSession.type === "match" ? t("session.match") : t("session.regular")} · {selectedSession.context}
                  </div>
                </div>
              </div>

              {/* Info row */}
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 8 }}>
                <div>
                  <div className="t-label" style={{ fontSize: 10 }}>{t("session.startTime")}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(selectedSession.start_time)}</div>
                </div>
                {selectedSession.end_time && (
                  <div>
                    <div className="t-label" style={{ fontSize: 10 }}>{t("session.endTime")}</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(selectedSession.end_time)}</div>
                  </div>
                )}
                {selectedSession.expected_revenue != null && (
                  <div>
                    <div className="t-label" style={{ fontSize: 10 }}>Meta de ventas</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{fmt(selectedSession.expected_revenue)}</div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {isActive(selectedSession) && (
                  <>
                    <Button variant="outline" size="sm" icon="edit" onClick={() => { setViewOpen(false); handleEdit(selectedSession); }}>
                      {t("common.edit") ?? "Editar"}
                    </Button>
                    <Button variant="secondary" size="sm" icon="lock" onClick={() => handleEndSession(selectedSession.session_id)} disabled={endSessionMutation.isPending}>
                      {t("session.endSession")}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Drawer Tabs */}
            <div style={{ padding: "0 24px", borderBottom: "1px solid hsl(var(--border))", flexShrink: 0 }}>
              <div className="tabs">
                {(["overview", "assignments", "sales", "report"] as DrawerTab[]).map((tab) => (
                  <button key={tab} className="tab" aria-selected={drawerTab === tab} onClick={() => setDrawerTab(tab)}>
                    {tab === "overview" ? "Resumen" : tab === "assignments" ? "Asignaciones" : tab === "sales" ? "Ventas" : "Reporte"}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Content */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {/* OVERVIEW TAB */}
              {drawerTab === "overview" && (
                <div style={{ padding: 24 }}>
                  {dashboardLoading ? (
                    <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))", textAlign: "center", padding: 32 }}>{t("common.loading")}</div>
                  ) : (
                    <>
                      {/* KPI Cards */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
                        {[
                          { label: "Ventas totales", value: fmt(dashboardData?.total_revenue ?? 0), icon: "dollar", color: "primary" },
                          { label: "Órdenes", value: String(dashboardData?.total_sales ?? 0), icon: "cart", color: "info" },
                          { label: "Ticket promedio", value: fmt(dashboardData?.avg_ticket ?? 0), icon: "trending", color: "success" },
                          { label: "Puestos activos", value: String(dashboardData?.stands?.length ?? 0), icon: "store", color: "warning" },
                        ].map((k) => (
                          <Card key={k.label} style={{ padding: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                              <div className="t-label" style={{ fontSize: 10 }}>{k.label}</div>
                              <div className={`icon-pill icon-pill-${k.color}`} style={{ width: 28, height: 28 }}>
                                <Icon name={k.icon} size={12} />
                              </div>
                            </div>
                            <div className="t-stat-xl" style={{ fontSize: 22 }}>{k.value}</div>
                          </Card>
                        ))}
                      </div>

                      {/* Stand breakdown */}
                      {(dashboardData?.stands?.length ?? 0) > 0 && (
                        <Card style={{ padding: 0 }}>
                          <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--border))" }}>
                            <div className="t-h3" style={{ fontSize: 15 }}>Rendimiento por puesto</div>
                          </div>
                          {dashboardData!.stands.map((stand, i) => (
                            <div key={stand.id} style={{ padding: "14px 20px", borderBottom: i < dashboardData!.stands.length - 1 ? "1px solid hsl(var(--border))" : "none" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                <div>
                                  <div style={{ fontSize: 14, fontWeight: 700 }}>{stand.name}</div>
                                  <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{stand.cashier_name} · {stand.sales_count} órdenes</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                  <div className="t-num" style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-display)", color: "hsl(var(--primary))" }}>{fmt(stand.total_revenue)}</div>
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 8 }}>
                                {[
                                  { l: "Efectivo", v: stand.cash, c: "success" },
                                  { l: "SINPE", v: stand.sinpe, c: "primary" },
                                  { l: "Tarjeta", v: stand.card, c: "info" },
                                ].map((p) => (
                                  <Badge key={p.l} variant={p.c as any} style={{ fontSize: 11 }}>{p.l}: {fmt(p.v)}</Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </Card>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ASSIGNMENTS TAB */}
              {drawerTab === "assignments" && (
                <div style={{ padding: 24 }}>
                  {assignmentsLoading ? (
                    <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))", textAlign: "center", padding: 32 }}>{t("common.loading")}</div>
                  ) : assignments.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 40 }}>
                      <div className="icon-pill icon-pill-lg" style={{ margin: "0 auto 12px", background: "hsl(var(--muted) / 0.3)", color: "hsl(var(--muted-foreground))", width: 56, height: 56 }}>
                        <Icon name="users" size={24} />
                      </div>
                      <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Sin asignaciones</div>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {assignments.map((a) => (
                        <Card key={a.assignment_id} style={{ padding: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div className="icon-pill" style={{ width: 40, height: 40, background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))", flexShrink: 0 }}>
                              <Icon name="user" size={18} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 700 }}>{getUserDisplayName(a)}</div>
                              <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                                {a.branch_id?.slice(0, 8)}…
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                              <Badge variant={a.role === "supervisor" ? "warning" : "secondary"}>
                                {a.role === "supervisor" ? "Supervisor" : "Cajero"}
                              </Badge>
                              <Badge variant={a.status === 1 ? "success" : "secondary"}>
                                {a.status === 1 ? "Activo" : "Inactivo"}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SALES TAB */}
              {drawerTab === "sales" && (
                <div style={{ padding: 24 }}>
                  {dashboardLoading ? (
                    <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))", textAlign: "center", padding: 32 }}>{t("common.loading")}</div>
                  ) : (dashboardData?.stands?.length ?? 0) === 0 ? (
                    <div style={{ textAlign: "center", padding: 40 }}>
                      <div className="icon-pill icon-pill-lg" style={{ margin: "0 auto 12px", background: "hsl(var(--muted) / 0.3)", color: "hsl(var(--muted-foreground))", width: 56, height: 56 }}>
                        <Icon name="dollar" size={24} />
                      </div>
                      <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Sin ventas registradas</div>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 14 }}>
                      {dashboardData!.stands.map((stand) => {
                        const total = stand.total_revenue || 1;
                        return (
                          <Card key={stand.id} style={{ padding: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                              <div>
                                <div style={{ fontSize: 15, fontWeight: 700 }}>{stand.name}</div>
                                <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{stand.cashier_name} · {stand.context}</div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div className="t-num" style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--font-display)", color: "hsl(var(--primary))" }}>{fmt(stand.total_revenue)}</div>
                                <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{stand.sales_count} ventas</div>
                              </div>
                            </div>
                            {[
                              { l: "Efectivo", v: stand.cash, c: "hsl(var(--success))" },
                              { l: "SINPE", v: stand.sinpe, c: "hsl(var(--primary))" },
                              { l: "Tarjeta", v: stand.card, c: "hsl(var(--info))" },
                            ].map((p) => {
                              const pct = (p.v / total) * 100;
                              return (
                                <div key={p.l} style={{ marginBottom: 8 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                    <span style={{ fontSize: 12, fontWeight: 600 }}>{p.l}</span>
                                    <span className="t-num" style={{ fontSize: 12 }}>{fmt(p.v)} <span style={{ color: "hsl(var(--muted-foreground))" }}>({pct.toFixed(0)}%)</span></span>
                                  </div>
                                  <div className="progress progress-thin">
                                    <div className="progress-bar" style={{ width: `${pct}%`, background: p.c }} />
                                  </div>
                                </div>
                              );
                            })}
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* REPORT TAB — inline ReportePage with sessionId prop */}
              {drawerTab === "report" && (
                <ReportePage sessionId={selectedSession.session_id} />
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", animation: "fadeIn 0.2s" }}
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            style={{ maxWidth: 400, margin: 16, animation: "fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
            onClick={(e) => e.stopPropagation()}
          >
          <Card style={{ padding: 24 }}>
            <div className="icon-pill icon-pill-lg" style={{ margin: "0 auto 16px", background: "hsl(var(--destructive) / 0.15)", color: "hsl(var(--destructive))", width: 56, height: 56 }}>
              <Icon name="alertTri" size={24} />
            </div>
            <h3 className="t-h3" style={{ textAlign: "center", marginBottom: 8 }}>{t("session.confirmDelete")}</h3>
            <p className="t-sm" style={{ textAlign: "center", color: "hsl(var(--muted-foreground))", marginBottom: 20 }}>Esta acción no se puede deshacer.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>{t("common.cancel")}</Button>
              <Button variant="destructive" onClick={() => handleDelete(deleteConfirmId)} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? t("common.loading") : t("common.delete")}
              </Button>
            </div>
          </Card>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .session-actions { grid-template-columns: 1fr !important; max-width: 100% !important; }
          .session-actions button { grid-column: span 1 !important; }
        }
      `}</style>
    </div>
  );
}
