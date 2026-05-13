import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ROUTES } from "@/routePaths";
import { useOrgContext } from "@/contexts/OrgContext";
import {
  useClient,
  useUpdateClient,
  useUpdateClientStatus,
  clientDisplayName,
  formatPhone,
  type Client,
  type CreateClientDto,
} from "@/hooks/useClients";
import ClientFormBody from "@/components/clients/ClientFormBody";
import { ID_TYPE_SHORT, ID_TYPE_LABEL } from "@/lib/enums";
import { Card, Icon, Drawer, Button, Badge, Menu } from "@/components/ui";

// ─── Design tokens ─────────────────────────────────────────────────────────
const T = {
  surface:    "hsl(var(--card))",
  border:     "hsl(var(--border))",
  rose:       "#D4A874",
  roseLight:  "rgba(212,168,116,0.12)",
  roseBorder: "rgba(212,168,116,0.25)",
  text:       "hsl(var(--foreground))",
  muted:      "hsl(var(--muted-foreground))",
  fontDisplay:"'Cormorant Garamond', Georgia, serif",
  fontUI:     "'DM Sans', 'Barlow', system-ui, sans-serif",
} as const;


const AVATAR_COLORS: [string, string][] = [
  ["#D4A874", "#1C1410"], ["#64D2FF", "#0A1A22"], ["#32D74B", "#0A1A0A"],
  ["#FF9F0A", "#1C1205"], ["#BF5AF2", "#150A1C"], ["#FF453A", "#1C0A0A"],
];
function avatarColor(name: string | null | undefined): [string, string] {
  if (!name) return AVATAR_COLORS[0];
  return AVATAR_COLORS[name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
}
function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("") || "?";
}

function buildForm(client?: Client | null): CreateClientDto {
  return {
    customer_type: client?.customer_type ?? 3,
    client_name: client?.client_name ?? "",
    business_name: client?.business_name ?? "",
    client_gln: client?.client_gln ?? "",
    nationality: client?.nationality ?? "188",
    email: client?.email ?? "",
    identification: { code: client?.identification?.code ?? "01", number: client?.identification?.number ?? "" },
    phone: { country_code: client?.phone?.country_code ?? "188", area_code: client?.phone?.area_code ?? "", number: client?.phone?.number ?? "", description: "" },
    residence: { state_id: client?.residence?.state_id ?? undefined, county_id: client?.residence?.county_id ?? undefined, district_id: client?.residence?.district_id ?? undefined, neighborhood_id: client?.residence?.neighborhood_id ?? undefined, address: client?.residence?.address ?? "" },
  };
}

// ─── Edit Drawer ───────────────────────────────────────────────────────────
function EditDrawer({ open, onClose, client }: { open: boolean; onClose: () => void; client?: Client | null }) {
  const { orgId } = useOrgContext();
  const updateMutation = useUpdateClient(orgId);
  const [form, setForm] = useState<CreateClientDto>(() => buildForm(client));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) { setForm(buildForm(client)); setError(null); }
  }, [open, client]);

  async function handleSave() {
    if (!form.business_name?.trim() && !form.client_gln?.trim()) {
      setError("Se requiere al menos razón social o código GLN."); return;
    }
    if (!form.identification?.number?.trim()) {
      setError("El número de identificación es requerido."); return;
    }
    if (!form.email?.trim()) {
      setError("El correo electrónico es requerido."); return;
    }
    setError(null);
    const dto: CreateClientDto = {
      customer_type: form.customer_type,
      nationality: form.nationality,
      ...(form.client_name?.trim() && { client_name: form.client_name.trim() }),
      ...(form.business_name?.trim() && { business_name: form.business_name.trim() }),
      ...(form.client_gln?.trim() && { client_gln: form.client_gln.trim() }),
      email: form.email.trim(), // Always include email since it's required
      ...((form.identification?.code || form.identification?.number) && { identification: { code: form.identification.code || undefined, number: form.identification.number || undefined } }),
      ...((form.phone?.country_code || form.phone?.number) && { phone: { country_code: form.phone.country_code || undefined, area_code: form.phone.area_code || undefined, number: form.phone.number || undefined } }),
      ...((form.residence?.state_id || form.residence?.address) && { residence: { state_id: form.residence.state_id || undefined, county_id: form.residence.county_id || undefined, district_id: form.residence.district_id || undefined, neighborhood_id: form.residence.neighborhood_id || undefined, address: form.residence.address || undefined } }),
    };
    try {
      await updateMutation.mutateAsync({ clientId: client!.client_id, dto });
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar.");
    }
  }

  const saving = updateMutation.isPending;

  return (
    <Drawer
      open={open} onClose={onClose}
      title="Editar cliente"
      subtitle={clientDisplayName(client)}
      icon="user" iconBg="rgba(212,168,116,0.12)" iconColor="#D4A874"
      width={480}
      footer={
        <div style={{ display: "flex", gap: 10, padding: "16px 24px", justifyContent: "flex-end" }}>
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      }
    >
      <ClientFormBody form={form} setForm={setForm} error={error} isEditing={true} />
    </Drawer>
  );
}

// ─── Info row ──────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: T.roseLight, border: `1px solid ${T.roseBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} size={15} style={{ color: T.rose }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.07em", color: T.muted, fontFamily: T.fontUI, marginBottom: 1 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: T.fontUI }}>{value}</div>
      </div>
    </div>
  );
}

// ─── Section card ──────────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <Card style={{ padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <Icon name={icon} size={14} style={{ color: T.rose }} />
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: T.rose, fontFamily: T.fontUI }}>{title}</span>
      </div>
      {children}
    </Card>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
interface Props {
  clientId: string;
}

export default function ClientDetailPage({ clientId }: Props) {
  const { orgId } = useOrgContext();
  const [, navigate] = useLocation();

  const [editOpen, setEditOpen] = useState(false);

  const { data: client, isLoading } = useClient(orgId, clientId);
  const statusMutation = useUpdateClientStatus(orgId);

  const displayName = clientDisplayName(client);
  const [bg, fg] = avatarColor(displayName);
  const idCode  = client?.identification?.code;
  const idShort = idCode ? ID_TYPE_SHORT[idCode] : undefined;
  const phone = formatPhone(client?.phone);
  const isActive = client?.status === 1;

  const hasIdentity = !!(idShort || client?.identification?.number || client?.client_gln);
  const hasContact  = !!(client?.email || phone);
  const hasAddress  = !!(client?.residence?.address);

  if (isLoading) {
    return (
      <div style={{ padding: "48px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <Icon name="refresh" size={18} style={{ color: T.muted, animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 14, color: T.muted, fontFamily: T.fontUI }}>Cliente no encontrado.</div>
        <button onClick={() => navigate(ROUTES.DASHBOARD_CLIENTS)} style={{ marginTop: 16, color: T.rose, background: "none", border: "none", cursor: "pointer", fontSize: 13, fontFamily: T.fontUI }}>
          ← Volver a clientes
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 24px 48px", maxWidth: 800, margin: "0 auto" }}>
      {/* Back button */}
      <button
        onClick={() => navigate(ROUTES.DASHBOARD_CLIENTS)}
        className="t-body"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "hsl(var(--muted-foreground))", background: "none", border: "none", cursor: "pointer", marginBottom: 20, padding: "6px 0" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--foreground))")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(var(--muted-foreground))")}
      >
        <Icon name="arrowLeft" size={14} /> Clientes
      </button>

      {/* Hero card */}
      <Card style={{ padding: "28px 28px 24px", marginBottom: 14, background: `linear-gradient(135deg, ${T.roseLight} 0%, transparent 60%)`, borderColor: T.roseBorder }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
          {/* Avatar */}
          <div className="t-h1" style={{ width: 72, height: 72, borderRadius: 20, background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 16px ${bg}66` }}>
            {initials(displayName)}
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="t-h1" style={{ margin: "0 0 6px", lineHeight: 1.2 }}>
              {displayName}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {idShort && client.identification?.number && (
                <span style={{ background: T.roseLight, color: T.rose, border: `1px solid ${T.roseBorder}`, padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 700, fontFamily: T.fontUI }}>
                  {idShort} · {client.identification.number}
                </span>
              )}
              <Badge variant={isActive ? "success" : "secondary"}>
                {isActive ? "● Activo" : "○ Inactivo"}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <Button variant="outline" size="sm" icon="edit" onClick={() => setEditOpen(true)}>
              Editar
            </Button>
            <div onClick={(e) => e.stopPropagation()}>
              <Menu
                align="right"
                items={[
                  {
                    label: isActive ? "Desactivar cliente" : "Activar cliente",
                    icon: isActive ? "xCircle" : "checkCircle",
                    action: () => statusMutation.mutate({ clientId: client.client_id, status: isActive ? 2 : 1 }),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Info sections */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
        {hasIdentity && (
          <Section title="Identidad" icon="user">
            {idCode && <InfoRow icon="fileText" label="Tipo de identificación" value={ID_TYPE_LABEL[idCode] ?? idCode} />}
            {client.identification?.number && <InfoRow icon="copy" label="Número de identificación" value={client.identification.number} />}
            {client.client_gln && <InfoRow icon="layers" label="GLN / Código comercial" value={client.client_gln} />}
          </Section>
        )}

        {hasContact && (
          <Section title="Contacto" icon="smartphone">
            {client.email && <InfoRow icon="mail" label="Correo electrónico" value={client.email} />}
            {phone && <InfoRow icon="smartphone" label="Teléfono" value={phone} />}
          </Section>
        )}

        {hasAddress && (
          <Section title="Dirección" icon="mapPin">
            <InfoRow icon="mapPin" label="Dirección exacta" value={client.residence!.address!} />
          </Section>
        )}

        {!hasIdentity && !hasContact && !hasAddress && (
          <Card style={{ padding: "32px 24px", textAlign: "center", gridColumn: "1 / -1" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: T.roseLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <Icon name="user" size={20} style={{ color: T.rose }} />
            </div>
            <div className="t-body" style={{ color: "hsl(var(--muted-foreground))" }}>
              Sin información adicional registrada.
            </div>
            <button onClick={() => setEditOpen(true)} className="t-body" style={{ marginTop: 10, color: T.rose, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
              Agregar información →
            </button>
          </Card>
        )}
      </div>

      <EditDrawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        client={client}
      />
    </div>
  );
}
