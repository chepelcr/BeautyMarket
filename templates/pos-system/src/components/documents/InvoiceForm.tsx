import { useDocumentStore } from '@/store/documentStore';
import { FadeIn } from '@/components/ui/FadeIn';
import type { DocumentTab } from '@/store/documentStore';
import type { InvoiceFormData } from '@/types/invoice';
import { DOCUMENT_TYPES } from '@/types/invoice';

interface InvoiceFormProps {
  orgId: string;
  tab: DocumentTab;
}

export function InvoiceForm({ orgId, tab }: InvoiceFormProps) {
  const { updateDocumentTab } = useDocumentStore();
  const data = tab.data as Partial<InvoiceFormData> | undefined;
  const docInfo = DOCUMENT_TYPES.find((d) => d.code === tab.doc_type);

  const patch = (p: Partial<InvoiceFormData>) => {
    updateDocumentTab(tab.id, {
      data: { ...(data ?? {}), ...p },
      is_dirty: true,
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
      {/* Document type badge */}
      <FadeIn duration={0.3}>
        <div className="flex items-center gap-3">
          <span className={`text-[13px] font-bold px-3 py-1 rounded-full border ${docInfo?.color ?? 'text-muted-foreground'} bg-muted/40 border-current`}>
            {docInfo?.short ?? '?'}
          </span>
          <span className="text-[15px] font-semibold">{docInfo?.label ?? 'Documento'}</span>
        </div>
      </FadeIn>

      {/* Section: Información del documento */}
      <FadeIn delay={0.05} duration={0.3}>
        <section className="rounded-lg border border-border p-5 space-y-4">
        <h3 className="text-[13px] font-display font-bold uppercase tracking-wider text-muted-foreground">
          Información del documento
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Código actividad</label>
            <input
              value={data?.activity_code ?? '722000'}
              onChange={(e) => patch({ activity_code: e.target.value })}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary font-mono"
              maxLength={20}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Moneda</label>
            <select
              value={data?.currency_code?.iso_code ?? 'CRC'}
              onChange={(e) =>
                patch({ currency_code: { iso_code: e.target.value, exchange_rate: data?.currency_code?.exchange_rate ?? 1 } })
              }
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
            >
              <option value="CRC">CRC — Colón</option>
              <option value="USD">USD — Dólar</option>
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Observaciones</label>
          <textarea
            value={data?.notes ?? ''}
            onChange={(e) => patch({ notes: e.target.value })}
            rows={2}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
            placeholder="Observaciones opcionales…"
          />
        </div>
      </section>
      </FadeIn>

      {/* Section: Receptor */}
      <FadeIn delay={0.1} duration={0.3}>
        <section className="rounded-lg border border-border p-5 space-y-3">
        <h3 className="text-[13px] font-display font-bold uppercase tracking-wider text-muted-foreground">
          Receptor
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Número ID</label>
            <input
              value={data?.receiver?.id_number ?? ''}
              onChange={(e) => patch({ receiver: { ...(data?.receiver ?? {}), id_number: e.target.value } })}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
              placeholder="123456789"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Nombre / Razón social</label>
            <input
              value={data?.receiver?.business_name ?? ''}
              onChange={(e) => patch({ receiver: { ...(data?.receiver ?? {}), business_name: e.target.value } })}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
              placeholder="Empresa SA"
            />
          </div>
          <div className="space-y-1 col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Correo electrónico</label>
            <input
              type="email"
              value={data?.receiver?.email ?? ''}
              onChange={(e) => patch({ receiver: { ...(data?.receiver ?? {}), email: e.target.value } })}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
              placeholder="contacto@empresa.com"
            />
          </div>
        </div>
      </section>
      </FadeIn>

      {/* Section: Líneas de detalle */}
      <FadeIn delay={0.15} duration={0.3}>
        <section className="rounded-lg border border-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-display font-bold uppercase tracking-wider text-muted-foreground">
            Líneas de detalle
          </h3>
          <span className="text-[12px] text-muted-foreground">{data?.details?.length ?? 0} líneas</span>
        </div>

        {(!data?.details || data.details.length === 0) ? (
          <div className="text-center py-8 text-muted-foreground text-[13px]">
            No hay líneas. Agrega productos usando el buscador.
          </div>
        ) : (
          <div className="space-y-2">
            {(data.details ?? []).map((line, i) => (
              <div key={i} className="rounded-md border border-border p-3 flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold">{line.description}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {line.quantity} × ₡{line.net_price.toLocaleString('es-CR')}
                  </div>
                </div>
                <span className="font-mono t-num text-[13px]">
                  ₡{(line.quantity * line.net_price).toLocaleString('es-CR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
      </FadeIn>

      {/* Section: Totales */}
      {data?.details && data.details.length > 0 && (
        <FadeIn delay={0.2} duration={0.3}>
          <section className="rounded-lg border border-border p-5 space-y-2">
          <h3 className="text-[13px] font-display font-bold uppercase tracking-wider text-muted-foreground">
            Totales
          </h3>
          <div className="space-y-1 text-[13px]">
            {[
              { label: 'Subtotal', value: data.details.reduce((s, l) => s + l.quantity * l.net_price, 0) },
              { label: 'Descuentos', value: -(data.details.reduce((s, l) => s + (l.discount_amount ?? 0), 0)) },
              { label: 'I.V.A.', value: data.details.reduce((s, l) => s + (l.tax_amount ?? 0), 0) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-mono t-num">₡{Math.abs(value).toLocaleString('es-CR', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
            <div className="flex justify-between font-display font-extrabold text-[16px] pt-2 border-t border-border">
              <span>Total</span>
              <span className="font-mono t-num text-primary">
                ₡{(data.details.reduce((s, l) => s + (l.line_total ?? l.quantity * l.net_price), 0)).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <button className="mt-3 w-full h-11 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold">
            Finalizar documento
          </button>
        </section>
        </FadeIn>
      )}
    </div>
  );
}
