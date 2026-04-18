import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, orgPath } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Stand {
  id: string;
  name: string;
  branch: "estadio" | "restaurante";
}

interface User {
  id: string;
  name: string;
  email: string;
}

type SessionType = "partido" | "turno";
type Context = "gradas" | "mesa" | "caja";

const STEPS = ["Sesión", "Puestos", "Asignaciones", "Confirmar"];

export default function SessionConfig({ onDone }: { onDone: () => void }) {
  const { user, org } = useAuthContext();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);

  // Step 0
  const [sessionType, setSessionType] = useState<SessionType>("partido");
  const [sessionName, setSessionName] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Step 1
  const [activeStands, setActiveStands] = useState<Set<string>>(new Set());

  // Step 2: per-stand assignments
  const [assignments, setAssignments] = useState<
    Record<string, { userId: string; context: Context }>
  >({});

  const { data: stands = [] } = useQuery({
    queryKey: ["stands", org?.id],
    enabled: !!user && !!org,
    queryFn: () => api.get<Stand[]>(orgPath(user!.userId, org!.id, "/stands")),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["org-users", org?.id],
    enabled: !!user && !!org && step === 2,
    queryFn: () => api.get<User[]>(orgPath(user!.userId, org!.id, "/members")),
  });

  const mutation = useMutation({
    mutationFn: () =>
      api.post(orgPath(user!.userId, org!.id, "/sessions"), {
        type: sessionType,
        name: sessionName,
        date: sessionDate,
        startTime,
        endTime: sessionType === "turno" ? endTime : undefined,
        assignments: Array.from(activeStands).map((standId) => ({
          standId,
          userId: assignments[standId]?.userId,
          context: assignments[standId]?.context,
        })),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard", org?.id] });
      onDone();
    },
  });

  const selectedStands = stands.filter((s) => activeStands.has(s.id));
  const CONTEXTS: Context[] = ["gradas", "mesa", "caja"];

  return (
    <div className="flex flex-col h-full">
      {/* Stepper */}
      <div className="flex items-center px-6 py-4 bg-surface border-b border-surface-border shrink-0">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-barlow font-bold shrink-0",
                i < step ? "bg-success text-white" : i === step ? "bg-primary text-white" : "bg-surface-high text-muted"
              )}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span className={cn("ml-2 text-sm font-barlow font-bold", i === step ? "text-foreground" : "text-muted")}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={cn("flex-1 h-px mx-3", i < step ? "bg-success" : "bg-surface-border")} />
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {/* Step 0: Session type */}
        {step === 0 && (
          <>
            <div className="font-barlow font-extrabold text-xl text-foreground">Tipo de sesión</div>
            <div className="flex gap-3">
              {(["partido", "turno"] as SessionType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setSessionType(t)}
                  className={cn(
                    "flex-1 py-4 rounded-xl border font-barlow font-bold text-lg capitalize transition-colors",
                    sessionType === t ? "bg-primary border-primary text-white" : "bg-surface border-surface-border text-muted"
                  )}
                >
                  {t === "partido" ? "⚽ Partido" : "🍽 Turno"}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted tracking-widest font-barlow">
                {sessionType === "partido" ? "RIVAL" : "NOMBRE DEL TURNO"}
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
                <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)}
                  className="px-4 py-3 bg-surface border border-surface-border rounded-xl text-foreground font-barlow outline-none focus:border-primary" />
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs text-muted tracking-widest font-barlow">INICIO</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                  className="px-4 py-3 bg-surface border border-surface-border rounded-xl text-foreground font-barlow outline-none focus:border-primary" />
              </div>
              {sessionType === "turno" && (
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-xs text-muted tracking-widest font-barlow">FIN</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                    className="px-4 py-3 bg-surface border border-surface-border rounded-xl text-foreground font-barlow outline-none focus:border-primary" />
                </div>
              )}
            </div>
          </>
        )}

        {/* Step 1: Select stands */}
        {step === 1 && (
          <>
            <div className="font-barlow font-extrabold text-xl text-foreground">Puestos activos</div>
            {stands.map((s) => (
              <button
                key={s.id}
                onClick={() =>
                  setActiveStands((prev) => {
                    const next = new Set(prev);
                    next.has(s.id) ? next.delete(s.id) : next.add(s.id);
                    return next;
                  })
                }
                className={cn(
                  "flex items-center justify-between px-4 py-4 rounded-xl border transition-colors",
                  activeStands.has(s.id) ? "bg-primary/10 border-primary" : "bg-surface border-surface-border"
                )}
              >
                <div className="text-left">
                  <div className="font-barlow font-bold text-foreground">{s.name}</div>
                  <div className="text-muted text-xs capitalize">{s.branch}</div>
                </div>
                <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center",
                  activeStands.has(s.id) ? "bg-primary border-primary" : "border-surface-border")}>
                  {activeStands.has(s.id) && <span className="text-white text-xs">✓</span>}
                </div>
              </button>
            ))}
          </>
        )}

        {/* Step 2: Assign cashiers */}
        {step === 2 && (
          <>
            <div className="font-barlow font-extrabold text-xl text-foreground">Asignaciones</div>
            {selectedStands.map((stand) => (
              <div key={stand.id} className="bg-surface border border-surface-border rounded-xl p-4 flex flex-col gap-3">
                <div className="font-barlow font-bold text-foreground">{stand.name}</div>
                <div className="flex gap-3">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-xs text-muted font-barlow">VENDEDOR</label>
                    <select
                      value={assignments[stand.id]?.userId ?? ""}
                      onChange={(e) => setAssignments((a) => ({ ...a, [stand.id]: { ...a[stand.id], userId: e.target.value, context: a[stand.id]?.context ?? "gradas" } }))}
                      className="px-3 py-2 bg-surface-high border border-surface-border rounded-lg text-foreground font-barlow text-sm outline-none"
                    >
                      <option value="">Seleccionar...</option>
                      {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-xs text-muted font-barlow">CONTEXTO</label>
                    <select
                      value={assignments[stand.id]?.context ?? "gradas"}
                      onChange={(e) => setAssignments((a) => ({ ...a, [stand.id]: { ...a[stand.id], context: e.target.value as Context, userId: a[stand.id]?.userId ?? "" } }))}
                      className="px-3 py-2 bg-surface-high border border-surface-border rounded-lg text-foreground font-barlow text-sm outline-none"
                    >
                      {CONTEXTS.map((c) => <option key={c} value={c}>{c}</option>)}
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
            <div className="font-barlow font-extrabold text-xl text-foreground">Confirmar sesión</div>
            <div className="bg-surface border border-surface-border rounded-xl p-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">Tipo</span><span className="text-foreground capitalize">{sessionType}</span></div>
              <div className="flex justify-between"><span className="text-muted">Nombre</span><span className="text-foreground">{sessionName}</span></div>
              <div className="flex justify-between"><span className="text-muted">Fecha</span><span className="text-foreground">{sessionDate}</span></div>
              <div className="flex justify-between"><span className="text-muted">Inicio</span><span className="text-foreground">{startTime}</span></div>
              <div className="flex justify-between"><span className="text-muted">Puestos</span><span className="text-foreground">{activeStands.size}</span></div>
            </div>
            {mutation.isError && (
              <div className="text-destructive text-sm font-barlow text-center">Error al crear sesión. Intentá de nuevo.</div>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 p-6 bg-surface border-t border-surface-border shrink-0">
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)} className="flex-1 py-3 bg-surface-high border border-surface-border rounded-xl font-barlow font-bold text-muted">
            ← Atrás
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep((s) => s + 1)} className="flex-1 py-3 bg-primary text-white rounded-xl font-barlow font-extrabold text-lg">
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
