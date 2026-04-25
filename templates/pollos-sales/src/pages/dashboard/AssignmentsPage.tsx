import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, orgPath, crossAppApi, crossAppOrgPath } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { cn } from "@/lib/utils";
import type { BranchListResponse } from "@/types";

interface Assignment {
  assignment_id: string;
  user_id: string;
  branch_id: string;
  session_id: string;
  terminal_id: string | null;
  role: "cashier" | "supervisor";
  start_time: string;
  is_active: boolean;
}

interface Session {
  session_id: string;
  name: string;
  type: string;
  is_active: boolean;
}

interface Branch {
  branch_id: string;
  name: string;
  code: string;
  status: number;
}

interface Member {
  id: string;
  name: string;
  email: string;
}

type Role = "cashier" | "supervisor";

export default function AssignmentsPage() {
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [sessionId, setSessionId] = useState("");
  const [userId, setUserId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [role, setRole] = useState<Role>("cashier");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["assignments", org?.id],
    enabled: !!user && !!org,
    queryFn: () =>
      crossAppApi.get<Assignment[]>(crossAppOrgPath(org!.id, "/assignments?is_active=true")),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions-active", org?.id],
    enabled: !!user && !!org && showForm,
    queryFn: () =>
      crossAppApi.get<Session[]>(crossAppOrgPath(org!.id, "/sessions?is_active=true")),
  });

  const { data: branchesResponse } = useQuery({
    queryKey: ["branches", org?.id],
    enabled: !!user && !!org && showForm,
    queryFn: () =>
      crossAppApi.get<BranchListResponse>(crossAppOrgPath(org!.id, "/branches?search=status:1")),
  });
  const branches: Branch[] = branchesResponse?.data ?? [];

  const { data: members = [] } = useQuery({
    queryKey: ["org-users", org?.id],
    enabled: !!user && !!org && showForm,
    queryFn: () =>
      api.get<Member[]>(orgPath(user!.userId, org!.id, "/members")),
  });

  const createMutation = useMutation({
    mutationFn: () => {
      if (!sessionId || !userId || !branchId) throw new Error("Completá todos los campos requeridos");
      const start_time = new Date().toISOString();
      return api.post(crossAppOrgPath(org!.id, "/assignments"), {
        session_id: sessionId,
        user_id: userId,
        branch_id: branchId,
        role,
        start_time,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments", org?.id] });
      setShowForm(false);
      setSessionId("");
      setUserId("");
      setBranchId("");
      setRole("cashier");
      setFormError(null);
    },
    onError: (err: Error) => {
      setFormError(err.message || "Error al crear asignación");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (assignmentId: string) =>
      api.patch(crossAppOrgPath(org!.id, `/assignments/${assignmentId}`), {
        is_active: false,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments", org?.id] });
    },
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="font-barlow font-extrabold text-lg text-foreground">
          Asignaciones activas
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-primary text-white rounded-lg font-barlow font-bold text-sm"
        >
          {showForm ? "✕ Cancelar" : "＋ Nueva asignación"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-surface border border-surface-border rounded-xl p-4 flex flex-col gap-3">
          <div className="font-barlow font-bold text-foreground">Nueva asignación</div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted tracking-widest font-barlow">SESIÓN</label>
            <select
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="px-3 py-2 bg-surface-high border border-surface-border rounded-lg text-foreground font-barlow text-sm outline-none focus:border-primary"
            >
              <option value="">Seleccionar sesión...</option>
              {sessions.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  {s.name} ({s.type === "match" ? "Partido" : "Turno"})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted tracking-widest font-barlow">VENDEDOR</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="px-3 py-2 bg-surface-high border border-surface-border rounded-lg text-foreground font-barlow text-sm outline-none focus:border-primary"
            >
              <option value="">Seleccionar miembro...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-xs text-muted tracking-widest font-barlow">PUESTO</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="px-3 py-2 bg-surface-high border border-surface-border rounded-lg text-foreground font-barlow text-sm outline-none focus:border-primary"
              >
                <option value="">Seleccionar puesto...</option>
                {branches.map((b) => (
                  <option key={b.branch_id} value={b.branch_id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-xs text-muted tracking-widest font-barlow">ROL</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="px-3 py-2 bg-surface-high border border-surface-border rounded-lg text-foreground font-barlow text-sm outline-none focus:border-primary"
              >
                <option value="cashier">Cajero</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>
          </div>

          {formError && (
            <div className="text-destructive text-sm font-barlow">{formError}</div>
          )}

          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !sessionId || !userId || !branchId}
            className="py-3 bg-success text-white rounded-xl font-barlow font-extrabold text-base disabled:opacity-50"
          >
            {createMutation.isPending ? "Asignando..." : "✓ CREAR ASIGNACIÓN"}
          </button>
        </div>
      )}

      {/* Assignments list */}
      {isLoading && (
        <div className="text-center text-muted font-barlow py-8 animate-pulse">
          Cargando asignaciones...
        </div>
      )}
      {!isLoading && assignments.length === 0 && (
        <div className="text-center text-muted font-barlow py-12">
          No hay asignaciones activas.
        </div>
      )}
      {assignments.map((a) => (
        <div
          key={a.assignment_id}
          className="bg-surface border border-surface-border rounded-xl p-4 flex items-center justify-between"
        >
          <div>
            <div className="font-barlow font-bold text-foreground">
              {a.user_id}
            </div>
            <div className="text-muted text-xs mt-0.5">
              <span
                className={cn(
                  "inline-block px-2 py-0.5 rounded text-[10px] font-bold mr-2",
                  a.role === "supervisor"
                    ? "bg-primary/20 text-primary"
                    : "bg-surface-high text-muted"
                )}
              >
                {a.role === "cashier" ? "Cajero" : "Supervisor"}
              </span>
              Puesto: {a.branch_id} · Inicio: {new Date(a.start_time).toLocaleTimeString("es-CR")}
            </div>
          </div>
          <button
            onClick={() => deactivateMutation.mutate(a.assignment_id)}
            disabled={deactivateMutation.isPending}
            className="ml-4 px-3 py-1.5 bg-destructive/20 border border-destructive/30 text-destructive font-barlow font-bold text-xs rounded-lg hover:bg-destructive/30 transition-colors disabled:opacity-50"
          >
            Finalizar
          </button>
        </div>
      ))}
    </div>
  );
}
