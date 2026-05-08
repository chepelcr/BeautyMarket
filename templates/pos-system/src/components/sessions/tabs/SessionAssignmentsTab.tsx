import { Card, Icon, Badge } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Assignment } from "@/types";

interface SessionAssignmentsTabProps {
  assignments: Assignment[];
  isLoading: boolean;
}

function getUserDisplayName(a: Assignment): string {
  if (a.user?.first_name || a.user?.last_name) {
    return `${a.user.first_name ?? ""} ${a.user.last_name ?? ""}`.trim();
  }
  return a.user?.email ?? a.user_id.slice(0, 8);
}

export function SessionAssignmentsTab({ assignments, isLoading }: SessionAssignmentsTabProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))", textAlign: "center", padding: 32 }}>{t("common.loading")}</div>;
  }

  if (assignments.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <div className="icon-pill icon-pill-lg" style={{ margin: "0 auto 12px", background: "hsl(var(--muted) / 0.3)", color: "hsl(var(--muted-foreground))", width: 56, height: 56 }}>
          <Icon name="users" size={24} />
        </div>
        <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Sin asignaciones</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "grid", gap: 10 }}>
        {assignments.map((a) => (
          <Card key={a.assignment_id} style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="icon-pill" style={{ width: 40, height: 40, background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))", flexShrink: 0 }}>
                <Icon name="user" size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{getUserDisplayName(a)}</div>
                <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{a.branch_id?.slice(0, 8)}…</div>
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
    </div>
  );
}
