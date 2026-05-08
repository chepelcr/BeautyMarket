import { Badge } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Terminal, BranchStatus } from "@/types";

const STATUS_VARIANT: Record<BranchStatus, "success" | "secondary" | "destructive"> = {
  1: "success", 2: "secondary", 3: "destructive",
};

interface TerminalRowProps {
  terminal: Terminal;
  isLast: boolean;
}

export function TerminalRow({ terminal, isLast }: TerminalRowProps) {
  const { t } = useLanguage();
  const STATUS_LABEL: Record<BranchStatus, string> = { 1: t("common.active"), 2: t("common.inactive"), 3: t("common.delete") };
  const isActive = terminal.status === 1;
  const lastSeen = terminal.last_seen_at
    ? new Date(terminal.last_seen_at).toLocaleString("es-CR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "10px 20px",
      borderBottom: isLast ? "none" : "1px solid hsl(var(--border) / 0.4)",
    }}>
      <span className={`status-dot status-dot-${isActive ? "success" : "warning"}`} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{terminal.name}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, background: "hsl(var(--muted))", padding: "1px 6px", borderRadius: 4, letterSpacing: "0.05em" }}>
            {terminal.code}
          </span>
        </div>
        {lastSeen && <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))", marginTop: 1 }}>{lastSeen}</div>}
        {terminal.device_id && (
          <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))", marginTop: 1, fontFamily: "var(--font-mono)" }}>
            {terminal.device_id}
          </div>
        )}
      </div>
      <Badge variant={STATUS_VARIANT[terminal.status]}>{STATUS_LABEL[terminal.status]}</Badge>
    </div>
  );
}
