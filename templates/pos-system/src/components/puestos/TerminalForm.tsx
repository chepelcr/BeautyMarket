import { useState } from "react";
import { Input, Button } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import type { CreateTerminalRequest } from "@/types";

interface TerminalFormProps {
  branchId: string;
  onSave: (data: CreateTerminalRequest) => void;
  isSaving: boolean;
  onClose: () => void;
}

export function TerminalForm({ branchId, onSave, isSaving, onClose }: TerminalFormProps) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [code, setCode] = useState<number | "">("");
  const [deviceId, setDeviceId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ branch_id: branchId, name: name.trim(), code: Number(code), device_id: deviceId.trim() || undefined });
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
          id="t-code" required type="number" min={1} value={code}
          onChange={(e) => setCode(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="ej. 1"
          style={{ fontFamily: "var(--font-mono)" }}
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
          {t("common.cancel")}
        </Button>
        <Button variant="primary" size="sm" type="submit" disabled={isSaving}>
          {isSaving ? t("common.saving") : t("puestos.addTerminal")}
        </Button>
      </div>
    </form>
  );
}
