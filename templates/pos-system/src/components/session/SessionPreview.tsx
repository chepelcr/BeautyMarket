import { Card, Badge } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";

type SessionType = "partido" | "regular";

interface SessionPreviewProps {
  sessionType: SessionType;
  rival: string;
  sessionDate: string;
  sessionTime: string;
  selectedBranchesCount: number;
  assignedCount: number;
}

export default function SessionPreview({
  sessionType,
  rival,
  sessionDate,
  sessionTime,
  selectedBranchesCount,
  assignedCount,
}: SessionPreviewProps) {
  const { t } = useLanguage();

  const dateLabel = sessionDate
    ? new Date(sessionDate).toLocaleDateString("es-CR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : t("session.noDate");

  return (
    <Card
      style={{
        padding: 22,
        background: "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.02))",
        borderColor: "hsl(var(--primary) / 0.3)",
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <div className="t-label" style={{ fontSize: 10, marginBottom: 6 }}>
          {t("session.preview")}
        </div>
        <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
          {t("session.previewDesc")}
        </div>
      </div>
      <Badge variant="primary-soft" style={{ marginBottom: 10 }}>
        {sessionType === "partido" ? t("session.match") : t("session.regular")}
      </Badge>
      <div className="t-h2" style={{ marginBottom: 6, fontSize: 24 }}>
        {sessionType === "partido"
          ? rival
            ? `vs ${rival}`
            : t("session.vsRival")
          : t("session.regularOp")}
      </div>
      <div className="t-sm" style={{ color: "hsl(var(--muted-foreground))", marginBottom: 14 }}>
        {dateLabel}
        {sessionType === "partido" && sessionTime ? ` · ${sessionTime}` : ""}
      </div>
      <div className="separator" style={{ marginBottom: 12 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <div className="t-label" style={{ fontSize: 10 }}>
            {t("session.stations")}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--font-display)" }}>
            {selectedBranchesCount}
          </div>
        </div>
        <div>
          <div className="t-label" style={{ fontSize: 10 }}>
            {t("session.assigned")}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--font-display)" }}>
            {assignedCount}/{selectedBranchesCount}
          </div>
        </div>
      </div>
    </Card>
  );
}
