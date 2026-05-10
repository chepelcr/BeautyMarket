import { Barcode } from "lucide-react";
import { Icon } from "@/components/ui";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { useAllCodes } from "@/hooks/useDataApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { CountryISO } from "@/lib/enums";
import type { GetAllCodesParams } from "@/services/data-api/dtos";
import type { CodeFormEntry } from "@/types/productForm";

const ISO = CountryISO.COSTA_RICA;

interface CodesSectionProps {
  codes: CodeFormEntry[];
  isExpanded: boolean;
  onToggle: () => void;
  disabled?: boolean;
  onAdd: (entry: CodeFormEntry) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, patch: Partial<CodeFormEntry>) => void;
}

export function CodesSection({
  codes,
  isExpanded,
  onToggle,
  disabled,
  onAdd,
  onRemove,
  onUpdate,
}: CodesSectionProps) {
  const { t } = useLanguage();
  // document_version_id is auto-injected by the data API client via DocumentVersionProvider
  const { data: codesData } = useAllCodes({ iso_code: ISO } as GetAllCodesParams);
  const codeTypes = codesData ?? [];

  // Only show types not yet used (one per type)
  const availableTypes = codeTypes.filter(
    (ct: { id: number }) => !codes.some((c) => c.codeTypeId === ct.id)
  );

  return (
    <SectionWrapper
      title={t("products.productCodes")}
      icon={Barcode}
      isExpanded={isExpanded}
      onToggle={onToggle}
      disabled={disabled}
      badge={codes.length > 0 ? codes.length : undefined}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {codes.map((entry, idx) => {
          const isOtros = entry.codeTypeCode === "99";
          return (
            <div
              key={idx}
              style={{
                padding: "8px 12px",
                background: "hsl(var(--muted) / 0.3)",
                borderRadius: 8,
                border: "1px solid hsl(var(--border))",
              }}
            >
              {/* Row 1: description + remove button */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span
                  style={{
                    flex: 1,
                    fontSize: 11,
                    fontWeight: 600,
                    color: "hsl(var(--muted-foreground))",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {entry.codeTypeDescription}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => onRemove(idx)}
                >
                  <Icon name="xCircle" size={14} />
                </button>
              </div>

              {/* Row 2: value input */}
              <input
                type="text"
                className="pp-input"
                style={{ fontSize: 12 }}
                placeholder={t("products.codeValue")}
                value={entry.value}
                onChange={(e) => onUpdate(idx, { value: e.target.value })}
              />

              {/* Row 3: reason input for "Otros" (code 99) */}
              {isOtros && (
                <div style={{ marginTop: 6 }}>
                  <label className="pp-label" style={{ fontSize: 11 }}>
                    {t("products.specifyType")} <span style={{ color: "hsl(var(--destructive))" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="pp-input"
                    style={{ fontSize: 12 }}
                    placeholder={t("products.codeTypePlaceholder")}
                    value={entry.reason ?? ""}
                    onChange={(e) => onUpdate(idx, { reason: e.target.value })}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Add code — description only, only unused types */}
        {availableTypes.length > 0 && (
          <select
            className="pp-input"
            value=""
            onChange={(e) => {
              const ct = codeTypes.find(
                (c: { id: number }) => String(c.id) === e.target.value
              );
              if (ct) {
                onAdd({
                  codeTypeId: ct.id,
                  codeTypeCode: (ct as { code?: string }).code ?? "",
                  codeTypeDescription: ct.description,
                  value: "",
                });
              }
            }}
          >
            <option value="">{t("products.addCodeType")}</option>
            {availableTypes.map((ct: { id: number; description: string }) => (
              <option key={ct.id} value={String(ct.id)}>
                {ct.description}
              </option>
            ))}
          </select>
        )}
      </div>
    </SectionWrapper>
  );
}
