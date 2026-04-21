import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, orgPath, crossAppApi, crossAppOrgPath } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

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

type SessionType = "partido" | "turno";
type Context = "gradas" | "mesa" | "caja";
type Role = "cashier" | "supervisor";

interface AssignmentEntry {
  userId: string;
  role: Role;
}

const STEPS = ["Sesión", "Puestos", "Asignaciones", "Confirmar"];

export default function SessionConfig({ onDone }: { onDone: () => void }) {
  const { user, org } = useAuthContext();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);

  // Step 0: session info
  const [sessionType, setSessionType] = useState<SessionType>("partido");
  const [sessionName, setSessionName] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [context, setContext] = useState<Context>("gradas");
  const [branchId, setBranchId] = useState("");

  // Step 1: active branches selection
  const [activeBranches, setActiveBranches] = useState<Set<string>>(new Set());

  // Step 2: per-branch assignments
  const [assignments, setAssignments] = useState<Record<string, AssignmentEntry>>({});

  const [error, setError] = useState<string | null>(null);

  const { data: branches = [] } = useQuery({
    queryKey: ["branches", org?.id],
    enabled: !!user && !!org,
    queryFn: () =>
      crossAppApi.get<Branch[]>(crossAppOrgPath(org!.id, "/branches?is_active=true")),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["org-users", org?.id],
    enabled: !!user && !!org && step === 2,
    queryFn: () =>
      api.get<Member[]>(orgPath(user!.userId, org!.id, "/members")),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      setError(null);
      // Build ISO start_time from date + time inputs
      const start_time = sessionDate && startTime
        ? new Date(`${sessionDate}T${startTime}:00`).toISOString()
        : new Date().toISOString();

      // 1. Create session
      const session = await crossAppApi.post<{ session_id: string }>(
        crossAppOrgPath(org!.id, "/sessions"),
        {
          name: sessionName,
          type: sessionType === "partido" ? "match" : "shift",
          context,
          start_time,
          branch_id: branchId || undefined,
        }
      );

      // 2. Create assignments for each selected branch
      const selectedBranches = Array.from(activeBranches);
      await Promise.all(
        selectedBranches
          .filter((bid) => assignments[bid]?.userId)
          .map((bid) =>
            crossAppApi.post(crossAppOrgPath(org!.id, "/assignments"), {
              session_id: session.session_id,
              user_id: assignments[bid].userId,
              branch_id: bid,
              role: assignments[bid].role ?? "cashier",
              start_time,
            })
          )
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard", org?.id] });
      qc.invalidateQueries({ queryKey: ["sessions", org?.id] });
      onDone();
    },
    onError: (err: Error) => {
      setError(err.message || "Error al crear sesión");
    },
  });

  const selectedBranchObjects = branches.filter((b) => activeBranches.has(b.branch_id));
  const CONTEXTS: Context[] = ["gradas", "mesa", "caja"];
  const ROLES: Role[] = ["cashier", "supervisor"];

  const canProceed = () => {
    if (step === 0) return sessionName.trim().length > 0 && sessionDate && startTime;
    if (step === 1) return activeBranches.size > 0;
    return true;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Stepper */}
      <div className="flex items-center px-6 py-4 bg-surface border-b border-surface-border shrink-0">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-barlow font-bold shrink-0",
                i < step
                  ? "bg-success text-white"
                  : i === step
                  ? "bg-primary text-white"
                  : "bg-surface-high text-muted"
              )}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span
              className={cn(
                "ml-2 text-sm font-barlow font-bold",
                i === step ? "text-foreground" : "text-muted"
              )}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mx-3",
                  i < step ? "bg-success" : "bg-surface-border"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {/* Step 0: Session info */}
        {step === 0 && (
          <>
            <div className="font-barlow font-extrabold text-xl text-foreground">
              Tipo de sesión
            </div>
            <div className="flex gap-3">
              {(["partido", "turno"] as SessionType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setSessionType(t)}
                  className={cn(
                    "flex-1 py-4 rounded-xl border font-barlow font-bold text-lg capitalize transition-colors",
                    sessionType === t
                      ? "bg-primary border-primary text-white"
                      : "bg-surface border-surface-border text-muted"
                  )}
                >
                  {t === "partido" ? "⚽ Partido" : "🍽 Turno"}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted tracking-widest font-barlow">
                {sessionType === "partido" ? "RIVAL / DESCRIPCIÓN" : "NOMBRE DEL TURNO"}
              </label>
              <input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder={sessionType === "partido" ? "vs Saprissa" : "Turno noche"}
                className="px-4 py-3 bg-surface border border-surface-border rounded-xl text-foreground font-barlow text-lg outline-none focus:border-primary"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs text-muted tracking-widest font-barlow">FECHA</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="px-4 py-3 bg-surface border border-surface-border rounded-xl text-foreground font-barlow outline-none focus:border-primary"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs text-muted tracking-widest font-barlow">INICIO</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="px-4 py-3 bg-surface border border-surface-border rounded-xl text-foreground font-barlow outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted tracking-widest font-barlow">CONTEXTO</label>
              <div className="flex gap-2">
                {CONTEXTS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setContext(c)}
                    className={cn(
                      "flex-1 py-2.5 rounded-lg border font-barlow font-bold text-sm capitalize transition-colors",
                      context === c
                        ? "bg-primary border-primary text-white"
                        : "bg-surface border-surface-border text-muted"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted tracking-widest font-barlow">SUCURSAL PRINCIPAL (opcional)</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="px-4 py-3 bg-surface border border-surface-border rounded-xl text-foreground font-barlow outline-none focus:border-primary"
              >
                <option value="">Ninguna</option>
                {branches.map((b) => (
                  <option key={b.branch_id} value={b.branch_id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Step 1: Select active branches */}
        {step === 1 && (
          <>
            <div className="font-barlow font-extrabold text-xl text-foreground">
              Puestos activos
            </div>
            {branches.length === 0 && (
              <div className="text-center text-muted font-barlow py-8">
                No hay sucursales disponibles. Crealas desde el panel de administración.
              </div>
            )}
            {branches.map((b) => (
              <button
                key={b.branch_id}
                onClick={() =>
                  setActiveBranches((prev) => {
                    const next = new Set(prev);
                    next.has(b.branch_id) ? next.delete(b.branch_id) : next.add(b.branch_id);
                    return next;
                  })
                }
                className={cn(
                  "flex items-center justify-between px-4 py-4 rounded-xl border transition-colors",
                  activeBranches.has(b.branch_id)
                    ? "bg-primary/10 border-primary"
                    : "bg-surface border-surface-border"
                )}
              >
                <div className="text-left">
                  <div className="font-barlow font-bold text-foreground">{b.name}</div>
                  <div className="text-muted text-xs capitalize">
                    {b.code} · {b.type}
                  </div>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center",
                    activeBranches.has(b.branch_id)
                      ? "bg-primary border-primary"
                      : "border-surface-border"
                  )}
                >
                  {activeBranches.has(b.branch_id) && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
              </button>
            ))}
          </>
        )}

        {/* Step 2: Assign cashiers per branch */}
        {step === 2 && (
          <>
            <div className="font-barlow font-extrabold text-xl text-foreground">
              Asignaciones
            </div>
            {selectedBranchObjects.map((branch) => (
              <div
                key={branch.branch_id}
                className="bg-surface border border-surface-border rounded-xl p-4 flex flex-col gap-3"
              >
                <div className="font-barlow font-bold text-foreground">{branch.name}</div>
                <div className="flex gap-3">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-xs text-muted font-barlow">VENDEDOR</label>
                    <select
                      value={assignments[branch.branch_id]?.userId ?? ""}
                      onChange={(e) =>
                        setAssignments((a) => ({
                          ...a,
                          [branch.branch_id]: {
                            ...a[branch.branch_id],
                            userId: e.target.value,
                            role: a[branch.branch_id]?.role ?? "cashier",
                          },
                        }))
                      }
                      className="px-3 py-2 bg-surface-high border border-surface-border rounded-lg text-foreground font-barlow text-sm outline-none"
                    >
                      <option value="">Seleccionar...</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-xs text-muted font-barlow">ROL</label>
                    <select
                      value={assignments[branch.branch_id]?.role ?? "cashier"}
                      onChange={(e) =>
                        setAssignments((a) => ({
                          ...a,
                          [branch.branch_id]: {
                            ...a[branch.branch_id],
                            role: e.target.value as Role,
                            userId: a[branch.branch_id]?.userId ?? "",
                          },
                        }))
                      }
                      className="px-3 py-2 bg-surface-high border border-surface-border rounded-lg text-foreground font-barlow text-sm outline-none"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r === "cashier" ? "Cajero" : "Supervisor"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <>
            <div className="font-barlow font-extrabold text-xl text-foreground">
              Confirmar sesión
            </div>
            <div className="bg-surface border border-surface-border rounded-xl p-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Tipo</span>
                <span className="text-foreground capitalize">
                  {sessionType === "partido" ? "Partido" : "Turno"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Nombre</span>
                <span className="text-foreground">{sessionName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Fecha</span>
                <span className="text-foreground">{sessionDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Inicio</span>
                <span className="text-foreground">{startTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Contexto</span>
                <span className="text-foreground capitalize">{context}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Puestos</span>
                <span className="text-foreground">{activeBranches.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Asignaciones</span>
                <span className="text-foreground">
                  {Object.values(assignments).filter((a) => a.userId).length}
                </span>
              </div>
            </div>
            {error && (
              <div className="text-destructive text-sm font-barlow text-center">{error}</div>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 p-6 bg-surface border-t border-surface-border shrink-0">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 py-3 bg-surface-high border border-surface-border rounded-xl font-barlow font-bold text-muted"
          >
            ← Atrás
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className={cn(
              "flex-1 py-3 rounded-xl font-barlow font-extrabold text-lg",
              canProceed()
                ? "bg-primary text-white"
                : "bg-surface-high text-muted cursor-not-allowed"
            )}
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="flex-1 py-3 bg-success text-white rounded-xl font-barlow font-extrabold text-lg disabled:opacity-50"
          >
            {mutation.isPending ? "Creando..." : "🚀 ACTIVAR SESIÓN"}
          </button>
        )}
      </div>
    </div>
  );
}
