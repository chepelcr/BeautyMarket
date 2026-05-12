import { useAllIdentifications } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
import { useEffect } from 'react';
import type { SaleReceiver } from '@/types/receiver';
import type { ClientSearchResult } from '@/hooks/useClientSearch';

interface ReceiverTabProps {
  receiver: SaleReceiver;
  selectedClient: ClientSearchResult | null;
  onChange: (patch: Partial<SaleReceiver>) => void;
}

export function ReceiverTab({ receiver, selectedClient, onChange }: ReceiverTabProps) {
  const { data: identificationTypes } = useAllIdentifications({ iso_code: CountryISO.COSTA_RICA });

  // Pre-fill from cart's selected client on first render
  useEffect(() => {
    if (selectedClient && !receiver.business_name && !receiver.id_number) {
      onChange({
        business_name: selectedClient.client_name || selectedClient.business_name || '',
        email: selectedClient.email || '',
        id_number: selectedClient.identification?.number || '',
        id_type: selectedClient.identification?.code ? parseInt(selectedClient.identification.code) : undefined,
        state_id: selectedClient.residence?.state_id,
        county_id: selectedClient.residence?.county_id,
        district_id: selectedClient.residence?.district_id,
        address: selectedClient.residence?.address,
      });
    }
  }, []);

  const field = (
    label: string,
    key: keyof SaleReceiver,
    type = 'text',
    props?: React.InputHTMLAttributes<HTMLInputElement>
  ) => (
    <div className="space-y-1">
      <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        value={(receiver[key] as string) || ''}
        onChange={(e) => onChange({ [key]: e.target.value } as any)}
        className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
        {...props}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Identification */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
            Tipo ID *
          </label>
          <select
            value={receiver.id_type ?? ''}
            onChange={(e) => onChange({ id_type: Number(e.target.value) || undefined })}
            className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
          >
            <option value="">Seleccionar…</option>
            {(identificationTypes ?? []).map((it: any) => (
              <option key={it.id} value={it.id}>{it.description}</option>
            ))}
          </select>
        </div>
        {field('Número ID *', 'id_number', 'text', { maxLength: 50, placeholder: '123456789' })}
      </div>

      {field('Nombre / Razón social *', 'business_name', 'text', { placeholder: 'Empresa SA' })}
      {field('Nombre comercial', 'trade_name')}
      {field('Correo electrónico', 'email', 'email', { placeholder: 'contacto@empresa.com' })}

      {/* Address */}
      <div className="space-y-1">
        <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
          Dirección
        </label>
        <textarea
          value={receiver.address || ''}
          onChange={(e) => onChange({ address: e.target.value })}
          rows={2}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
          placeholder="Dirección completa…"
        />
      </div>

      {/* Phones */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
            Teléfono personal
          </label>
          <input
            value={receiver.personal_phone?.number || ''}
            onChange={(e) => onChange({ personal_phone: { country_code: '506', number: e.target.value } })}
            className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
            placeholder="88887777"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground">
            Teléfono negocio
          </label>
          <input
            value={receiver.business_phone?.number || ''}
            onChange={(e) => onChange({ business_phone: { country_code: '506', number: e.target.value } })}
            className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
            placeholder="22223333"
          />
        </div>
      </div>

      {field('Actividad económica', 'economic_activity', 'text', { placeholder: '722000', maxLength: 20 })}
    </div>
  );
}
