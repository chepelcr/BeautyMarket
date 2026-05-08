import { useEffect } from "react";
import { LocationSelect } from "@/components/ui/LocationSelect";
import { Icon } from "@/components/ui";
import type { CreateClientDto } from "@/hooks/useClients";
import { useAllCustomerTypes, useAllIdentifications, useAllCountries } from "@/hooks/useDataApi";
import { CountryISO, CustomerType, IdTypeCode, DEFAULT_ID_TYPE, allowedIdCodes } from "@/lib/enums";

// ─── Styles ────────────────────────────────────────────────────────────────

const T = {
  rose:       "#D4A874",
  roseLight:  "rgba(212,168,116,0.12)",
  roseBorder: "rgba(212,168,116,0.2)",
  text:       "hsl(var(--foreground))",
  muted:      "hsl(var(--muted-foreground))",
  border:     "hsl(var(--border))",
  fontUI:     "'DM Sans', 'Barlow', system-ui, sans-serif",
} as const;

export const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px",
  background: "hsl(var(--muted) / 0.3)",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8, color: T.text, fontSize: 13,
  fontFamily: T.fontUI, outline: "none", boxSizing: "border-box",
};

export function Field({ label, children, half }: { label: string; children: React.ReactNode; half?: boolean }) {
  return (
    <div style={{ flex: half ? "0 0 calc(50% - 6px)" : "0 0 100%" }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: T.muted, marginBottom: 6, fontFamily: T.fontUI }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: T.rose, fontFamily: T.fontUI, marginBottom: 12 }}>
      {children}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

interface Props {
  form: CreateClientDto;
  setForm: React.Dispatch<React.SetStateAction<CreateClientDto>>;
  error: string | null;
}

export default function ClientFormBody({ form, setForm, error }: Props) {
  const nationality  = form.nationality  ?? CountryISO.COSTA_RICA;
  const customerType = form.customer_type ?? CustomerType.PERSONA_FISICA;
  const isCR         = nationality === CountryISO.COSTA_RICA;

  // ─── API data ───────────────────────────────────────────────────────────
  const { data: customerTypes = [], isLoading: loadingCT } = useAllCustomerTypes();
  const { data: allIdTypes = [],   isLoading: loadingID } = useAllIdentifications({ iso_code: nationality });
  const { data: countries = [],    isLoading: loadingCountries } = useAllCountries();

  // Filter ID types to those allowed by nationality + customer type
  const allowed = allowedIdCodes(nationality, customerType);
  const filteredIdTypes = allIdTypes.filter((t) => allowed.includes(t.code));

  // Auto-reset ID type when nationality/customer type change and current selection is no longer valid
  useEffect(() => {
    const currentCode = form.identification?.code;
    const isValid = filteredIdTypes.some((t) => t.code === currentCode);
    if (!isValid && filteredIdTypes.length > 0) {
      setForm((f) => ({ ...f, identification: { ...f.identification, code: filteredIdTypes[0].code, number: "" } }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nationality, customerType]);

  // Auto-sync phone country code when nationality changes
  useEffect(() => {
    setForm((f) => ({ ...f, phone: { ...f.phone, country_code: nationality } }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nationality]);

  // Reset location IDs (keep address text) when switching away from CR
  useEffect(() => {
    if (!isCR) {
      setForm((f) => ({
        ...f,
        residence: {
          state_id: undefined, county_id: undefined,
          district_id: undefined, neighborhood_id: undefined,
          address: f.residence?.address ?? "",
        },
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCR]);

  return (
    <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 0 }}>

      {/* Customer type */}
      <SectionLabel>Tipo de cliente</SectionLabel>
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        {loadingCT ? (
          <div style={{ fontSize: 12, color: T.muted, fontFamily: T.fontUI }}>Cargando…</div>
        ) : (
          customerTypes.map((ct) => {
            const selected = customerType === ct.id;
            return (
              <button
                key={ct.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, customer_type: ct.id }))}
                style={{
                  flex: 1, padding: "10px 12px", borderRadius: 8, fontSize: 13, fontFamily: T.fontUI, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.15s",
                  border: `1.5px solid ${selected ? T.rose : T.border}`,
                  background: selected ? T.roseLight : "hsl(var(--muted) / 0.3)",
                  color: selected ? T.rose : T.muted,
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                <div style={{
                  width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                  border: `2px solid ${selected ? T.rose : T.muted}`,
                  background: selected ? T.rose : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {selected && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#1C1410" }} />}
                </div>
                {ct.description}
              </button>
            );
          })
        )}
      </div>

      {/* Identity */}
      <SectionLabel>Identidad</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>

        {/* Nationality */}
        <Field label="Nacionalidad">
          <select
            style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
            value={nationality}
            onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))}
            disabled={loadingCountries}
          >
            {loadingCountries && <option value="">Cargando países…</option>}
            {countries.map((c) => (
              <option key={c.iso_code} value={c.iso_code}>
                {c.spanish_name || c.name}
              </option>
            ))}
          </select>
        </Field>

        {/* ID type */}
        <Field label="Tipo de identificación" half>
          <select
            style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
            value={form.identification?.code ?? DEFAULT_ID_TYPE}
            onChange={(e) => setForm((f) => ({ ...f, identification: { ...f.identification, code: e.target.value, number: "" } }))}
            disabled={loadingID}
          >
            {loadingID && <option value="">Cargando…</option>}
            {filteredIdTypes.map((t) => (
              <option key={t.code} value={t.code}>{t.description}</option>
            ))}
          </select>
        </Field>

        {/* ID number */}
        <Field label="Número de identificación" half>
          <input
            style={inputStyle}
            value={form.identification?.number ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, identification: { ...f.identification, number: e.target.value } }))}
            placeholder={
              form.identification?.code === IdTypeCode.CEDULA_FISICA   ? "0-0000-0000"  :
              form.identification?.code === IdTypeCode.CEDULA_JURIDICA ? "0-000-000000" :
              "Número"
            }
          />
        </Field>

        {/* Name depends on customer type */}
        {customerType === CustomerType.EMPRESA ? (
          <Field label="Razón social">
            <input style={inputStyle} value={form.business_name ?? ""} onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))} placeholder="Nombre de la empresa" />
          </Field>
        ) : (
          <Field label="Nombre completo">
            <input style={inputStyle} value={form.client_name ?? ""} onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))} placeholder="Nombre y apellidos" />
          </Field>
        )}

        <Field label="GLN / Código comercial">
          <input style={inputStyle} value={form.client_gln ?? ""} onChange={(e) => setForm((f) => ({ ...f, client_gln: e.target.value }))} placeholder="Código GLN (opcional)" />
        </Field>
      </div>

      {/* Contact */}
      <SectionLabel>Contacto</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
        <Field label="Correo electrónico">
          <input type="email" style={inputStyle} value={form.email ?? ""} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="correo@ejemplo.com" />
        </Field>

        <Field label="País (teléfono)" half>
          <select
            style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
            value={form.phone?.country_code ?? CountryISO.COSTA_RICA}
            onChange={(e) => setForm((f) => ({ ...f, phone: { ...f.phone, country_code: e.target.value } }))}
            disabled={loadingCountries}
          >
            {countries.map((c) => (
              <option key={c.iso_code} value={c.iso_code}>
                +{c.phone_code} {c.spanish_name || c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Número de teléfono" half>
          <input style={inputStyle} value={form.phone?.number ?? ""} onChange={(e) => setForm((f) => ({ ...f, phone: { ...f.phone, number: e.target.value } }))} placeholder="8888-8888" />
        </Field>
      </div>

      {/* Address — CR gets full location selector, others get plain textarea */}
      <SectionLabel>Dirección</SectionLabel>
      <div style={{ marginBottom: 16 }}>
        {isCR ? (
          <LocationSelect
            isoCode={nationality}
            value={{
              state_id: form.residence?.state_id ?? null,
              county_id: form.residence?.county_id ?? null,
              district_id: form.residence?.district_id ?? null,
              neighborhood_id: form.residence?.neighborhood_id ?? null,
              address: form.residence?.address ?? "",
            }}
            onChange={(loc) => setForm((f) => ({
              ...f,
              residence: {
                state_id: loc.state_id ?? undefined,
                county_id: loc.county_id ?? undefined,
                district_id: loc.district_id ?? undefined,
                neighborhood_id: loc.neighborhood_id ?? undefined,
                address: loc.address ?? "",
              },
            }))}
          />
        ) : (
          <Field label="Dirección">
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
              rows={3}
              value={form.residence?.address ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, residence: { address: e.target.value } }))}
              placeholder="Dirección completa"
            />
          </Field>
        )}
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "hsl(var(--destructive) / 0.1)", border: "1px solid hsl(var(--destructive) / 0.3)", borderRadius: 8, fontSize: 13, color: "hsl(var(--destructive))", fontFamily: T.fontUI }}>
          <Icon name="alertTri" size={13} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}
    </div>
  );
}
