import { Button } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductBulkBarProps {
  count: number;
  onDelete: () => void;
}

export function ProductBulkBar({ count, onDelete }: ProductBulkBarProps) {
  const { t } = useLanguage();
  return (
    <div
      style={{
        marginTop: 12,
        padding: "10px 14px",
        background: "hsl(var(--primary) / 0.08)",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span className="t-sm" style={{ fontWeight: 700 }}>
        {t("products.selected", { n: String(count) })}
      </span>
      <div style={{ flex: 1 }} />
      <Button variant="outline" size="xs" icon="eye">{t("common.activate")}</Button>
      <Button variant="outline" size="xs" icon="eyeOff">{t("common.deactivate")}</Button>
      <Button variant="outline" size="xs" icon="trash" onClick={onDelete}>{t("common.delete")}</Button>
    </div>
  );
}
