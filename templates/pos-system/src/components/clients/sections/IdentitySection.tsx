import { useState, useEffect } from "react";
import { User, X, Loader2 } from "lucide-react";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { useAllCustomerTypes, useAllIdentifications, useAllCountries } from "@/hooks/useDataApi";
import { dataApiClient } from "@/services/data-api";
import { CountryISO, CustomerType, IdTypeCode, allowedIdCodes } from "@/lib/enums";
import { applyIdMask, validateIdLength, getIdPlaceholder } from "@/utils/idValidation";
import type { CreateClientDto } from "@/hooks/useClients";

const T = {
  rose: "#D4A874",
  roseLight: "rgba(212,168,116,0.12)",
  roseBorder: "rgba(212,168,116,0.2)",
} as const;

interface IdentitySectionProps {
  form: CreateClientDto;
  setForm: React.Dispatch<React.SetStateAction<CreateClientDto>>;
  isExpanded: boolean;
  onToggle: () => void;
  disabled?: boolean;
  isEditing?: boolean;
  onHaciendaSuccess?: (hasBusinessName: boolean) => void;
}

export function IdentitySection({
  form,
  setForm,
  isExpanded,
  onToggle,
  disabled,
  isEditing,
  onHaciendaSuccess,
}: IdentitySectionProps) {
  const nationality = form.nationality ?? CountryISO.COSTA_RICA;
  const customerType = form.customer_type ?? CustomerType.PERSONA_FISICA;
  const isCR = nationality === CountryISO.COSTA_RICA;
  const idCode = form.identification?.code ?? IdTypeCode.CEDULA_FISICA;

  const [idComplete, setIdComplete] = useState(false);
  const [lookingUpTaxpayer, setLookingUpTaxpayer] = useState(false);
  const [taxpayerError, setTaxpayerError] = useState<string | null>(null);

  // API data
  const { data: customerTypes = [], isLoading: loadingCT } = useAllCustomerTypes();
  const { data: allIdTypes = [], isLoading: loadingID } = useAllIdentifications({ iso_code: CountryISO.COSTA_RICA });
  const { data: countries = [], isLoading: loadingCountries } = useAllCountries();

  // Filter ID types based on nationality + customer type
  const allowed = allowedIdCodes(nationality, customerType);
  const filteredIdTypes = allIdTypes.filter((t) => allowed.includes(t.code));

  // Auto-reset ID type when nationality/customer type change and current selection is no longer valid
  useEffect(() => {
    const currentCode = form.identification?.code;
    const isValid = filteredIdTypes.some((t) => t.code === currentCode);
    if (!isValid && filteredIdTypes.length > 0) {
      setForm((f) => ({
        ...f,
        identification: { ...f.identification, code: filteredIdTypes[0].code, number: "" },
        business_name: "",
        // Don't clear client_name as it's the fantasy/trade name (user-editable)
      }));
      setIdComplete(false);
      setTaxpayerError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nationality, customerType, filteredIdTypes.length]);

  // Handle ID number change with masking and validation
  const handleIdNumberChange = async (value: string) => {
    const maskedValue = applyIdMask(value, idCode);
    setForm((f) => ({ ...f, identification: { ...f.identification, number: maskedValue } }));

    const isComplete = validateIdLength(maskedValue, idCode);
    setIdComplete(isComplete);
    setTaxpayerError(null);

    // Trigger Hacienda lookup for Costa Rica when ID is complete
    if (isCR && isComplete) {
      const cleanId = maskedValue.replace(/\D/g, "");
      setLookingUpTaxpayer(true);
      try {
        const taxpayer = await dataApiClient.getTaxpayerInfo({
          iso_code: nationality,
          identification: cleanId,
        });
        if (taxpayer?.name) {
          // Always populate business_name with Hacienda data (legal name)
          setForm((f) => ({
            ...f,
            business_name: taxpayer.name,
          }));
          onHaciendaSuccess?.(true);
        } else {
          onHaciendaSuccess?.(false);
          setTaxpayerError("No se encontró información del contribuyente");
        }
      } catch (error) {
        onHaciendaSuccess?.(false);
        setTaxpayerError("Error al consultar Hacienda");
      } finally {
        setLookingUpTaxpayer(false);
      }
    }
  };

  const handleClearId = () => {
    setForm((f) => ({
      ...f,
      identification: { ...f.identification, number: "" },
      business_name: "",
      // Don't clear client_name as it's the fantasy/trade name (user-editable)
    }));
    setIdComplete(false);
    setTaxpayerError(null);
    onHaciendaSuccess?.(false);
  };

  const canEditCriticalFields = !isEditing;

  return (
    <SectionWrapper
      title="Identidad"
      icon={User}
      isExpanded={isExpanded}
      onToggle={onToggle}
      disabled={disabled}
    >
      {/* Customer Type Pills */}
      <div>
        <label className="pp-label">
          Tipo de cliente <span style={{ color: "hsl(var(--destructive))" }}>*</span>
        </label>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          {loadingCT ? (
            <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>Cargando…</div>
          ) : (
            customerTypes.map((ct) => {
              const selected = customerType === ct.id;
              return (
                <button
                  key={ct.id}
                  type="button"
                  onClick={canEditCriticalFields ? () => setForm((f) => ({ ...f, customer_type: ct.id })) : undefined}
                  disabled={!canEditCriticalFields}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: canEditCriticalFields ? "pointer" : "not-allowed",
                    transition: "all 0.15s",
                    border: `1.5px solid ${selected ? T.rose : "hsl(var(--border))"}`,
                    background: selected ? T.roseLight : "hsl(var(--muted) / 0.3)",
                    color: selected ? T.rose : "hsl(var(--muted-foreground)))",
                    opacity: canEditCriticalFields ? 1 : 0.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      flexShrink: 0,
                      border: `2px solid ${selected ? T.rose : "hsl(var(--muted-foreground))"}`,
                      background: selected ? T.rose : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {selected && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#1C1410" }} />}
                  </div>
                  {ct.description}
                </button>
              );
            })
          )}
        </div>
        {!canEditCriticalFields && (
          <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))", marginTop: 4, fontStyle: "italic" }}>
            No se puede cambiar el tipo de cliente durante la edición
          </div>
        )}
      </div>

      {/* Nationality */}
      <div>
        <label className="pp-label">
          Nacionalidad <span style={{ color: "hsl(var(--destructive))" }}>*</span>
        </label>
        <select
          className="pp-input"
          value={nationality}
          onChange={canEditCriticalFields ? (e) => setForm((f) => ({ ...f, nationality: e.target.value })) : undefined}
          disabled={loadingCountries || !canEditCriticalFields}
          style={{ cursor: canEditCriticalFields ? "pointer" : "not-allowed", opacity: canEditCriticalFields ? 1 : 0.6 }}
        >
          {loadingCountries && <option value="">Cargando países…</option>}
          {countries.map((c) => (
            <option key={c.iso_code} value={c.iso_code}>
              {c.spanish_name || c.name}
            </option>
          ))}
        </select>
      </div>

      {/* ID Type & Number */}
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: "0 0 calc(50% - 5px)" }}>
          <label className="pp-label">
            Tipo de identificación <span style={{ color: "hsl(var(--destructive))" }}>*</span>
          </label>
          <select
            className="pp-input"
            value={idCode}
            onChange={canEditCriticalFields ? (e) => setForm((f) => ({ ...f, identification: { ...f.identification, code: e.target.value, number: "" } })) : undefined}
            disabled={loadingID || !canEditCriticalFields}
            style={{ cursor: canEditCriticalFields ? "pointer" : "not-allowed", opacity: canEditCriticalFields ? 1 : 0.6 }}
          >
            {loadingID && <option value="">Cargando…</option>}
            {filteredIdTypes.map((t) => (
              <option key={t.code} value={t.code}>
                {t.description}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: "0 0 calc(50% - 5px)" }}>
          <label className="pp-label">
            Número de identificación <span style={{ color: "hsl(var(--destructive))" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <input
              className="pp-input"
              value={form.identification?.number ?? ""}
              onChange={(e) => handleIdNumberChange(e.target.value)}
              placeholder={getIdPlaceholder(idCode)}
              disabled={idComplete || lookingUpTaxpayer}
              style={{
                paddingRight: idComplete || lookingUpTaxpayer ? 36 : 12,
                background: idComplete && isCR ? "hsl(var(--primary) / 0.06)" : undefined,
                border: idComplete && isCR ? "1.5px solid hsl(var(--primary) / 0.35)" : undefined,
              }}
            />
            {lookingUpTaxpayer && (
              <div
                style={{
                  position: "absolute",
                  right: 10,
                  top: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <Loader2
                  size={16}
                  style={{
                    color: "hsl(var(--primary))",
                    animation: "spin 1s linear infinite",
                  }}
                />
              </div>
            )}
            {idComplete && !lookingUpTaxpayer && (
              <button
                type="button"
                onClick={handleClearId}
                className="btn btn-ghost btn-icon btn-xs"
                style={{
                  position: "absolute",
                  right: 4,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          {taxpayerError && (
            <div className="t-xs" style={{ color: "hsl(var(--destructive))", marginTop: 4 }}>
              {taxpayerError}
            </div>
          )}
        </div>
      </div>

      {/* Business Name (Legal Name from Hacienda) */}
      <div>
        <label className="pp-label">
          Razón social <span style={{ color: "hsl(var(--destructive))" }}>*</span>
        </label>
        <input
          className="pp-input"
          value={form.business_name ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
          placeholder="Nombre legal de la empresa o persona"
          readOnly={isCR}
          style={{
            background: isCR ? "hsl(var(--muted) / 0.15)" : undefined,
            cursor: isCR ? "not-allowed" : "text",
          }}
        />
        {isCR && (
          <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))", marginTop: 4, fontStyle: "italic" }}>
            Se completa automáticamente desde Hacienda
          </div>
        )}
      </div>

      {/* Client Name (Fantasy/Trade Name) - Always editable */}
      <div>
        <label className="pp-label">Nombre comercial / Fantasía</label>
        <input
          className="pp-input"
          value={form.client_name ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
          placeholder="Nombre comercial o de fantasía (opcional)"
        />
        <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))", marginTop: 4, fontStyle: "italic" }}>
          Nombre con el que se conoce comercialmente
        </div>
      </div>

      {/* GLN */}
      <div>
        <label className="pp-label">GLN / Código comercial</label>
        <input
          className="pp-input"
          value={form.client_gln ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, client_gln: e.target.value }))}
          placeholder="Código GLN (opcional)"
        />
      </div>
    </SectionWrapper>
  );
}
