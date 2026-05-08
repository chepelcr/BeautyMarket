import { useState, useEffect } from "react";
import { Drawer, Button } from "@/components/ui";
import { useCreateClient, useUpdateClient, clientDisplayName, type Client, type CreateClientDto } from "@/hooks/useClients";
import ClientFormBody from "./ClientFormBody";

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

  useEffect(() => {
    if (open) { setForm(buildForm(client)); setError(null); }
  }, [open, client]);

  async function handleSave() {
    if (!form.client_name?.trim() && !form.business_name?.trim() && !form.client_gln?.trim()) {
      setError("Se requiere al menos nombre o razón social.");
      return;
    }
    setError(null);
    const dto: CreateClientDto = {
      customer_type: form.customer_type,
      nationality: form.nationality,
      ...(form.client_name?.trim() && { client_name: form.client_name.trim() }),
      ...(form.business_name?.trim() && { business_name: form.business_name.trim() }),
      ...(form.client_gln?.trim() && { client_gln: form.client_gln.trim() }),
      ...(form.email?.trim() && { email: form.email.trim() }),
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

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar cliente" : "Nuevo cliente"}
      subtitle={isEdit ? clientDisplayName(client) : "Complete los datos del cliente"}
      icon="user"
      iconBg="rgba(212,168,116,0.12)"
      iconColor="#D4A874"
      width={480}
      footer={
        <div style={{ display: "flex", gap: 10, padding: "16px 24px", justifyContent: "flex-end" }}>
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear cliente"}
          </Button>
        </div>
      }
    >
      <ClientFormBody form={form} setForm={setForm} error={error} />
    </Drawer>
  );
}
