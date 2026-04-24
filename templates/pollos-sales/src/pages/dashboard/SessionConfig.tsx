import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, orgPath, crossAppApi, crossAppOrgPath } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import type { Product } from "@/hooks/useProducts";
import { ordersApi, ordersOrgPath } from "@/lib/api";
import { Icon, Card, CardTitle, CardDescription, Badge, Button } from "@/components/ui";

interface Branch {
  branch_id: string;
  name: string;
  code: string;
  type: "stand" | "restaurant";
  status: number;
}

interface Member {
  id: string;
  name: string;
  email: string;
}

type SessionType = "partido" | "regular";
type Tab = "partido" | "puestos" | "inventario";
type Role = "cashier" | "supervisor";

interface AssignmentEntry {
  userId: string;
  role: Role;
}

const fmt = (n: number) => "₡" + Math.round(Number(n) || 0).toLocaleString("es-CR");

export default function SessionConfig({ onDone }: { onDone?: () => void }) {
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);
  const qc = useQueryClient();

  const [tab, setTab] = useState<Tab>("partido");

  // Session info
  const [sessionType, setSessionType] = useState<SessionType>("partido");
  const [rival, setRival] = useState("");
  const [sessionTime, setSessionTime] = useState("19:00");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [branchId, setBranchId] = useState("");

  // Branch selection + assignments
  const [activeBranches, setActiveBranches] = useState<Set<string>>(new Set());
  const [assignments, setAssignments] = useState<Record<string, AssignmentEntry>>({});

  // Inventory per puesto (branchId → productId → qty)
  const [inventory, setInventory] = useState<Record<string, Record<string, number>>>({});

  const [error, setError] = useState<string | null>(null);

  const { data: branches = [] } = useQuery({
    queryKey: ["branches", org?.id],
    enabled: !!user && !!org,
    queryFn: () =>
      crossAppApi.get<Branch[]>(crossAppOrgPath(org!.id, "/branches?is_active=true")),
  });

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
  const assigned = selectedBranches.filter((b) => assignments[b.branch_id]?.userId).length;

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
        }
      );

      await Promise.all(
        selectedBranches
          .filter((b) => assignments[b.branch_id]?.userId)
          .map((b) =>
            crossAppApi.post(crossAppOrgPath(org!.id, "/assignments"), {
              session_id: session.session_id,
              user_id: assignments[b.branch_id].userId,
              branch_id: b.branch_id,
              role: assignments[b.branch_id].role ?? "cashier",
              start_time,
            })
          )
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard", org?.id] });
      qc.invalidateQueries({ queryKey: ["sessions", org?.id] });
      onDone?.();
    },
    onError: (err: Error) => {
      setError(err.message || "Error al crear sesión");
    },
  });

  const toggleBranch = (bid: string) =>
    setActiveBranches((prev) => {
      const next = new Set(prev);
      next.has(bid) ? next.delete(bid) : next.add(bid);
      return next;
    });

  const setAssign = (bid: string, field: keyof AssignmentEntry, value: string) =>
    setAssignments((a) => ({
      ...a,
      [bid]: { ...a[bid], [field]: value, role: a[bid]?.role ?? "cashier" } as AssignmentEntry,
    }));

  const dateLabel = sessionDate
    ? new Date(sessionDate).toLocaleDateString("es-CR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "Sin fecha";

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
            Configurar sesión
          </h1>
          <p className="t-body" style={{ color: "hsl(var(--muted-foreground))" }}>
            Creá un nuevo partido o día operativo y asigná cajeros a cada puesto.
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
            {mutation.isPending ? "Activando…" : "Activar sesión"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 18 }}>
        <button
          className="tab"
          aria-selected={tab === "partido"}
          onClick={() => setTab("partido")}
        >
          <Icon name="calendar" size={13} /> Datos del partido
        </button>
        <button
          className="tab"
          aria-selected={tab === "puestos"}
          onClick={() => setTab("puestos")}
        >
          <Icon name="store" size={13} /> Puestos y asignaciones
        </button>
        <button
          className="tab"
          aria-selected={tab === "inventario"}
          onClick={() => setTab("inventario")}
        >
          <Icon name="box" size={13} /> Inventario inicial
        </button>
      </div>

      {/* Tab: Datos del partido */}
      {tab === "partido" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr",
            gap: 14,
          }}
        >
          <Card style={{ padding: 24 }}>
            <CardTitle>Información de la sesión</CardTitle>
            <CardDescription style={{ marginBottom: 20 }}>
              Los cajeros verán este contexto al abrir turno.
            </CardDescription>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {/* Session type */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="label">Tipo de sesión</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(
                    [
                      { id: "partido", icon: "trending", label: "Partido", desc: "Ventas en estadio" },
                      { id: "regular", icon: "store", label: "Día regular", desc: "Operación restaurante" },
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
                    <label className="label">Equipo rival</label>
                    <input
                      className="input"
                      value={rival}
                      onChange={(e) => setRival(e.target.value)}
                      placeholder="vs Saprissa"
                    />
                  </div>
                  <div>
                    <label className="label">Hora del partido</label>
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
                <label className="label">Fecha</label>
                <input
                  className="input"
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Sucursal principal</label>
                <select
                  className="input"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                >
                  <option value="">Sin sucursal</option>
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
            <CardTitle>Vista previa</CardTitle>
            <CardDescription style={{ marginBottom: 16 }}>
              Así la verán los cajeros
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
                {sessionType === "partido" ? "Partido" : "Día regular"}
              </Badge>
              <div className="t-h2" style={{ marginBottom: 6, fontSize: 24 }}>
                {sessionType === "partido"
                  ? rival
                    ? `vs ${rival}`
                    : "vs Rival"
                  : "Operación regular"}
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
                    Puestos
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
                    Asignados
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
                <CardTitle>Seleccionar puestos</CardTitle>
                <CardDescription>
                  {activeBranches.size} puestos activos para esta sesión
                </CardDescription>
              </div>
            </div>
            <div style={{ padding: "12px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
              {branches.length === 0 && (
                <p
                  className="t-sm"
                  style={{ color: "hsl(var(--muted-foreground))", padding: "12px 0" }}
                >
                  No hay sucursales disponibles.
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
                  <CardTitle>Asignaciones</CardTitle>
                  <CardDescription>
                    {assigned}/{selectedBranches.length} puestos con cajero asignado
                  </CardDescription>
                </div>
              </div>
              <div style={{ padding: "0 24px" }}>
                {selectedBranches.map((branch, i) => {
                  const assignedMember = members.find(
                    (m) => m.id === assignments[branch.branch_id]?.userId
                  );
                  const initials = assignedMember?.name
                    ? assignedMember.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "";

                  return (
                    <div
                      key={branch.branch_id}
                      style={{
                        padding: "18px 0",
                        borderBottom:
                          i < selectedBranches.length - 1
                            ? "1px solid hsl(var(--border))"
                            : "none",
                        display: "grid",
                        gridTemplateColumns: "1fr 1.4fr 1fr auto",
                        gap: 20,
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="icon-pill icon-pill-lg">
                          <Icon name="store" size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{branch.name}</div>
                          <div
                            className="t-xs"
                            style={{ color: "hsl(var(--muted-foreground))" }}
                          >
                            {branch.code}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div
                          className="t-label"
                          style={{ fontSize: 10, marginBottom: 6 }}
                        >
                          Cajero
                        </div>
                        {assignedMember ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 999,
                                background: "hsl(var(--primary))",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 700,
                                fontFamily: "var(--font-display)",
                                flexShrink: 0,
                              }}
                            >
                              {initials}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>
                              {assignedMember.name}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="warning">Sin asignar</Badge>
                        )}
                      </div>

                      <div>
                        <label className="label" style={{ fontSize: 10 }}>
                          Rol
                        </label>
                        <select
                          className="input input-sm"
                          value={assignments[branch.branch_id]?.role ?? "cashier"}
                          onChange={(e) =>
                            setAssign(branch.branch_id, "role", e.target.value)
                          }
                        >
                          <option value="cashier">Cajero</option>
                          <option value="supervisor">Supervisor</option>
                        </select>
                      </div>

                      <div>
                        <label className="label" style={{ fontSize: 10 }}>
                          &nbsp;
                        </label>
                        <select
                          className="input input-sm"
                          value={assignments[branch.branch_id]?.userId ?? ""}
                          onChange={(e) =>
                            setAssign(branch.branch_id, "userId", e.target.value)
                          }
                          style={{ minWidth: 160 }}
                        >
                          <option value="">Seleccionar…</option>
                          {members.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>
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
            <CardTitle>Inventario inicial por puesto</CardTitle>
            <CardDescription>
              Cantidad de cada producto a entregar al abrir turno
            </CardDescription>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "hsl(var(--muted) / 0.4)" }}>
                  <th style={thStyle}>Producto</th>
                  {selectedBranches.map((b) => (
                    <th key={b.branch_id} style={{ ...thStyle, textAlign: "center" }}>
                      {b.name}
                    </th>
                  ))}
                  {selectedBranches.length === 0 && (
                    <th style={{ ...thStyle, textAlign: "center" }}>
                      (Selecciona puestos primero)
                    </th>
                  )}
                  <th style={{ ...thStyle, textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter((p) => p.status === 1)
                  .map((p) => {
                    const total = selectedBranches.reduce(
                      (s, b) => s + (inventory[b.branch_id]?.[p.id] ?? 0),
                      0
                    );
                    return (
                      <tr
                        key={p.id}
                        style={{ borderBottom: "1px solid hsl(var(--border))" }}
                      >
                        <td style={tdStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                background: "hsl(var(--muted))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 16,
                              }}
                            >
                              {p.emoji}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                              <div
                                className="t-xs"
                                style={{ color: "hsl(var(--muted-foreground))" }}
                              >
                                {fmt(p.price)}
                              </div>
                            </div>
                          </div>
                        </td>
                        {selectedBranches.map((b) => (
                          <td key={b.branch_id} style={{ ...tdStyle, textAlign: "center" }}>
                            <input
                              className="input input-sm t-num"
                              type="number"
                              min={0}
                              style={{
                                width: 70,
                                margin: "0 auto",
                                textAlign: "center",
                                fontWeight: 700,
                                fontFamily: "var(--font-display)",
                                display: "block",
                              }}
                              value={inventory[b.branch_id]?.[p.id] ?? 0}
                              onChange={(e) =>
                                setInventory((inv) => ({
                                  ...inv,
                                  [b.branch_id]: {
                                    ...inv[b.branch_id],
                                    [p.id]: Number(e.target.value),
                                  },
                                }))
                              }
                            />
                          </td>
                        ))}
                        {selectedBranches.length === 0 && (
                          <td style={{ ...tdStyle, textAlign: "center", color: "hsl(var(--muted-foreground))" }}>
                            —
                          </td>
                        )}
                        <td
                          style={{
                            ...tdStyle,
                            textAlign: "right",
                            fontWeight: 800,
                            fontFamily: "var(--font-display)",
                          }}
                          className="t-num"
                        >
                          {total}
                        </td>
                      </tr>
                    );
                  })}
                {products.filter((p) => p.status === 1).length === 0 && (
                  <tr>
                    <td
                      colSpan={selectedBranches.length + 2}
                      style={{
                        ...tdStyle,
                        textAlign: "center",
                        color: "hsl(var(--muted-foreground))",
                        padding: 32,
                      }}
                    >
                      No hay productos activos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
