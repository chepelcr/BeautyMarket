import { useState, useEffect } from "react";
import { Drawer, Button } from "@/components/ui";
import { FadeIn } from "@/components/ui/FadeIn";
import { useCreateClient, useUpdateClient, clientDisplayName, type Client, type CreateClientDto } from "@/hooks/useClients";
import { IdentitySection } from "./sections/IdentitySection";
import { ContactSection } from "./sections/ContactSection";
import { AddressSection } from "./sections/AddressSection";
import { CustomerType, CountryISO } from "@/lib/enums";

function buildForm(client?: Client | null): CreateClientDto {
  return {
    customer_type: client?.customer_type ?? CustomerType.PERSONA_FISICA,
    client_name: client?.client_name ?? "",
    business_name: client?.business_name ?? "",
    client_gln: client?.client_gln ?? "",
    nationality: client?.nationality ?? CountryISO.COSTA_RICA,
    email: client?.email ?? "",
    identification: { code: client?.identification?.code ?? "01", number: client?.identification?.number ?? "" },
    phone: { country_code: client?.phone?.country_code ?? CountryISO.COSTA_RICA, area_code: client?.phone?.area_code ?? "", number: client?.phone?.number ?? "", description: "" },
    residence: {
      state_id: client?.residence?.state_id ?? undefined,
      county_id: client?.residence?.county_id ?? undefined,
      district_id: client?.residence?.district_id ?? undefined,
      neighborhood_id: client?.residence?.neighborhood_id ?? undefined,
      address: client?.residence?.address ?? "",
    },
  };
}

interface ClientDrawerFormProps {
  open: boolean;
  client?: Client | null;
  orgId: string;
  onClose: () => void;
}

export function ClientDrawerForm({ open, client, orgId, onClose }: ClientDrawerFormProps) {
  const isEdit = !!client;
  const createMutation = useCreateClient(orgId);
  const updateMutation = useUpdateClient(orgId);
  const [form, setForm] = useState<CreateClientDto>(() => buildForm(client));
  const [error, setError] = useState<string | null>(null);
  
  // Section expansion state
  const [identityExpanded, setIdentityExpanded] = useState(true);
  const [contactExpanded, setContactExpanded] = useState(false);
  const [addressExpanded, setAddressExpanded] = useState(false);
  
  // Track if Hacienda lookup was successful
  const [haciendaSuccess, setHaciendaSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(buildForm(client));
      setError(null);
      setIdentityExpanded(true);
      setContactExpanded(false);
      setAddressExpanded(false);
      setHaciendaSuccess(!!client?.business_name || !!client?.client_name);
    }
  }, [open, client]);

  // Auto-expand Contact section when Hacienda lookup succeeds or nationality is not CR
  useEffect(() => {
    const isCR = form.nationality === CountryISO.COSTA_RICA;
    if (haciendaSuccess || !isCR) {
      setContactExpanded(true);
      setAddressExpanded(true);
    } else {
      // Collapse sections when Hacienda success is lost
      setContactExpanded(false);
      setAddressExpanded(false);
    }
  }, [haciendaSuccess, form.nationality]);

  async function handleSave() {
    // Validation
    const hasBusinessName = form.business_name?.trim();
    const hasId = form.identification?.number?.trim();
    const hasEmail = form.email?.trim();
    
    if (!hasBusinessName && !form.client_gln?.trim()) {
      setError("Se requiere al menos razón social o código GLN.");
      return;
    }
    if (!hasId) {
      setError("El número de identificación es requerido.");
      return;
    }
    if (!hasEmail) {
      setError("El correo electrónico es requerido.");
      return;
    }
    
    setError(null);
    const dto: CreateClientDto = {
      customer_type: form.customer_type,
      nationality: form.nationality,
      ...(form.client_name?.trim() && { client_name: form.client_name.trim() }),
      ...(form.business_name?.trim() && { business_name: form.business_name.trim() }),
      ...(form.client_gln?.trim() && { client_gln: form.client_gln.trim() }),
      email: form.email.trim(), // Always include email since it's required
      ...((form.identification?.code || form.identification?.number) && {
        identification: { code: form.identification.code || undefined, number: form.identification.number || undefined },
      }),
      ...((form.phone?.country_code || form.phone?.number) && {
        phone: { country_code: form.phone.country_code || undefined, area_code: form.phone.area_code || undefined, number: form.phone.number || undefined },
      }),
      ...((form.residence?.state_id || form.residence?.address) && {
        residence: { state_id: form.residence.state_id || undefined, county_id: form.residence.county_id || undefined, district_id: form.residence.district_id || undefined, neighborhood_id: form.residence.neighborhood_id || undefined, address: form.residence.address || undefined },
      }),
    };
    try {
      if (isEdit) await updateMutation.mutateAsync({ clientId: client!.client_id, dto });
      else await createMutation.mutateAsync(dto);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar.");
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending;
  
  // Determine if Contact/Address sections should be disabled
  const isCR = form.nationality === CountryISO.COSTA_RICA;
  const shouldDisableContactAddress = isCR && !haciendaSuccess && !isEdit;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar cliente" : "Nuevo cliente"}
      subtitle={isEdit ? clientDisplayName(client) : "Complete los datos del cliente"}
      icon="user"
      iconBg="rgba(212,168,116,0.12)"
      iconColor="#D4A874"
      width={520}
      footer={
        <div style={{ display: "flex", gap: 10, padding: "16px 24px", justifyContent: "flex-end" }}>
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear cliente"}
          </Button>
        </div>
      }
    >
      <FadeIn duration={0.3}>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          <IdentitySection
            form={form}
            setForm={setForm}
            isExpanded={identityExpanded}
            onToggle={() => setIdentityExpanded(!identityExpanded)}
            isEditing={isEdit}
            onHaciendaSuccess={setHaciendaSuccess}
          />
          
          <ContactSection
            form={form}
            setForm={setForm}
            isExpanded={contactExpanded}
            onToggle={() => setContactExpanded(!contactExpanded)}
            disabled={shouldDisableContactAddress}
          />
          
          <AddressSection
            form={form}
            setForm={setForm}
            isExpanded={addressExpanded}
            onToggle={() => setAddressExpanded(!addressExpanded)}
            disabled={shouldDisableContactAddress}
          />
          
          {error && (
            <div
              style={{
                padding: "10px 12px",
                background: "hsl(var(--destructive) / 0.08)",
                borderRadius: 8,
                fontSize: 12,
                color: "hsl(var(--destructive))",
                border: "1px solid hsl(var(--destructive) / 0.2)",
              }}
            >
              {error}
            </div>
          )}
        </div>
      </FadeIn>
    </Drawer>
  );
}
