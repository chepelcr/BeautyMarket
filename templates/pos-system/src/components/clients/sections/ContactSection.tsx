import { Mail } from "lucide-react";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { useAllCountries } from "@/hooks/useDataApi";
import { CountryISO } from "@/lib/enums";
import type { CreateClientDto } from "@/hooks/useClients";

interface ContactSectionProps {
  form: CreateClientDto;
  setForm: React.Dispatch<React.SetStateAction<CreateClientDto>>;
  isExpanded: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function ContactSection({
  form,
  setForm,
  isExpanded,
  onToggle,
  disabled,
}: ContactSectionProps) {
  const { data: countries = [], isLoading: loadingCountries } = useAllCountries();

  return (
    <SectionWrapper
      title="Contacto"
      icon={Mail}
      isExpanded={isExpanded}
      onToggle={onToggle}
      disabled={disabled}
    >
      {/* Email */}
      <div>
        <label className="pp-label">
          Correo electrónico <span style={{ color: "hsl(var(--destructive))" }}>*</span>
        </label>
        <input
          type="email"
          className="pp-input"
          value={form.email ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="correo@ejemplo.com"
        />
      </div>

      {/* Phone Country & Number */}
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: "0 0 calc(50% - 5px)" }}>
          <label className="pp-label">País (teléfono)</label>
          <select
            className="pp-input"
            value={form.phone?.country_code ?? CountryISO.COSTA_RICA}
            onChange={(e) => setForm((f) => ({ ...f, phone: { ...f.phone, country_code: e.target.value } }))}
            disabled={loadingCountries}
          >
            {countries.map((c) => (
              <option key={c.iso_code} value={c.iso_code}>
                {c.phone_code} {c.spanish_name || c.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: "0 0 calc(50% - 5px)" }}>
          <label className="pp-label">Número de teléfono</label>
          <input
            className="pp-input"
            value={form.phone?.number ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, phone: { ...f.phone, number: e.target.value } }))}
            placeholder="8888-8888"
          />
        </div>
      </div>
    </SectionWrapper>
  );
}
