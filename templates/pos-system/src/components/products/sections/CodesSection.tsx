import { Barcode } from "lucide-react";
import { Icon, FormLabel } from "@/components/ui";
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
  const { data: codesData } = useAllCodes({ iso_code: ISO } as GetAllCodesParams);
  const codeTypes = codesData ?? [];

  const availableTypes = codeTypes.filter(
    (ct: { code?: string }) => !codes.some((c) => c.codeTypeCode === (ct.code ?? ""))
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
      <div className="flex flex-col gap-2">
        {codes.map((entry, idx) => {
          const isOtros = entry.codeTypeCode === "99";
          return (
            <div
              key={idx}
              className="px-3 py-2 bg-muted/30 rounded-lg border border-border"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="flex-1 text-[11px] font-semibold text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
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

              <input
                type="text"
                className="pp-input text-xs"
                placeholder={t("products.codeValue")}
                value={entry.value}
                onChange={(e) => onUpdate(idx, { value: e.target.value })}
              />

              {isOtros && (
                <div className="mt-1.5">
                  <FormLabel required>{t("products.specifyType")}</FormLabel>
                  <input
                    type="text"
                    className="pp-input text-xs"
                    placeholder={t("products.codeTypePlaceholder")}
                    value={entry.reason ?? ""}
                    onChange={(e) => onUpdate(idx, { reason: e.target.value })}
                  />
                </div>
              )}
            </div>
          );
        })}

        {availableTypes.length > 0 && (
          <select
            className="pp-input"
            value=""
            onChange={(e) => {
              const ct = codeTypes.find(
                (c: { code?: string }) => (c.code ?? "") === e.target.value
              );
              if (ct) {
                onAdd({
                  codeTypeCode: (ct as { code?: string }).code ?? "",
                  codeTypeDescription: ct.description,
                  value: "",
                });
              }
            }}
          >
            <option value="">{t("products.addCodeType")}</option>
            {availableTypes.map((ct: { code?: string; description: string }) => (
              <option key={ct.code ?? ""} value={ct.code ?? ""}>
                {ct.description}
              </option>
            ))}
          </select>
        )}
      </div>
    </SectionWrapper>
  );
}
