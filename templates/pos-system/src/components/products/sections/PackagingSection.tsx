import { Package2 } from "lucide-react";
import { SectionWrapper } from "@/components/common/SectionWrapper";

interface PackagingSectionProps {
  unitsPerBox: string;
  isExpanded: boolean;
  onToggle: () => void;
  disabled?: boolean;
  onChange: (unitsPerBox: string) => void;
}

export function PackagingSection({
  unitsPerBox,
  isExpanded,
  onToggle,
  disabled,
  onChange,
}: PackagingSectionProps) {
  return (
    <SectionWrapper
      title="Información de empaque"
      icon={Package2}
      isExpanded={isExpanded}
      onToggle={onToggle}
      disabled={disabled}
    >
      <div>
        <label className="pp-label">
          Unidades por caja <span style={{ color: "hsl(var(--destructive))" }}>*</span>
        </label>
        <input
          type="number"
          className="pp-input"
          placeholder="Ej: 12"
          min={1}
          value={unitsPerBox}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </SectionWrapper>
  );
}
