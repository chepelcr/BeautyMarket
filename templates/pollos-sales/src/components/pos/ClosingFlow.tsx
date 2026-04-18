import { useState } from "react";
import { cn, fmt } from "@/lib/utils";
import { api, orgPath } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";

interface ClosingFlowProps {
  assignmentId: string;
  expectedCash: number;
  expectedSinpe: number;
  expectedCard: number;
  onClose: () => void;
}

const STEPS = ["Resumen", "Declarar", "Diferencias", "Confirmar"];

export default function ClosingFlow({
  assignmentId,
  expectedCash,
  expectedSinpe,
  expectedCard,
  onClose,
}: ClosingFlowProps) {
  const { user, org } = useAuthContext();
  const [step, setStep] = useState(0);
  const [declared, setDeclared] = useState({ cash: "", sinpe: "", card: "" });
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const declCash = Number(declared.cash) || 0;
  const declSinpe = Number(declared.sinpe) || 0;
  const declCard = Number(declared.card) || 0;
  const diffCash = declCash - expectedCash;
  const diffSinpe = declSinpe - expectedSinpe;
  const diffCard = declCard - expectedCard;
  const hasDiff = diffCash !== 0 || diffSinpe !== 0 || diffCard !== 0;

  const canSubmit = !hasDiff || notes.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      await api.post(orgPath(user!.userId, org!.id, "/closings"), {
        assignmentId,
        declaredCash: declCash,
        declaredSinpe: declSinpe,
        declaredCard: declCard,
        notes,
      });
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
        <div className="w-20 h-20 rounded-full bg-success/10 border-2 border-success flex items-center justify-center text-4xl">
          ✓
        </div>
        <div className="text-success font-barlow font-extrabold text-2xl tracking-wide text-center">
          CIERRE ENVIADO
        </div>
        <div className="text-muted text-sm text-center">
          El gerente revisará y aprobará tu cierre.
        </div>
        <button
          onClick={onClose}
          className="w-full py-4 bg-primary text-white rounded-xl font-barlow font-extrabold text-xl"
        >
          CERRAR
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Stepper */}
      <div className="flex items-center px-4 py-3 bg-surface border-b border-surface-border shrink-0">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-barlow font-bold shrink-0",
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
                "ml-1.5 text-xs font-barlow font-bold hidden sm:block",
                i === step ? "text-foreground" : "text-muted"
              )}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mx-2",
                  i < step ? "bg-success" : "bg-surface-border"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Step 0: Summary */}
        {step === 0 && (
          <>
            <div className="font-barlow font-extrabold text-xl text-foreground">
              Resumen esperado
            </div>
            {[
              { label: "Efectivo", val: expectedCash },
              { label: "SINPE", val: expectedSinpe },
              { label: "Tarjeta", val: expectedCard },
            ].map(({ label, val }) => (
              <div
                key={label}
                className="flex justify-between items-center bg-surface border border-surface-border rounded-xl px-4 py-3"
              >
                <span className="text-muted font-barlow">{label}</span>
                <span className="text-primary font-barlow font-extrabold text-xl">
                  {fmt(val)}
                </span>
              </div>
            ))}
          </>
        )}

        {/* Step 1: Declare */}
        {step === 1 && (
          <>
            <div className="font-barlow font-extrabold text-xl text-foreground">
              Ingresá los montos contados
            </div>
            {(
              [
                { key: "cash", label: "Efectivo" },
                { key: "sinpe", label: "SINPE" },
                { key: "card", label: "Tarjeta" },
              ] as const
            ).map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-xs text-muted tracking-widest font-barlow">
                  {label.toUpperCase()}
                </label>
                <input
                  type="number"
                  placeholder="₡0"
                  value={declared[key]}
                  onChange={(e) =>
                    setDeclared((d) => ({ ...d, [key]: e.target.value }))
                  }
                  className="px-4 py-3 bg-surface-high border border-surface-border rounded-xl text-foreground font-barlow font-bold text-2xl outline-none focus:border-primary"
                />
              </div>
            ))}
          </>
        )}

        {/* Step 2: Differences */}
        {step === 2 && (
          <>
            <div className="font-barlow font-extrabold text-xl text-foreground">
              Diferencias
            </div>
            {[
              { label: "Efectivo", exp: expectedCash, decl: declCash, diff: diffCash },
              { label: "SINPE", exp: expectedSinpe, decl: declSinpe, diff: diffSinpe },
              { label: "Tarjeta", exp: expectedCard, decl: declCard, diff: diffCard },
            ].map(({ label, exp, decl, diff }) => (
              <div
                key={label}
                className="bg-surface border border-surface-border rounded-xl p-4 flex flex-col gap-2"
              >
                <div className="font-barlow font-bold text-foreground">{label}</div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Esperado</span>
                  <span className="text-foreground">{fmt(exp)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Declarado</span>
                  <span className="text-foreground">{fmt(decl)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-muted">Diferencia</span>
                  <span
                    className={
                      diff === 0
                        ? "text-success"
                        : diff > 0
                        ? "text-blue-400"
                        : "text-destructive"
                    }
                  >
                    {diff >= 0 ? "+" : ""}
                    {fmt(diff)}
                  </span>
                </div>
              </div>
            ))}
            {hasDiff && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-warning tracking-widest font-barlow">
                  JUSTIFICACIÓN (requerida)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explicá la diferencia..."
                  rows={3}
                  className="px-4 py-3 bg-surface-high border border-warning/40 rounded-xl text-foreground font-barlow text-sm outline-none focus:border-warning resize-none"
                />
              </div>
            )}
          </>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <>
            <div className="font-barlow font-extrabold text-xl text-foreground">
              Confirmar cierre
            </div>
            <div className="bg-surface border border-surface-border rounded-xl p-4 text-sm text-muted">
              Al confirmar, tu cierre será enviado al gerente para revisión. Esta
              acción no se puede deshacer.
            </div>
            {hasDiff && notes && (
              <div className="bg-warning/10 border border-warning/30 rounded-xl px-4 py-3 text-warning text-sm">
                📝 {notes}
              </div>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 p-4 bg-surface border-t border-surface-border shrink-0">
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
            className="flex-1 py-3 bg-primary text-white rounded-xl font-barlow font-extrabold text-lg"
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className={cn(
              "flex-1 py-3 rounded-xl font-barlow font-extrabold text-lg",
              canSubmit && !loading
                ? "bg-success text-white"
                : "bg-surface-high text-muted cursor-not-allowed"
            )}
          >
            {loading ? "Enviando..." : "✓ CONFIRMAR CIERRE"}
          </button>
        )}
      </div>
    </div>
  );
}
