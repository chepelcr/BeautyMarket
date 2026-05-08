import { useState } from "react";
import { Icon, Card, Input, Button, LocationSelect } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Branch, CreateBranchRequest, BranchType, BranchStatus, LocationData } from "@/types";

interface BranchFormProps {
  editing: Branch | null;
  onSave: (data: CreateBranchRequest) => void;
  isSaving: boolean;
  onClose: () => void;
}

export function BranchForm({ editing, onSave, isSaving, onClose }: BranchFormProps) {
  const { t } = useLanguage();
  const TYPE_LABEL: Record<BranchType, string> = { stand: t("puestos.stand"), restaurant: t("puestos.restaurant") };
  const STATUS_LABEL: Record<BranchStatus, string> = { 1: t("common.active"), 2: t("common.inactive"), 3: t("common.delete") };

  const [name, setName] = useState(editing?.name ?? "");
  const [code, setCode] = useState<number | "">(editing?.code ?? "");
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
      code: Number(code),
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
        <label className="t-label" style={{ display: "block", marginBottom: 8 }}>{t("session.sessionType")}</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {(["stand", "restaurant"] as BranchType[]).map((bt) => (
            <button
              key={bt}
              type="button"
              onClick={() => setType(bt)}
              style={{
                padding: "12px 16px", borderRadius: 10,
                border: `2px solid ${type === bt ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
                background: type === bt ? "hsl(var(--primary) / 0.08)" : "transparent",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                fontFamily: "var(--font-sans)", fontWeight: type === bt ? 700 : 500, fontSize: 14,
                color: type === bt ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                transition: "all 0.15s",
              }}
            >
              <Icon name={bt === "stand" ? "store" : "home"} size={15} />
              {TYPE_LABEL[bt]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="t-label" htmlFor="b-name" style={{ display: "block", marginBottom: 6 }}>
          {t("products.name")} <span style={{ color: "hsl(var(--destructive))" }}>*</span>
        </label>
        <Input id="b-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="ej. Puesto Principal, Sector Norte…" />
      </div>

      <div>
        <label className="t-label" htmlFor="b-code" style={{ display: "block", marginBottom: 6 }}>
          {t("products.sku")} <span style={{ color: "hsl(var(--destructive))" }}>*</span>
        </label>
        <Input
          id="b-code" required type="number" min={1} value={code}
          onChange={(e) => setCode(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="ej. 1"
          style={{ fontFamily: "var(--font-mono)" }}
        />
        <p className="t-xs" style={{ marginTop: 4, color: "hsl(var(--muted-foreground))" }}>
          Número único por organización (entero positivo).
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

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
        <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSaving}>
          {t("common.cancel")}
        </Button>
        <Button variant="primary" size="sm" type="submit" disabled={isSaving}>
          {isSaving ? t("common.saving") : editing ? t("common.save") : t("puestos.newStation")}
        </Button>
      </div>
    </form>
  );
}
