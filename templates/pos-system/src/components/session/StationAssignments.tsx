import { Icon, Card, CardTitle, CardDescription, Button } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";

interface Branch {
  branch_id: string;
  name: string;
  code: number;
  type: "stand" | "restaurant";
  status: number;
  terminals?: Terminal[];
}

interface Terminal {
  terminal_id: string;
  name: string;
  code: number;
  branch_id: string;
  status: number;
}

interface Member {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

type Role = "cashier" | "supervisor";

interface AssignmentEntry {
  userId: string;
  role: Role;
  terminalId?: string;
}

interface StationAssignments {
  members: AssignmentEntry[];
}

interface StationAssignmentsProps {
  branches: Branch[];
  activeBranches: Set<string>;
  toggleBranch: (branchId: string) => void;
  selectedBranches: Branch[];
  assignments: Record<string, StationAssignments>;
  members: Member[];
  allAssignedUserIds: Set<string>;
  assigned: number;
  addMemberToStation: (branchId: string) => void;
  removeMemberFromStation: (branchId: string, index: number) => void;
  updateMember: (branchId: string, index: number, field: keyof AssignmentEntry, value: string) => void;
}

export default function StationAssignments({
  branches,
  activeBranches,
  toggleBranch,
  selectedBranches,
  assignments,
  members,
  allAssignedUserIds,
  assigned,
  addMemberToStation,
  removeMemberFromStation,
  updateMember,
}: StationAssignmentsProps) {
  const { t } = useLanguage();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Branch selection */}
      <Card style={{ padding: 0 }}>
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid hsl(var(--border))",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <CardTitle>{t("session.selectStations")}</CardTitle>
            <CardDescription>
              {t("session.activeForSession", { n: String(activeBranches.size) })}
            </CardDescription>
          </div>
        </div>
        <div style={{ padding: "12px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
          {branches.length === 0 && (
            <p
              className="t-sm"
              style={{ color: "hsl(var(--muted-foreground))", padding: "12px 0" }}
            >
              {t("session.noBranches")}
            </p>
          )}
          {branches.map((b) => (
            <button
              key={b.branch_id}
              onClick={() => toggleBranch(b.branch_id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                borderRadius: "var(--radius)",
                border: activeBranches.has(b.branch_id)
                  ? "2px solid hsl(var(--primary))"
                  : "1px solid hsl(var(--border))",
                background: activeBranches.has(b.branch_id)
                  ? "hsl(var(--primary) / 0.06)"
                  : "hsl(var(--card))",
                cursor: "pointer",
                transition: "all 0.15s",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="icon-pill icon-pill-muted">
                  <Icon name="store" size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{b.name}</div>
                  <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {b.code} · {b.type}
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  border: activeBranches.has(b.branch_id)
                    ? "2px solid hsl(var(--primary))"
                    : "2px solid hsl(var(--border))",
                  background: activeBranches.has(b.branch_id)
                    ? "hsl(var(--primary))"
                    : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {activeBranches.has(b.branch_id) && (
                  <Icon name="check" size={12} style={{ color: "white" }} />
                )}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Assignments table */}
      {selectedBranches.length > 0 && (
        <Card style={{ padding: 0 }}>
          <div
            style={{
              padding: "18px 24px",
              borderBottom: "1px solid hsl(var(--border))",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <CardTitle>{t("session.assignments")}</CardTitle>
              <CardDescription>
                {t("session.assignedCount", { n: String(assigned), total: String(selectedBranches.length) })}
              </CardDescription>
            </div>
          </div>
          <div style={{ padding: "0 24px" }}>
            {selectedBranches.map((branch, i) => {
              const stationMembers = assignments[branch.branch_id]?.members || [];
              const branchTerminals = branch.terminals || [];

              return (
                <div
                  key={branch.branch_id}
                  style={{
                    padding: "18px 0",
                    borderBottom:
                      i < selectedBranches.length - 1
                        ? "1px solid hsl(var(--border))"
                        : "none",
                  }}
                >
                  {/* Station header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div className="icon-pill icon-pill-lg">
                      <Icon name="store" size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{branch.name}</div>
                      <div
                        className="t-xs"
                        style={{ color: "hsl(var(--muted-foreground))" }}
                      >
                        {branch.code} · {branchTerminals.length} terminales
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      icon="plus"
                      disabled={members.filter((m) => !allAssignedUserIds.has(m.userId)).length === 0}
                      onClick={() => addMemberToStation(branch.branch_id)}
                    >
                      {t("session.addMember")}
                    </Button>
                  </div>

                  {/* Members list */}
                  {stationMembers.length === 0 ? (
                    <div style={{ padding: "12px 16px", background: "hsl(var(--muted) / 0.3)", borderRadius: "var(--radius)", textAlign: "center" }}>
                      <span className="t-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                        {t("session.noMembers")}
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {stationMembers.map((member, memberIndex) => {
                        const availableForSlot = members.filter(
                          (m) => m.userId === member.userId || !allAssignedUserIds.has(m.userId)
                        );

                        const branchHasSupervisor = stationMembers.some(
                          (m, i) => i !== memberIndex && m.role === "supervisor"
                        );

                        return (
                          <div
                            key={memberIndex}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "2fr 1.5fr 1fr auto",
                              gap: 10,
                              alignItems: "end",
                            }}
                          >
                            {/* Member selector */}
                            <div>
                              <label className="label" style={{ fontSize: 10 }}>
                                {t("session.member")}
                              </label>
                              <select
                                className="input input-sm"
                                value={member.userId}
                                onChange={(e) =>
                                  updateMember(branch.branch_id, memberIndex, "userId", e.target.value)
                                }
                              >
                                <option value="">{t("session.select")}</option>
                                {availableForSlot.map((m) => (
                                  <option key={m.userId} value={m.userId}>
                                    {[m.user.firstName, m.user.lastName].filter(Boolean).join(" ") || m.user.email}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Terminal selector */}
                            <div>
                              <label className="label" style={{ fontSize: 10 }}>
                                {t("session.terminal")}
                              </label>
                              <select
                                className="input input-sm"
                                value={member.terminalId || ""}
                                onChange={(e) =>
                                  updateMember(branch.branch_id, memberIndex, "terminalId", e.target.value)
                                }
                              >
                                <option value="">{t("session.noTerminal")}</option>
                                {branchTerminals.map((terminal) => (
                                  <option key={terminal.terminal_id} value={terminal.terminal_id}>
                                    {terminal.name} ({terminal.code})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Role selector */}
                            <div>
                              <label className="label" style={{ fontSize: 10 }}>
                                {t("session.role")}
                              </label>
                              <select
                                className="input input-sm"
                                value={branchHasSupervisor ? "cashier" : member.role}
                                disabled={branchHasSupervisor}
                                onChange={(e) =>
                                  updateMember(branch.branch_id, memberIndex, "role", e.target.value)
                                }
                              >
                                <option value="cashier">{t("assignments.cashier")}</option>
                                {!branchHasSupervisor && (
                                  <option value="supervisor">{t("assignments.supervisor")}</option>
                                )}
                              </select>
                            </div>

                            {/* Remove button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              icon="trash"
                              onClick={() => removeMemberFromStation(branch.branch_id, memberIndex)}
                              style={{ color: "hsl(var(--destructive))" }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
