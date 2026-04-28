import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, orgPath, crossAppApi, crossAppOrgPath } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import type { Product } from "@/hooks/useProducts";
import { ordersApi, ordersOrgPath } from "@/lib/api";
import { Icon, Card, CardTitle, CardDescription, Badge, Button } from "@/components/ui";
import { ProductImage } from "@/components/ui/ProductImage";
import type { BranchListResponse } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface Branch {
  branch_id: string;
  name: string;
  code: string;
  type: "stand" | "restaurant";
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

type SessionType = "partido" | "regular";
type Tab = "partido" | "puestos" | "inventario";
type Role = "cashier" | "supervisor";

interface AssignmentEntry {
  userId: string;
  role: Role;
  terminalId?: string;
}

interface StationAssignments {
  members: AssignmentEntry[];
}

const fmt = (n: number) => "₡" + Math.round(Number(n) || 0).toLocaleString("es-CR");

export default function SessionConfig({ onDone }: { onDone?: () => void }) {
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);
  const { t } = useLanguage();
  const qc = useQueryClient();

  const [tab, setTab] = useState<Tab>("partido");

  // Session info
  const [sessionType, setSessionType] = useState<SessionType>("partido");
  const [rival, setRival] = useState("");
  const [sessionTime, setSessionTime] = useState("19:00");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [branchId, setBranchId] = useState("");

  // Branch selection + assignments (now supports multiple members per station)
  const [activeBranches, setActiveBranches] = useState<Set<string>>(new Set());
  const [assignments, setAssignments] = useState<Record<string, StationAssignments>>({});

  // Inventory per puesto (branchId → productId → qty)
  const [inventory, setInventory] = useState<Record<string, Record<string, number>>>({});
  
  // Selected products for the session
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  const [error, setError] = useState<string | null>(null);

  const { data: branchesResponse } = useQuery({
    queryKey: ["branches", org?.id],
    enabled: !!user && !!org,
    queryFn: () =>
      crossAppApi.get<BranchListResponse>(crossAppOrgPath(org!.id, "/branches?search=status:1")),
  });
  const branches: Branch[] = branchesResponse?.data ?? [];

  const { data: members = [] } = useQuery({
    queryKey: ["org-users", org?.id],
    enabled: !!user && !!org,
    queryFn: () => api.get<Member[]>(orgPath(user!.userId, org!.id, "/members")),
  });

  const { data: productsResponse } = useQuery({
    queryKey: ["products", org?.id],
    enabled: !!user && !!org,
    queryFn: () =>
      ordersApi.get<{ data: Product[] } | Product[]>(ordersOrgPath(org!.id, "/products")),
  });
  const products: Product[] = Array.isArray(productsResponse)
    ? productsResponse
    : (productsResponse as any)?.data ?? [];


  const selectedBranches = branches.filter((b) => activeBranches.has(b.branch_id));
  const assigned = selectedBranches.filter((b) => 
    assignments[b.branch_id]?.members?.length > 0
  ).length;

  const canActivate = selectedBranches.length > 0 && assigned === selectedBranches.length && !!sessionDate;

  const mutation = useMutation({
    mutationFn: async () => {
      setError(null);
      const start_time =
        sessionDate && sessionTime
          ? new Date(`${sessionDate}T${sessionTime}:00`).toISOString()
          : new Date().toISOString();

      const session = await crossAppApi.post<{ session_id: string }>(
        crossAppOrgPath(org!.id, "/sessions"),
        {
          name: sessionType === "partido" ? `vs ${rival}` : "Operación regular",
          type: sessionType === "partido" ? "match" : "shift",
          start_time,
          branch_id: branchId || undefined,
          product_ids: selectedProducts.size > 0 ? Array.from(selectedProducts) : undefined,
        }
      );

      // Create assignments for all members in each station
      const assignmentPromises = selectedBranches
        .filter((b) => assignments[b.branch_id]?.members?.length > 0)
        .flatMap((b) =>
          assignments[b.branch_id].members.map((member) =>
            crossAppApi.post(crossAppOrgPath(org!.id, "/assignments"), {
              session_id: session.session_id,
              user_id: member.userId,
              branch_id: b.branch_id,
              terminal_id: member.terminalId,
              role: member.role ?? "cashier",
              start_time,
            })
          )
        );

      await Promise.all(assignmentPromises);
      
      // TODO: Save selected products and inventory for the session
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard", org?.id] });
      qc.invalidateQueries({ queryKey: ["sessions", org?.id] });
      onDone?.();
    },
    onError: (err: Error) => {
      setError(err.message || t("common.error"));
    },
  });

  const toggleBranch = (bid: string) =>
    setActiveBranches((prev) => {
      const next = new Set(prev);
      next.has(bid) ? next.delete(bid) : next.add(bid);
      return next;
    });

  const addMemberToStation = (branchId: string) => {
    setAssignments((prev) => ({
      ...prev,
      [branchId]: {
        members: [
          ...(prev[branchId]?.members || []),
          { userId: "", role: "cashier", terminalId: undefined },
        ],
      },
    }));
  };

  const removeMemberFromStation = (branchId: string, index: number) => {
    setAssignments((prev) => ({
      ...prev,
      [branchId]: {
        members: prev[branchId].members.filter((_, i) => i !== index),
      },
    }));
  };

  const updateMember = (
    branchId: string,
    index: number,
    field: keyof AssignmentEntry,
    value: string
  ) => {
    setAssignments((prev) => ({
      ...prev,
      [branchId]: {
        members: prev[branchId].members.map((m, i) =>
          i === index ? { ...m, [field]: value } : m
        ),
      },
    }));
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
  };

  // All userIds already assigned anywhere in this session (across all branches)
  const allAssignedUserIds = new Set(
    Object.values(assignments)
      .flatMap((s) => s.members.map((m) => m.userId))
      .filter(Boolean)
  );

  const dateLabel = sessionDate
    ? new Date(sessionDate).toLocaleDateString("es-CR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : t("session.noDate");

  return (
    <div className="session-page">
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
            {t("session.subtitle")}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {error && (
            <span className="t-sm" style={{ color: "hsl(var(--destructive))" }}>
              {error}
            </span>
          )}
          <Button
            variant="primary"
            icon="check"
            disabled={!canActivate || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? t("session.activating") : t("session.activate")}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container" style={{ marginBottom: 18 }}>
        <div className="tabs">
          <button
            className="tab"
            aria-selected={tab === "partido"}
            onClick={() => setTab("partido")}
          >
            <Icon name="calendar" size={13} /> {t("session.tabMatch")}
          </button>
          <button
            className="tab"
            aria-selected={tab === "puestos"}
            onClick={() => setTab("puestos")}
          >
            <Icon name="store" size={13} /> {t("session.tabStations")}
          </button>
          <button
            className="tab"
            aria-selected={tab === "inventario"}
            onClick={() => setTab("inventario")}
          >
            <Icon name="box" size={13} /> {t("session.tabInventory")}
          </button>
        </div>
      </div>

      {/* Tab: Datos del partido */}
      {tab === "partido" && (
        <div className="grid-session">
          <Card style={{ padding: 24 }}>
            <CardTitle>{t("session.sessionInfo")}</CardTitle>
            <CardDescription style={{ marginBottom: 20 }}>
              {t("session.sessionInfoDesc")}
            </CardDescription>
            <div className="grid-form">
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
                      style={{
                        padding: 14,
                        textAlign: "left",
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        border:
                          sessionType === o.id
                            ? "2px solid hsl(var(--primary))"
                            : "1px solid hsl(var(--border))",
                        background:
                          sessionType === o.id
                            ? "hsl(var(--primary) / 0.08)"
                            : "hsl(var(--card))",
                        borderRadius: "var(--radius)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <div
                        className={`icon-pill ${sessionType === o.id ? "" : "icon-pill-muted"}`}
                      >
                        <Icon name={o.icon} size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{o.label}</div>
                        <div
                          className="t-xs"
                          style={{ color: "hsl(var(--muted-foreground))" }}
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

              <div>
                <label className="label">{t("session.mainBranch")}</label>
                <select
                  className="input"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                >
                  <option value="">{t("session.noBranch")}</option>
                  {branches.map((b) => (
                    <option key={b.branch_id} value={b.branch_id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Preview card */}
          <Card style={{ padding: 22 }}>
            <CardTitle>{t("session.preview")}</CardTitle>
            <CardDescription style={{ marginBottom: 16 }}>
              {t("session.previewDesc")}
            </CardDescription>
            <Card
              style={{
                padding: 16,
                background:
                  "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.02))",
                borderColor: "hsl(var(--primary) / 0.3)",
              }}
            >
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
              <div
                className="t-sm"
                style={{ color: "hsl(var(--muted-foreground))", marginBottom: 14 }}
              >
                {dateLabel}
                {sessionType === "partido" && sessionTime ? ` · ${sessionTime}` : ""}
              </div>
              <div className="separator" style={{ marginBottom: 12 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div className="t-label" style={{ fontSize: 10 }}>
                    {t("session.stations")}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {selectedBranches.length}
                  </div>
                </div>
                <div>
                  <div className="t-label" style={{ fontSize: 10 }}>
                    {t("session.assigned")}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {assigned}/{selectedBranches.length}
                  </div>
                </div>
              </div>
            </Card>
          </Card>
        </div>
      )}

      {/* Tab: Puestos y asignaciones */}
      {tab === "puestos" && (
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
                            {branch.code} · {branchTerminals.length} {t("puestos.terminals")}
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
                            // Members selectable for this slot: not assigned anywhere else,
                            // plus keep the slot's own current value visible
                            const availableForSlot = members.filter(
                              (m) => m.userId === member.userId || !allAssignedUserIds.has(m.userId)
                            );

                            // Supervisor already taken by another slot in this branch
                            const branchHasSupervisor = stationMembers.some(
                              (m, i) => i !== memberIndex && m.role === "supervisor"
                            );

                            return (
                              <div
                                key={memberIndex}
                                className="grid-member"
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
                                    {branchTerminals.map((t) => (
                                      <option key={t.terminal_id} value={t.terminal_id}>
                                        {t.name} ({t.code})
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Role selector — supervisor hidden if branch already has one */}
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
      )}

      {/* Tab: Inventario inicial */}
      {tab === "inventario" && (
        <Card style={{ padding: 0 }}>
          <div
            style={{
              padding: "18px 24px",
              borderBottom: "1px solid hsl(var(--border))",
            }}
          >
            <CardTitle>{t("session.inventoryTitle")}</CardTitle>
            <CardDescription>
              {t("session.inventoryDesc")}
            </CardDescription>
          </div>

          {/* Desktop table layout */}
          <div className="inv-desktop" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "hsl(var(--muted) / 0.4)" }}>
                  <th style={{ ...thStyle, width: 40 }}>
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === products.filter((p) => p.status === 1).length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts(new Set(products.filter((p) => p.status === 1).map((p) => p.product_id)));
                        } else {
                          setSelectedProducts(new Set());
                        }
                      }}
                    />
                  </th>
                  <th style={thStyle}>Producto</th>
                  {selectedBranches.map((b) => (
                    <th key={b.branch_id} style={{ ...thStyle, textAlign: "center" }}>
                      {b.name}
                    </th>
                  ))}
                  {selectedBranches.length === 0 && (
                    <th style={{ ...thStyle, textAlign: "center" }}>
                      {t("session.selectFirst")}
                    </th>
                  )}
                  <th style={{ ...thStyle, textAlign: "right" }}>{t("session.total")}</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter((p) => p.status === 1)
                  .map((p) => {
                    const needsInventory = p.track_inventory === true;
                    const total = needsInventory
                      ? selectedBranches.reduce(
                          (s, b) => s + (inventory[b.branch_id]?.[p.product_id] ?? 0),
                          0
                        )
                      : 0;
                    const isSelected = selectedProducts.has(p.product_id);

                    return (
                      <tr
                        key={p.product_id}
                        style={{
                          borderBottom: "1px solid hsl(var(--border))",
                          opacity: isSelected ? 1 : 0.5,
                        }}
                      >
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleProduct(p.product_id)}
                          />
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <ProductImage imageUrl={p.image_url} name={p.name} size={32} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                              <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                                {fmt(p.price)}
                                {!needsInventory && (
                                  <Badge variant="secondary" style={{ marginLeft: 6, fontSize: 9 }}>
                                    {t("session.noInventoryTracking")}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        {selectedBranches.map((b) => (
                          <td key={b.branch_id} style={{ ...tdStyle, textAlign: "center" }}>
                            {needsInventory ? (
                              <input
                                className="input input-sm t-num"
                                type="number"
                                min={0}
                                disabled={!isSelected}
                                style={{
                                  width: 70,
                                  margin: "0 auto",
                                  textAlign: "center",
                                  fontWeight: 700,
                                  fontFamily: "var(--font-display)",
                                  display: "block",
                                }}
                                value={inventory[b.branch_id]?.[p.product_id] ?? 0}
                                onChange={(e) =>
                                  setInventory((inv) => ({
                                    ...inv,
                                    [b.branch_id]: {
                                      ...inv[b.branch_id],
                                      [p.product_id]: Number(e.target.value),
                                    },
                                  }))
                                }
                              />
                            ) : (
                              <span className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>—</span>
                            )}
                          </td>
                        ))}
                        {selectedBranches.length === 0 && (
                          <td style={{ ...tdStyle, textAlign: "center", color: "hsl(var(--muted-foreground))" }}>
                            —
                          </td>
                        )}
                        <td
                          style={{ ...tdStyle, textAlign: "right", fontWeight: 800, fontFamily: "var(--font-display)" }}
                          className="t-num"
                        >
                          {needsInventory ? total : "—"}
                        </td>
                      </tr>
                    );
                  })}
                {products.filter((p) => p.status === 1).length === 0 && (
                  <tr>
                    <td
                      colSpan={selectedBranches.length + 3}
                      style={{ ...tdStyle, textAlign: "center", color: "hsl(var(--muted-foreground))", padding: 32 }}
                    >
                      {t("session.noActiveProducts")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card layout */}
          <div className="inv-mobile">
            {products.filter((p) => p.status === 1).length === 0 ? (
              <p className="t-sm" style={{ color: "hsl(var(--muted-foreground))", textAlign: "center", padding: "24px 0" }}>
                {t("session.noActiveProducts")}
              </p>
            ) : (
              products.filter((p) => p.status === 1).map((p) => {
                const needsInventory = p.track_inventory === true;
                const isSelected = selectedProducts.has(p.product_id);

                return (
                  <div
                    key={p.product_id}
                    style={{
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 10,
                      overflow: "hidden",
                      opacity: isSelected ? 1 : 0.55,
                    }}
                  >
                    {/* Card header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 14px",
                        background: "hsl(var(--muted) / 0.35)",
                        borderBottom: needsInventory && selectedBranches.length > 0
                          ? "1px solid hsl(var(--border))"
                          : undefined,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleProduct(p.product_id)}
                        style={{ flexShrink: 0 }}
                      />
                      <ProductImage imageUrl={p.image_url} name={p.name} size={36} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.name}
                        </div>
                        <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          {fmt(p.price)}
                          {!needsInventory && (
                            <Badge variant="secondary" style={{ fontSize: 9 }}>
                              {t("session.noInventoryTracking")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Branch quantity rows — only when inventory tracking is on */}
                    {needsInventory && selectedBranches.length > 0 && (
                      <div>
                        {selectedBranches.map((b, bi) => (
                          <div
                            key={b.branch_id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "10px 14px",
                              borderBottom: bi < selectedBranches.length - 1
                                ? "1px solid hsl(var(--border))"
                                : undefined,
                              gap: 10,
                            }}
                          >
                            <span className="t-sm" style={{ fontWeight: 500, color: "hsl(var(--muted-foreground))" }}>
                              {b.name}
                            </span>
                            <input
                              className="input input-sm t-num"
                              type="number"
                              min={0}
                              disabled={!isSelected}
                              style={{
                                width: 80,
                                textAlign: "center",
                                fontWeight: 700,
                                fontFamily: "var(--font-display)",
                              }}
                              value={inventory[b.branch_id]?.[p.product_id] ?? 0}
                              onChange={(e) =>
                                setInventory((inv) => ({
                                  ...inv,
                                  [b.branch_id]: {
                                    ...inv[b.branch_id],
                                    [p.product_id]: Number(e.target.value),
                                  },
                                }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {needsInventory && selectedBranches.length === 0 && (
                      <div style={{ padding: "10px 14px" }}>
                        <span className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                          {t("session.selectFirst")}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "hsl(var(--muted-foreground))",
  textAlign: "left",
  fontFamily: "var(--font-display)",
};

const tdStyle: React.CSSProperties = { padding: "14px 16px", fontSize: 13 };
