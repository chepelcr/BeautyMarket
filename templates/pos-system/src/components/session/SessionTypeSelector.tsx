import { Icon } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";

type SessionType = "partido" | "regular";

interface SessionTypeSelectorProps {
  sessionType: SessionType;
  setSessionType: (type: SessionType) => void;
  rival: string;
  setRival: (rival: string) => void;
  sessionTime: string;
  setSessionTime: (time: string) => void;
  sessionDate: string;
  setSessionDate: (date: string) => void;
}

export default function SessionTypeSelector({
  sessionType,
  setSessionType,
  rival,
  setRival,
  sessionTime,
  setSessionTime,
  sessionDate,
  setSessionDate,
}: SessionTypeSelectorProps) {
  const { t } = useLanguage();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {/* Session type */}
      <div style={{ gridColumn: "1 / -1" }}>
        <label className="label">{t("session.sessionType")}</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {(
            [
              { id: "partido", icon: "trending", label: t("session.match"), desc: t("session.matchDesc") },
              { id: "regular", icon: "store", label: t("session.regular"), desc: t("session.regularDesc") },
            ] as const
          ).map((o) => (
            <button
              key={o.id}
              onClick={() => setSessionType(o.id)}
              className={sessionType === o.id ? "card card-primary" : "card"}
              style={{
                padding: 14,
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                border:
                  sessionType === o.id
                    ? "2px solid hsl(var(--primary))"
                    : "1px solid hsl(var(--border))",
                background:
                  sessionType === o.id
                    ? "hsl(var(--primary) / 0.08)"
                    : "hsl(var(--card))",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div
                className={`icon-pill ${sessionType === o.id ? "" : "icon-pill-muted"}`}
                style={{ width: 40, height: 40, flexShrink: 0 }}
              >
                <Icon name={o.icon} size={18} />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{o.label}</div>
                <div
                  className="t-xs"
                  style={{ color: "hsl(var(--muted-foreground))", lineHeight: 1.4 }}
                >
                  {o.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {sessionType === "partido" && (
        <>
          <div>
            <label className="label">{t("session.rivalTeam")}</label>
            <input
              className="input"
              value={rival}
              onChange={(e) => setRival(e.target.value)}
              placeholder="vs Saprissa"
            />
          </div>
          <div>
            <label className="label">{t("session.matchTime")}</label>
            <input
              className="input"
              type="time"
              value={sessionTime}
              onChange={(e) => setSessionTime(e.target.value)}
            />
          </div>
        </>
      )}

      <div>
        <label className="label">{t("session.date")}</label>
        <input
          className="input"
          type="date"
          value={sessionDate}
          onChange={(e) => setSessionDate(e.target.value)}
        />
      </div>
    </div>
  );
}
