import { Card, Icon, Badge, Button } from "@/components/ui";
import { FadeIn } from "@/components/ui/FadeIn";
import { useLanguage } from "@/contexts/LanguageContext";
import { fmt, formatDate } from "@/utils/formatDate";
import type { Session } from "@/types";

interface SessionCardProps {
  session: Session;
  endingPending: boolean;
  deletingPending: boolean;
  onView: (s: Session) => void;
  onEdit: (s: Session) => void;
  onEndSession: (id: string) => void;
  onDeleteConfirm: (id: string) => void;
  delay?: number;
}

export function SessionCard({ session, endingPending, deletingPending, onView, onEdit, onEndSession, onDeleteConfirm, delay = 0 }: SessionCardProps) {
  const { t } = useLanguage();
  const isActive = session.status === 1;

  return (
    <FadeIn delay={delay} duration={0.4}>
      <Card style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{session.name}</span>
            <Badge variant={isActive ? "success" : "secondary"} style={{ fontSize: 11 }}>
              {isActive ? t("session.active") : t("session.closed")}
            </Badge>
            {session.context && (
              <Badge variant="secondary" style={{ fontSize: 11, textTransform: "capitalize" }}>{session.context}</Badge>
            )}
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
              <Icon name="clock" size={11} />
              <span>{t("session.start")}: {formatDate(session.start_time)}</span>
            </div>
            {session.end_time && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                <Icon name="clock" size={11} />
                <span>{t("session.end")}: {formatDate(session.end_time)}</span>
              </div>
            )}
            {session.expected_revenue != null && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                <Icon name="dollar" size={11} />
                <span>{t("session.expected")}: {fmt(session.expected_revenue)}</span>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
          <Button variant="outline" size="sm" icon="eye" onClick={() => onView(session)}>{t("session.viewDetail")}</Button>
          {isActive && (
            <>
              <Button variant="outline" size="sm" icon="edit" onClick={() => onEdit(session)}>{t("common.edit")}</Button>
              <Button variant="outline" size="sm" icon="stop" onClick={() => onEndSession(session.session_id)} disabled={endingPending}>
                {endingPending ? t("common.processing") : t("session.endSession")}
              </Button>
            </>
          )}
          {!isActive && (
            <Button variant="ghost" size="sm" icon="trash" onClick={() => onDeleteConfirm(session.session_id)} disabled={deletingPending} style={{ color: "hsl(var(--destructive))" }}>
              {t("common.delete")}
            </Button>
          )}
        </div>
      </div>
    </Card>
    </FadeIn>
  );
}
