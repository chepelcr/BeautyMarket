import { useState } from "react";
import { Package } from "lucide-react";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAllMeasurementUnits } from "@/hooks/useDataApi";
import type { Category } from "@/types";
import type { ProductFormState } from "@/types/productForm";

interface GeneralInfoSectionProps {
  form: ProductFormState;
  categories: Category[];
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<ProductFormState>) => void;
}

export function GeneralInfoSection({
  form,
  categories,
  isExpanded,
  onToggle,
  onChange,
}: GeneralInfoSectionProps) {
  const { t } = useLanguage();
  const { data: unitsData } = useAllMeasurementUnits();
  const [customUnit, setCustomUnit] = useState(false);

  const units = unitsData ?? [];

  return (
    <SectionWrapper
      title={t("products.generalInfo") || "Información General"}
      icon={Package}
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      {/* Name */}
      <div>
        <label className="pp-label">
          {t("products.name")}{" "}
          <span style={{ color: "hsl(var(--destructive))" }}>*</span>
        </label>
        <input
          className="pp-input"
          placeholder={t("products.namePlaceholder")}
          value={form.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </div>

      {/* Description */}
      <div>
        <label className="pp-label">{t("products.description")}</label>
        <textarea
          className="pp-input"
          rows={2}
          placeholder={t("products.descriptionPlaceholder")}
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          style={{ resize: "vertical" }}
        />
      </div>

      {/* Category */}
      <div>
        <label className="pp-label">
          {t("products.categoryLabel")}{" "}
          <span style={{ color: "hsl(var(--destructive))" }}>*</span>
        </label>
        <select
          className="pp-input"
          value={form.category_id}
          onChange={(e) => onChange({ category_id: e.target.value })}
        >
          <option value="">{t("products.noCategory")}</option>
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Unit of Measure */}
      {units.length > 0 && (
        <div>
          <label className="pp-label">{t("products.unitOfMeasure")}</label>
          {!customUnit ? (
            <select
              className="pp-input"
              onChange={(e) => {
                if (e.target.value === "__other__") {
                  setCustomUnit(true);
                }
              }}
            >
              <option value="">{t("products.selectUnit")}</option>
              {units.map((u: { id: number; description: string; code?: string }) => (
                <option key={u.id} value={String(u.id)}>
                  {u.description}{u.code ? ` (${u.code})` : ""}
                </option>
              ))}
              <option value="__other__">{t("products.otherUnit")}</option>
            </select>
          ) : (
            <div style={{ display: "flex", gap: 6 }}>
              <input
                className="pp-input"
                placeholder={t("products.specifyUnit")}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setCustomUnit(false)}
                style={{ fontSize: 12 }}
              >
                {t("common.cancel")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Switches row */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <ToggleRow
          label={t("products.trackInventory")}
          description={t("products.trackInventoryDesc")}
          checked={form.track_inventory}
          onChange={(v) => onChange({ track_inventory: v })}
        />
        <ToggleRow
          label={t("products.fiscalInfo")}
          description={t("products.fiscalInfoDesc")}
          checked={form.has_fiscal_info}
          onChange={(v) => onChange({ has_fiscal_info: v })}
        />
        <ToggleRow
          label={t("products.packageInfo")}
          description={t("products.packageInfoDesc")}
          checked={form.has_package_info}
          onChange={(v) => onChange({ has_package_info: v })}
        />
      </div>
    </SectionWrapper>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 12px",
        background: "hsl(var(--muted) / 0.35)",
        borderRadius: 8,
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
        <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
          {description}
        </div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 18, height: 18, accentColor: "hsl(var(--primary))", cursor: "pointer" }}
      />
    </div>
  );
}
