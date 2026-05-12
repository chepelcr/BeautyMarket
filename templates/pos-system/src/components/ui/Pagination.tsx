import { useLanguage } from "@/contexts/LanguageContext";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  itemName?: string; // e.g., "productos", "clientes"
  pageSizeOptions?: number[]; // e.g., [12, 24, 48, 96]
}

export function Pagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemName = "elementos",
  pageSizeOptions = [12, 24, 48, 96],
}: PaginationProps) {
  const { t } = useLanguage();

  // Show pagination if there are multiple pages OR if page size selector is enabled
  if (totalPages <= 1 && !onPageSizeChange) return null;

  // Calculate the actual range of items being displayed
  // Use the actual pageSize from backend response, not the requested one
  const startItem = totalElements > 0 ? (page - 1) * pageSize + 1 : 0;
  const endItem = Math.min(startItem + pageSize - 1, totalElements);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 24,
        flexWrap: "wrap",
        gap: 10,
      }}
    >
      {/* Info + Page Size Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
          Mostrando {startItem}-{endItem} de {totalElements} {itemName}
        </span>
        
        {onPageSizeChange && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
              Mostrar:
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                onPageChange(1); // Reset to first page BEFORE changing page size
                onPageSizeChange(newSize);
              }}
              style={{
                padding: "4px 8px",
                border: "1px solid hsl(var(--border))",
                borderRadius: 6,
                background: "hsl(var(--background))",
                color: "hsl(var(--foreground))",
                fontSize: 12,
                fontFamily: "'DM Sans', system-ui, sans-serif",
                cursor: "pointer",
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            style={{
              padding: "8px 16px",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              background: "transparent",
              color: page <= 1 ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))",
              fontSize: 13,
              fontFamily: "'DM Sans', system-ui, sans-serif",
              cursor: page <= 1 ? "not-allowed" : "pointer",
              opacity: page <= 1 ? 0.45 : 1,
              transition: "all 0.2s",
            }}
          >
            ← {t("common.previous")}
          </button>

          {/* Page Info */}
          <span
            style={{
              fontSize: 13,
              color: "hsl(var(--foreground))",
              fontWeight: 600,
              padding: "0 8px",
            }}
          >
            {page} / {totalPages}
          </span>

          {/* Next Button */}
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            style={{
              padding: "8px 16px",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              background: "transparent",
              color: page >= totalPages ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))",
              fontSize: 13,
              fontFamily: "'DM Sans', system-ui, sans-serif",
              cursor: page >= totalPages ? "not-allowed" : "pointer",
              opacity: page >= totalPages ? 0.45 : 1,
              transition: "all 0.2s",
            }}
          >
            {t("common.next")} →
          </button>
        </div>
      )}
    </div>
  );
}
