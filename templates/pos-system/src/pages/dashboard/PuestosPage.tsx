import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { crossAppApi, crossAppOrgPath } from "@/lib/api";
import {
  Icon, Card, Badge, Button, Input, Drawer, Menu, EmptyState, LocationSelect,
} from "@/components/ui";
import type {
  Branch, Terminal, BranchListResponse, TerminalListResponse,
  CreateBranchRequest, CreateTerminalRequest, BranchType, BranchStatus,
  LocationData,
} from "@/types";

// ─── helpers ────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<BranchType, string> = { stand: "Stand", restaurant: "Restaurante" };
const STATUS_LABEL: Record<BranchStatus, string> = { 1: "Activo", 2: "Inactivo", 3: "Eliminado" };
const STATUS_VARIANT: Record<BranchStatus, "success" | "secondary" | "destructive"> = {
  1: "success", 2: "secondary", 3: "destructive",
};

// ─── Branch form (inside Drawer) ─────────────────────────────────────────────

interface BranchFormProps {
  editing: Branch | null;
  onSave: (data: CreateBranchRequest) => void;
  isSaving: boolean;
  onClose: () => void;
}

function BranchForm({ editing, onSave, isSaving, onClose }: BranchFormProps) {
  const [name, setName] = useState(editing?.name ?? "");
  const [code, setCode] = useState(editing?.code ?? "");
  const [type, setType] = useState<BranchType>(editing?.type ?? "stand");
  const [phone, setPhone] = useState(editing?.phone ?? "");
  const [location, setLocation] = useState<LocationData>({
    state_id: editing?.location?.state_id ?? null,
    county_id: editing?.location?.county_id ?? null,
    district_id: editing?.location?.district_id ?? null,
    neighborhood_id: editing?.location?.neighborhood_id ?? null,
    address: editing?.location?.address ?? "",
  });

  const hasLocation = location.state_id || location.address;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      type,
      phone: phone.trim() || undefined,
      location: hasLocation ? {
        state_id: location.state_id,
        county_id: location.county_id,
        district_id: location.district_id,
        neighborhood_id: location.neighborhood_id,
        address: location.address || undefined,
      } : undefined,
    });
  };

  return (
    <form id="branch-form" onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Type toggle */}
      <div>
        <label className="t-label" style={{ display: "block", marginBottom: 8 }}>Tipo de puesto</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {(["stand", "restaurant"] as BranchType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              style={{
                padding: "12px 16px", borderRadius: 10,
                border: `2px solid ${type === t ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
                background: type === t ? "hsl(var(--primary) / 0.08)" : "transparent",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                fontFamily: "var(--font-sans)", fontWeight: type === t ? 700 : 500, fontSize: 14,
                color: type === t ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                transition: "all 0.15s",
              }}
            >
              <Icon name={t === "stand" ? "store" : "home"} size={15} />
              {TYPE_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="t-label" htmlFor="b-name" style={{ display: "block", marginBottom: 6 }}>
          Nombre <span style={{ color: "hsl(var(--destructive))" }}>*</span>
        </label>
        <Input id="b-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="ej. Puesto Principal, Sector Norte…" />
      </div>

      <div>
        <label className="t-label" htmlFor="b-code" style={{ display: "block", marginBottom: 6 }}>
          Código <span style={{ color: "hsl(var(--destructive))" }}>*</span>
        </label>
        <Input
          id="b-code" required value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ej. PP-001" maxLength={20}
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}
        />
        <p className="t-xs" style={{ marginTop: 4, color: "hsl(var(--muted-foreground))" }}>
          Identificador único corto. Se guarda en mayúsculas.
        </p>
      </div>

      <div>
        <label className="t-label" htmlFor="b-phone" style={{ display: "block", marginBottom: 6 }}>Teléfono</label>
        <Input id="b-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="ej. 2222-3333" />
      </div>

      <div style={{ height: 1, background: "hsl(var(--border))", margin: "4px 0" }} />

      <LocationSelect value={location} onChange={setLocation} />

      {editing && (
        <Card style={{ padding: 14, background: "hsl(var(--muted) / 0.4)" }}>
          <div className="t-label" style={{ marginBottom: 6 }}>Estado actual</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className={`status-dot status-dot-${editing.status === 1 ? "success" : "warning"}`} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>{STATUS_LABEL[editing.status]}</span>
          </div>
          <p className="t-xs" style={{ marginTop: 6, color: "hsl(var(--muted-foreground))" }}>
            Para cambiar el estado usá las acciones en la tarjeta.
          </p>
        </Card>
      )}

      {/* Footer buttons */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
        <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button variant="primary" size="sm" type="submit" disabled={isSaving}>
          {isSaving ? "Guardando…" : editing ? "Guardar cambios" : "Crear puesto"}
        </Button>
      </div>
    </form>
  );
}

// ─── Terminal form (inside Drawer) ───────────────────────────────────────────

interface TerminalFormProps {
  branchId: string;
  onSave: (data: CreateTerminalRequest) => void;
  isSaving: boolean;
  onClose: () => void;
}

function TerminalForm({ branchId, onSave, isSaving, onClose }: TerminalFormProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [deviceId, setDeviceId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ branch_id: branchId, name: name.trim(), code: code.trim().toUpperCase(), device_id: deviceId.trim() || undefined });
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <label className="t-label" htmlFor="t-name" style={{ display: "block", marginBottom: 6 }}>
          Nombre <span style={{ color: "hsl(var(--destructive))" }}>*</span>
        </label>
        <Input id="t-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="ej. Caja 1" />
      </div>
      <div>
        <label className="t-label" htmlFor="t-code" style={{ display: "block", marginBottom: 6 }}>
          Código <span style={{ color: "hsl(var(--destructive))" }}>*</span>
        </label>
        <Input
          id="t-code" required value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ej. T-001" maxLength={20}
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}
        />
      </div>
      <div>
        <label className="t-label" htmlFor="t-device" style={{ display: "block", marginBottom: 6 }}>ID de dispositivo</label>
        <Input
          id="t-device" value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          placeholder="ej. tablet-01 (opcional)"
          style={{ fontFamily: "var(--font-mono)" }}
        />
        <p className="t-xs" style={{ marginTop: 4, color: "hsl(var(--muted-foreground))" }}>
          Identificador del dispositivo físico. Opcional.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
        <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button variant="primary" size="sm" type="submit" disabled={isSaving}>
          {isSaving ? "Guardando…" : "Agregar terminal"}
        </Button>
      </div>
    </form>
  );
}

// ─── Terminal row ─────────────────────────────────────────────────────────────

function TerminalRow({ terminal, isLast }: { terminal: Terminal; isLast: boolean }) {
  const isActive = terminal.status === 1;
  const lastSeen = terminal.last_seen_at
    ? new Date(terminal.last_seen_at).toLocaleString("es-CR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", borderBottom: isLast ? "none" : "1px solid hsl(var(--border) / 0.4)" }}>
      <span className={`status-dot status-dot-${isActive ? "success" : "warning"}`} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{terminal.name}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, background: "hsl(var(--muted))", padding: "1px 6px", borderRadius: 4, letterSpacing: "0.05em" }}>
            {terminal.code}
          </span>
        </div>
        {lastSeen && <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))", marginTop: 1 }}>Último sync: {lastSeen}</div>}
        {terminal.device_id && <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))", marginTop: 1, fontFamily: "var(--font-mono)" }}>{terminal.device_id}</div>}
      </div>
      <Badge variant={STATUS_VARIANT[terminal.status]}>{STATUS_LABEL[terminal.status]}</Badge>
    </div>
  );
}

// ─── Branch card ─────────────────────────────────────────────────────────────

interface BranchCardProps {
  branch: Branch;
  orgId: string;
  onEdit: (b: Branch) => void;
  onStatusChange: (b: Branch, status: BranchStatus) => void;
  onAddTerminal: (b: Branch) => void;
}

function BranchCard({ branch, orgId, onEdit, onStatusChange, onAddTerminal }: BranchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isActive = branch.status === 1;
  const typeColor = branch.type === "stand" ? "hsl(var(--primary))" : "hsl(220 80% 55%)";

  const { data: terminalsData } = useQuery({
    queryKey: ["terminals", orgId, branch.branch_id],
    enabled: expanded,
    queryFn: () => crossAppApi.get<TerminalListResponse>(crossAppOrgPath(orgId, `/branches/${branch.branch_id}/terminals`)),
  });
  const terminals = terminalsData?.data ?? [];

  const menuItems = [
    { label: "Editar",      icon: "edit",        action: () => onEdit(branch),               hidden: branch.status === 3 },
    { label: "Activar",     icon: "checkCircle", action: () => onStatusChange(branch, 1),    hidden: branch.status !== 2, color: "hsl(var(--success))" },
    { label: "Desactivar",  icon: "xCircle",     action: () => onStatusChange(branch, 2),    hidden: branch.status !== 1 },
    { label: "Eliminar",    icon: "trash",       action: () => onStatusChange(branch, 3),    hidden: branch.status === 3, color: "hsl(var(--destructive))" },
  ];

  return (
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

      {/* Divider */}
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
              <span className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Sin terminales registradas.</span>
            </div>
          ) : (
            terminals.map((t, i) => <TerminalRow key={t.terminal_id} terminal={t} isLast={i === terminals.length - 1} />)
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
                Agregar terminal
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function PuestosPage() {
  const qc = useQueryClient();
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);

  const [filter, setFilter] = useState<"all" | BranchType>("all");
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [search, setSearch] = useState("");

  const [branchDrawer, setBranchDrawer] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [termDrawer, setTermDrawer] = useState(false);
  const [addTermBranch, setAddTermBranch] = useState<Branch | null>(null);

  const searchParam = showOnlyActive ? "status:1" : "";
  const { data: branchesData, isLoading } = useQuery({
    queryKey: ["branches", org?.id, searchParam],
    enabled: !!org,
    queryFn: () => crossAppApi.get<BranchListResponse>(crossAppOrgPath(org!.id, `/branches${searchParam ? `?search=${searchParam}` : ""}`)),
  });

  const branches = (branchesData?.data ?? []).filter((b) => {
    if (filter !== "all" && b.type !== filter) return false;
    if (search && !b.name.toLowerCase().includes(search.toLowerCase()) && !b.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateBranchRequest) => crossAppApi.post(crossAppOrgPath(org!.id, "/branches"), data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["branches", org?.id] }); setBranchDrawer(false); setEditingBranch(null); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBranchRequest> }) =>
      crossAppApi.patch(crossAppOrgPath(org!.id, `/branches/${id}`), data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["branches", org?.id] }); setBranchDrawer(false); setEditingBranch(null); },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BranchStatus }) =>
      crossAppApi.patch(crossAppOrgPath(org!.id, `/branches/${id}`), { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["branches", org?.id] }),
  });

  const addTerminalMutation = useMutation({
    mutationFn: ({ branchId, data }: { branchId: string; data: CreateTerminalRequest }) =>
      crossAppApi.post(crossAppOrgPath(org!.id, `/branches/${branchId}/terminals`), data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["terminals", org?.id, vars.branchId] });
      qc.invalidateQueries({ queryKey: ["branches", org?.id] });
      setTermDrawer(false);
      setAddTermBranch(null);
    },
  });

  const handleSaveBranch = (data: CreateBranchRequest) => {
    editingBranch ? updateMutation.mutate({ id: editingBranch.branch_id, data }) : createMutation.mutate(data);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending || statusMutation.isPending;
  const total = branchesData?.data?.length ?? 0;
  const activeCount = branchesData?.data?.filter((b) => b.status === 1).length ?? 0;

  return (
    <div style={{ padding: "24px 24px 48px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Page header */}
      <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="t-h1" style={{ marginBottom: 4 }}>Puestos</h1>
          <p className="t-body" style={{ color: "hsl(var(--muted-foreground))" }}>
            {total === 0 ? "Sin puestos registrados." : `${activeCount} activos · ${total} en total`}
          </p>
        </div>
        <Button variant="primary" icon="plus" onClick={() => { setEditingBranch(null); setBranchDrawer(true); }}>
          Nuevo puesto
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 340 }}>
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "hsl(var(--muted-foreground))", pointerEvents: "none" }}>
            <Icon name="search" size={14} />
          </div>
          <Input
            inputSize="sm"
            style={{ paddingLeft: 36 }}
            placeholder="Buscar por nombre o código…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "stand", "restaurant"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline"}`}>
              {f === "all" ? "Todos" : TYPE_LABEL[f]}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setShowOnlyActive((v) => !v)} className={`btn btn-sm ${showOnlyActive ? "btn-success" : "btn-outline"}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name={showOnlyActive ? "checkCircle" : "eye"} size={14} />
          Solo activos
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 140, borderRadius: 12, background: "hsl(var(--muted) / 0.5)", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : branches.length === 0 ? (
        <EmptyState
          icon="store"
          title={search || filter !== "all" ? "Sin resultados" : "No hay puestos registrados"}
          description={search || filter !== "all" ? "Probá con otros filtros." : "Creá el primer puesto para comenzar."}
          action={!search && filter === "all" ? (
            <Button variant="primary" icon="plus" onClick={() => { setEditingBranch(null); setBranchDrawer(true); }}>
              Crear primer puesto
            </Button>
          ) : undefined}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {branches.map((branch) => (
            <BranchCard
              key={branch.branch_id}
              branch={branch}
              orgId={org!.id}
              onEdit={(b) => { setEditingBranch(b); setBranchDrawer(true); }}
              onStatusChange={(b, s) => statusMutation.mutate({ id: b.branch_id, status: s })}
              onAddTerminal={(b) => { setAddTermBranch(b); setTermDrawer(true); }}
            />
          ))}
        </div>
      )}

      {/* Branch drawer */}
      <Drawer
        open={branchDrawer}
        onClose={() => { setBranchDrawer(false); setEditingBranch(null); }}
        title={editingBranch ? "Editar puesto" : "Nuevo puesto"}
        subtitle={editingBranch ? `Código: ${editingBranch.code}` : "Completá los datos del puesto"}
        icon="store"
      >
        <BranchForm
          editing={editingBranch}
          onSave={handleSaveBranch}
          isSaving={isSaving}
          onClose={() => { setBranchDrawer(false); setEditingBranch(null); }}
        />
      </Drawer>

      {/* Terminal drawer */}
      <Drawer
        open={termDrawer}
        onClose={() => { setTermDrawer(false); setAddTermBranch(null); }}
        title="Nueva terminal"
        subtitle={addTermBranch?.name}
        icon="sliders"
        iconBg="hsl(220 100% 60% / 0.12)"
        iconColor="hsl(220 100% 55%)"
        width={400}
      >
        {addTermBranch && (
          <TerminalForm
            branchId={addTermBranch.branch_id}
            onSave={(data) => addTerminalMutation.mutate({ branchId: addTermBranch.branch_id, data })}
            isSaving={addTerminalMutation.isPending}
            onClose={() => { setTermDrawer(false); setAddTermBranch(null); }}
          />
        )}
      </Drawer>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
