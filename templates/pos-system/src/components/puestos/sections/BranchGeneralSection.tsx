import { Store } from "lucide-react";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { Icon, Input, FormLabel } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import type { BranchType } from "@/types";

interface BranchGeneralSectionProps {
  name: string;
  setName: (value: string) => void;
  code: number | "";
  setCode: (value: number | "") => void;
  type: BranchType;
  setType: (value: BranchType) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export function BranchGeneralSection({
  name,
  setName,
  code,
  setCode,
  type,
  setType,
  isExpanded,
  onToggle,
}: BranchGeneralSectionProps) {
  const { t } = useLanguage();
  
  const TYPE_LABEL: Record<BranchType, string> = { 
    stand: t("puestos.stand"), 
    restaurant: t("puestos.restaurant") 
  };

  return (
    <SectionWrapper
      title="Información General"
      icon={Store}
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Type toggle */}
        <div>
          <FormLabel style={{ marginBottom: 8 }}>{t("session.sessionType")}</FormLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {(["stand", "restaurant"] as BranchType[]).map((bt) => (
              <button
                key={bt}
                type="button"
                onClick={() => setType(bt)}
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: `2px solid ${type === bt ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
                  background: type === bt ? "hsl(var(--primary) / 0.08)" : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "var(--font-sans)",
                  fontWeight: type === bt ? 700 : 500,
                  fontSize: 14,
                  color: type === bt ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                  transition: "all 0.15s",
                }}
              >
                <Icon name={bt === "stand" ? "store" : "home"} size={15} />
                {TYPE_LABEL[bt]}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <FormLabel htmlFor="b-name" required>
            {t("products.name")}
          </FormLabel>
          <Input
            id="b-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ej. Puesto Principal, Sector Norte…"
          />
        </div>

        {/* Code */}
        <div>
          <FormLabel htmlFor="b-code" required>
            {t("products.sku")}
          </FormLabel>
          <Input
            id="b-code"
            required
            type="number"
            min={1}
            value={code}
            onChange={(e) => setCode(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="ej. 1"
            style={{ fontFamily: "var(--font-mono)" }}
          />
          <p className="t-xs" style={{ marginTop: 4, color: "hsl(var(--muted-foreground))" }}>
            Número único por organización (entero positivo).
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
