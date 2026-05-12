import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { crossAppApi, crossAppOrgPath } from "@/lib/api";
import { Icon, Card, Badge, Menu } from "@/components/ui";
import { FadeIn } from "@/components/ui/FadeIn";
import { useLanguage } from "@/contexts/LanguageContext";
import { TerminalRow } from "./TerminalRow";
import type { Branch, TerminalListResponse, BranchType, BranchStatus } from "@/types";

const STATUS_VARIANT: Record<BranchStatus, "success" | "secondary" | "destructive"> = {
  1: "success", 2: "secondary", 3: "destructive",
};

interface BranchCardProps {
  branch: Branch;
  orgId: string;
  onEdit: (b: Branch) => void;
  onStatusChange: (b: Branch, status: BranchStatus) => void;
  onAddTerminal: (b: Branch) => void;
  delay?: number;
}

export function BranchCard({ branch, orgId, onEdit, onStatusChange, onAddTerminal, delay = 0 }: BranchCardProps) {
  const { t } = useLanguage();
  const TYPE_LABEL: Record<BranchType, string> = { stand: t("puestos.stand"), restaurant: t("puestos.restaurant") };
  const STATUS_LABEL: Record<BranchStatus, string> = { 1: t("common.active"), 2: t("common.inactive"), 3: t("common.delete") };
  const [expanded, setExpanded] = useState(false);
  const isActive = branch.status === 1;
  const typeColor = branch.type === "stand" ? "hsl(var(--primary))" : "hsl(220 80% 55%)";

  const { data: terminalsData } = useQuery({
    queryKey: ["terminals", orgId, branch.branch_id],
    enabled: expanded,
    queryFn: () => crossAppApi.get<TerminalListResponse>(crossAppOrgPath(orgId, `/branches/${branch.branch_id}/terminals?page_size=100`)),
  });
  const terminals = terminalsData?.data ?? [];

  const menuItems = [
    { label: t("common.edit"),        icon: "edit",        action: () => onEdit(branch),            hidden: branch.status === 3 },
    { label: t("common.activate"),    icon: "checkCircle", action: () => onStatusChange(branch, 1), hidden: branch.status !== 2, color: "hsl(var(--success))" },
    { label: t("common.deactivate"),  icon: "xCircle",     action: () => onStatusChange(branch, 2), hidden: branch.status !== 1 },
    { label: t("common.delete"),      icon: "trash",       action: () => onStatusChange(branch, 3), hidden: branch.status === 3, color: "hsl(var(--destructive))" },
  ];

  return (
    <FadeIn delay={delay} duration={0.4}>
      <Card className="fade-up" style={{ borderLeft: `3px solid ${isActive ? typeColor : "hsl(var(--border))"}`, padding: 0, overflow: "hidden", opacity: branch.status === 3 ? 0.55 : 1 }}>
      {/* Header */}
      <div style={{ padding: "18px 20px 14px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div
              className="icon-pill"
              style={{ width: 38, height: 38, background: `${isActive ? typeColor : "hsl(var(--muted))"}1a`, color: isActive ? typeColor : "hsl(var(--muted-foreground))", flexShrink: 0 }}
            >
              <Icon name={branch.type === "stand" ? "store" : "home"} size={17} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, background: "hsl(var(--muted))", padding: "2px 7px", borderRadius: 4, letterSpacing: "0.05em" }}>
                  {branch.code}
                </span>
                <Badge variant={STATUS_VARIANT[branch.status]}>{STATUS_LABEL[branch.status]}</Badge>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {branch.name}
              </div>
            </div>
          </div>
          <Menu items={menuItems} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
          <div className="t-xs" style={{ display: "flex", alignItems: "center", gap: 5, color: "hsl(var(--muted-foreground))" }}>
            <Icon name={branch.type === "stand" ? "store" : "home"} size={12} />
            {TYPE_LABEL[branch.type]}
          </div>
          {branch.phone && (
            <div className="t-xs" style={{ display: "flex", alignItems: "center", gap: 5, color: "hsl(var(--muted-foreground))" }}>
              <Icon name="smartphone" size={12} />
              {branch.phone}
            </div>
          )}
        </div>
      </div>

      <div style={{ height: 1, background: "hsl(var(--border))" }} />

      {/* Terminals accordion */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", color: "hsl(var(--foreground))" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="sliders" size={13} style={{ color: "hsl(var(--muted-foreground))" } as any} />
          <span className="t-xs" style={{ fontWeight: 600 }}>
            Terminales
            {branch.terminals?.length != null && (
              <span style={{ marginLeft: 6, background: "hsl(var(--muted))", borderRadius: 99, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>
                {branch.terminals.length}
              </span>
            )}
          </span>
        </div>
        <Icon name={expanded ? "chevronUp" : "chevronDown"} size={14} style={{ color: "hsl(var(--muted-foreground))" } as any} />
      </button>

      {expanded && (
        <div className="fade-up" style={{ borderTop: "1px solid hsl(var(--border) / 0.5)", background: "hsl(var(--muted) / 0.25)" }}>
          {terminals.length === 0 ? (
            <div style={{ padding: "16px 20px" }}>
              <span className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{t("puestos.terminals")} — 0</span>
            </div>
          ) : (
            terminals.map((term, i) => <TerminalRow key={term.terminal_id} terminal={term} isLast={i === terminals.length - 1} />)
          )}
          {isActive && (
            <div style={{ padding: "10px 20px" }}>
              <button
                type="button"
                onClick={() => onAddTerminal(branch)}
                className="btn btn-outline btn-sm"
                style={{ width: "100%", borderStyle: "dashed" }}
              >
                <Icon name="plus" size={13} />
                {t("puestos.addTerminal")}
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
    </FadeIn>
  );
}
