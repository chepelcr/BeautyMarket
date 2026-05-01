import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { crossAppApi, crossAppOrgPath } from "@/lib/api";
import { Icon, Card, Badge, Button, Drawer } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import SessionConfig from "./SessionConfigNew";

type SessionFilter = "all" | "active" | "closed";

interface Session {
  session_id: string;
  name: string;
  type: string;
  context: string;
  start_time: string;
  end_time?: string;
  is_active: boolean;
  status: number;
  branch_id?: string;
  created_at: string;
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
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
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
    const newSearch = params.toString();
    setLocation(`?${newSearch}`, { replace: true });
  };

  // Fetch sessions
  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ["sessions", org?.id, filter],
    enabled: !!org,
    queryFn: () => {
      const params = filter === "active" ? "?is_active=true" : filter === "closed" ? "?is_active=false" : "";
      return crossAppApi.get<{ data: Session[] }>(crossAppOrgPath(org!.id, `/sessions${params}`));
    },
  });

  const sessions = sessionsData?.data ?? [];

  // Delete session mutation (PATCH with status like products)
  const deleteMutation = useMutation({
    mutationFn: (sessionId: string) =>
      crossAppApi.patch(crossAppOrgPath(org!.id, `/sessions/${sessionId}/status`), { status: 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", org?.id] });
      setDeleteConfirmId(null);
    },
  });

  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: (sessionId: string) =>
      crossAppApi.patch(crossAppOrgPath(org!.id, `/sessions/${sessionId}`), { is_active: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", org?.id] });
    },
  });

  const handleDelete = (sessionId: string) => {
    deleteMutation.mutate(sessionId);
  };

  const handleEndSession = (sessionId: string) => {
    if (confirm(t("session.confirmEnd"))) {
      endSessionMutation.mutate(sessionId);
    }
  };

  const handleView = (session: Session) => {
    setSelectedSession(session);
    setViewOpen(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-CR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div style={{ padding: "24px 24px 40px", maxWidth: 1280, margin: "0 auto" }}>
      {/* Header */}
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
          <h1 className="t-h1" style={{ marginBottom: 6 }}>
            {t("session.title")}
          </h1>
          <p className="t-body" style={{ color: "hsl(var(--muted-foreground))" }}>
            {t("session.manageActiveSessions")}
          </p>
        </div>
        <Button variant="primary" icon="plus" onClick={() => setConfigOpen(true)}>
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
          <div
            className="icon-pill icon-pill-lg"
            style={{
              margin: "0 auto 16px",
              background: "hsl(var(--muted) / 0.3)",
              color: "hsl(var(--muted-foreground))",
              width: 64,
              height: 64,
            }}
          >
            <Icon name="calendar" size={28} />
          </div>
          <div className="t-h3" style={{ marginBottom: 6 }}>
            {t("session.noSessions")}
          </div>
          <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))", marginBottom: 20 }}>
            {t("session.createFirstSession")}
          </div>
          <Button variant="primary" icon="plus" onClick={() => setConfigOpen(true)}>
            {t("session.newSession")}
          </Button>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {sessions.map((session) => (
            <Card key={session.session_id} style={{ padding: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div
                      className={`icon-pill ${session.is_active ? "" : "icon-pill-muted"}`}
                      style={{ width: 40, height: 40 }}
                    >
                      <Icon name={session.type === "match" ? "trending" : "store"} size={18} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <h3 className="t-h3" style={{ fontSize: 18 }}>
                          {session.name}
                        </h3>
                        {session.is_active && (
                          <Badge variant="success" style={{ gap: 5 }}>
                            <span className="status-dot status-dot-live" style={{ width: 5, height: 5 }} />
                            {t("session.active")}
                          </Badge>
                        )}
                      </div>
                      <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                        {session.type === "match" ? t("session.match") : t("session.regular")} · {session.context}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
                    <div>
                      <div className="t-label" style={{ fontSize: 10 }}>
                        {t("session.startTime")}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(session.start_time)}</div>
                    </div>
                    {session.end_time && (
                      <div>
                        <div className="t-label" style={{ fontSize: 10 }}>
                          {t("session.endTime")}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(session.end_time)}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Responsive button grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 8,
                    width: "100%",
                    maxWidth: "400px",
                  }}
                  className="session-actions"
                >
                  {session.is_active && (
                    <Button
                      variant="warning"
                      size="sm"
                      icon="lock"
                      onClick={() => handleEndSession(session.session_id)}
                      disabled={endSessionMutation.isPending}
                      style={{ gridColumn: "span 3" }}
                    >
                      {t("session.endSession")}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    icon="eye"
                    onClick={() => handleView(session)}
                  >
                    {t("common.view")}
                  </Button>
                  {!session.is_active && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="trash"
                      onClick={() => setDeleteConfirmId(session.session_id)}
                      disabled={deleteMutation.isPending}
                      style={{ gridColumn: "span 2" }}
                    >
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
      <Drawer open={configOpen} onClose={() => setConfigOpen(false)} width="min(900px, 100vw)">
        <SessionConfig onSuccess={() => setConfigOpen(false)} />
      </Drawer>

      {/* View Session Drawer */}
      <Drawer open={viewOpen} onClose={() => setViewOpen(false)} width="min(700px, 100vw)">
        {selectedSession && (
          <div style={{ padding: 24 }}>
            <h2 className="t-h2" style={{ marginBottom: 16 }}>
              {selectedSession.name}
            </h2>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <div className="t-label">{t("session.sessionType")}</div>
                <div>{selectedSession.type === "match" ? t("session.match") : t("session.regular")}</div>
              </div>
              <div>
                <div className="t-label">{t("session.startTime")}</div>
                <div>{formatDate(selectedSession.start_time)}</div>
              </div>
              {selectedSession.end_time && (
                <div>
                  <div className="t-label">{t("session.endTime")}</div>
                  <div>{formatDate(selectedSession.end_time)}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
            animation: "fadeIn 0.2s",
          }}
          onClick={() => setDeleteConfirmId(null)}
        >
          <Card
            style={{
              maxWidth: 400,
              margin: 16,
              padding: 24,
              animation: "fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="icon-pill icon-pill-lg"
              style={{
                margin: "0 auto 16px",
                background: "hsl(var(--destructive) / 0.15)",
                color: "hsl(var(--destructive))",
                width: 56,
                height: 56,
              }}
            >
              <Icon name="alertTri" size={24} />
            </div>
            <h3 className="t-h3" style={{ textAlign: "center", marginBottom: 8 }}>
              {t("session.confirmDelete")}
            </h3>
            <p className="t-sm" style={{ textAlign: "center", color: "hsl(var(--muted-foreground))", marginBottom: 20 }}>
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? t("common.loading") : t("common.delete")}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .session-actions {
            grid-template-columns: 1fr !important;
            max-width: 100% !important;
          }
          .session-actions button {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
