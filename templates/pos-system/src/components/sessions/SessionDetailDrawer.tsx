import { Drawer, Icon, Badge, Button } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { fmt, formatDate } from "@/utils/formatDate";
import { SessionOverviewTab } from "./tabs/SessionOverviewTab";
import { SessionAssignmentsTab } from "./tabs/SessionAssignmentsTab";
import { SessionSalesTab } from "./tabs/SessionSalesTab";
import { SessionReportTab } from "./tabs/SessionReportTab";
import type { Session, Assignment, DashboardData } from "@/types";

type DrawerTab = "overview" | "assignments" | "sales" | "report";

interface SessionDetailDrawerProps {
  open: boolean;
  session: Session | null;
  assignments: Assignment[];
  assignmentsLoading: boolean;
  dashboardData?: DashboardData;
  dashboardLoading: boolean;
  activeTab: DrawerTab;
  endingPending: boolean;
  onClose: () => void;
  onTabChange: (tab: DrawerTab) => void;
  onEdit: () => void;
  onEndSession: (id: string) => void;
}

export function SessionDetailDrawer({
  open,
  session,
  assignments,
  assignmentsLoading,
  dashboardData,
  dashboardLoading,
  activeTab,
  endingPending,
  onClose,
  onTabChange,
  onEdit,
  onEndSession,
}: SessionDetailDrawerProps) {
  const { t } = useLanguage();
  if (!session) return null;

  const isActive = session.status === 1;

  return (
    <Drawer open={open} onClose={onClose} width="min(860px, 100vw)" title={session.name}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid hsl(var(--border))", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div className={`icon-pill ${isActive ? "" : "icon-pill-muted"}`} style={{ width: 44, height: 44 }}>
              <Icon name={session.type === "match" ? "trending" : "store"} size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h2 className="t-h2" style={{ marginBottom: 0 }}>{session.name}</h2>
                {isActive && (
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

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 8 }}>
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
                <div className="t-label" style={{ fontSize: 10 }}>Meta de ventas</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{fmt(session.expected_revenue)}</div>
              </div>
            )}
          </div>

          {isActive && (
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <Button variant="outline" size="sm" icon="edit" onClick={onEdit}>{t("common.edit") ?? "Editar"}</Button>
              <Button variant="secondary" size="sm" icon="lock" onClick={() => onEndSession(session.session_id)} disabled={endingPending}>
                {t("session.endSession")}
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ padding: "0 24px", borderBottom: "1px solid hsl(var(--border))", flexShrink: 0 }}>
          <div className="tabs">
            {(["overview", "assignments", "sales", "report"] as DrawerTab[]).map((tab) => (
              <button key={tab} className="tab" aria-selected={activeTab === tab} onClick={() => onTabChange(tab)}>
                {tab === "overview" ? "Resumen" : tab === "assignments" ? "Asignaciones" : tab === "sales" ? "Ventas" : "Reporte"}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {activeTab === "overview" && <SessionOverviewTab dashboardData={dashboardData} isLoading={dashboardLoading} />}
          {activeTab === "assignments" && <SessionAssignmentsTab assignments={assignments} isLoading={assignmentsLoading} />}
          {activeTab === "sales" && <SessionSalesTab stands={dashboardData?.stands} isLoading={dashboardLoading} />}
          {activeTab === "report" && <SessionReportTab sessionId={session.session_id} />}
        </div>
      </div>
    </Drawer>
  );
}
