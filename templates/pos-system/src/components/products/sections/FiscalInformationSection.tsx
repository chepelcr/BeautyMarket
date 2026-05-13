import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Landmark, X, Search, AlertTriangle } from "lucide-react";
import { Spinner } from "@/components/ui";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCabysSearch, useAllProductTypes } from "@/hooks/useDataApi";
import { CountryISO } from "@/lib/enums";
import type { ProductFormState } from "@/types/productForm";
import type { CabysItem } from "@/services/data-api";

const ISO = CountryISO.COSTA_RICA;

interface FiscalInformationSectionProps {
  form: ProductFormState;
  isExpanded: boolean;
  onToggle: () => void;
  disabled?: boolean;
  onChange: (patch: Partial<ProductFormState>) => void;
  onCabysSelect: (item: CabysItem) => void;
}

export function FiscalInformationSection({
  form,
  isExpanded,
  onToggle,
  disabled,
  onChange,
  onCabysSelect,
}: FiscalInformationSectionProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingProductTypeId, setPendingProductTypeId] = useState<number | undefined>();
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: productTypesData } = useAllProductTypes();
  const productTypes = productTypesData ?? [];

  // Search is triggered manually via button/enter — we keep results in state
  const [searchResults, setSearchResults] = useState<CabysItem[]>([]);

  const { refetch: runSearch, isFetching: isFetchingSearch } = useCabysSearch(
    {
      iso_code: ISO,
      search: searchTerm,
      size: 20,
      type: form.productTypeId,
    },
    { enabled: false }
  );

  // Update dropdown position when showing results
  useEffect(() => {
    if (showResults && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [showResults]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim() || !form.productTypeId) return;
    setIsSearching(true);
    try {
      const result = await runSearch();
      const items = result.data?.items ?? [];
      if (items.length === 1) {
        selectCabys(items[0]);
      } else {
        setSearchResults(items);
        setShowResults(true);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const selectCabys = (item: CabysItem) => {
    onChange({
      cabys: item.code,
      cabysDescription: item.description ?? item.code,
    });
    onCabysSelect(item);
    setShowResults(false);
    setSearchTerm(item.description ?? item.code);
  };

  const clearCabys = () => {
    onChange({ cabys: "", cabysDescription: "" });
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleProductTypeClick = (id: number) => {
    if (form.cabys && form.productTypeId !== id) {
      setPendingProductTypeId(id);
      setShowConfirm(true);
    } else {
      onChange({ productTypeId: id });
    }
  };

  const confirmProductTypeChange = () => {
    clearCabys();
    onChange({ productTypeId: pendingProductTypeId, cabys: "", cabysDescription: "" });
    setPendingProductTypeId(undefined);
    setShowConfirm(false);
  };

  const loading = isFetchingSearch || isSearching;

  return (
    <>
      <SectionWrapper
        title={t("products.fiscalInformation")}
        icon={Landmark}
        isExpanded={isExpanded}
        onToggle={onToggle}
        disabled={disabled}
      >
        {/* 1. Product type — radio pills */}
        {productTypes.length > 0 && (
          <div>
            <label className="pp-label">{t("products.productType")}</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              {productTypes.map((pt: { id: number; description: string }) => {
                const selected = form.productTypeId === pt.id;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => handleProductTypeClick(pt.id)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 500,
                      border: `1.5px solid ${selected ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
                      background: selected ? "hsl(var(--primary) / 0.1)" : "transparent",
                      color: selected ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {pt.description}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. CABYS */}
        {form.cabys ? (
          /* Selected state — code is shown here (hidden until selected) */
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              background: "hsl(var(--primary) / 0.06)",
              border: "1.5px solid hsl(var(--primary) / 0.35)",
              borderRadius: 8,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "hsl(var(--primary))",
                  letterSpacing: "0.05em",
                }}
              >
                {form.cabys}
              </div>
              <div style={{ fontSize: 12, marginTop: 2, color: "hsl(var(--foreground))" }}>
                {form.cabysDescription}
              </div>
            </div>
            <button
              type="button"
              onClick={clearCabys}
              className="btn btn-ghost btn-icon btn-sm"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          /* Search state — no code input, just description search */
          <div style={{ position: "relative" }}>
            <label className="pp-label">
              {t("products.searchCabys")}{" "}
              <span style={{ color: "hsl(var(--destructive))" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <Search
                  size={14}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "hsl(var(--muted-foreground))",
                    pointerEvents: "none",
                  }}
                />
                <input
                  ref={inputRef}
                  className="pp-input"
                  placeholder={
                    !form.productTypeId
                      ? t("products.selectProductTypeFirst")
                      : t("products.searchByName")
                  }
                  value={searchTerm}
                  style={{ paddingLeft: 30 }}
                  disabled={!form.productTypeId}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                />
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={!searchTerm.trim() || !form.productTypeId || loading}
                onClick={handleSearch}
                style={{ flexShrink: 0, padding: "0 12px" }}
              >
                {loading ? (
                  <Spinner size={14} />
                ) : (
                  <Search size={14} />
                )}
              </button>
            </div>

            {/* Results dropdown - rendered via portal */}
            {showResults && (searchResults.length > 0 || (!loading && searchResults.length === 0)) && createPortal(
              <div
                ref={dropdownRef}
                style={{
                  position: "absolute",
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: dropdownPosition.width,
                  zIndex: 9999,
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  boxShadow: "0 8px 24px hsl(var(--foreground) / 0.12)",
                  overflow: "hidden",
                  maxHeight: 260,
                  overflowY: "auto",
                }}
              >
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => selectCabys(item)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        textAlign: "left",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        borderBottom: "1px solid hsl(var(--border) / 0.5)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--muted) / 0.5)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "hsl(var(--primary))",
                          fontWeight: 700,
                        }}
                      >
                        {item.code}
                      </span>
                      <span style={{ fontSize: 12, color: "hsl(var(--foreground))" }}>
                        {item.description}
                      </span>
                      {item.tax_rate && (
                        <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
                          {t("products.suggestedIva", { pct: String(item.tax_rate.percentage) })}
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div
                    style={{
                      padding: "12px 16px",
                      fontSize: 12,
                      color: "hsl(var(--muted-foreground))",
                      textAlign: "center",
                    }}
                  >
                    {t("products.noResultsFor", { query: searchTerm })}
                  </div>
                )}
              </div>,
              document.body
            )}
          </div>
        )}

        <p className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
          {t("products.cabysHelp")}
        </p>
      </SectionWrapper>

      {/* Product type change confirmation */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.45)",
          }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "hsl(var(--card))",
              borderRadius: 12,
              padding: "24px",
              width: 360,
              boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <AlertTriangle size={18} style={{ color: "hsl(var(--warning, 38 92% 50%))", flexShrink: 0 }} />
              <span style={{ fontSize: 15, fontWeight: 700 }}>{t("products.changeProductType")}</span>
            </div>
            <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", marginBottom: 20, lineHeight: 1.5 }}>
              {t("products.changeProductTypeWarning")}
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => { setPendingProductTypeId(undefined); setShowConfirm(false); }}
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  background: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 16px",
                  cursor: "pointer",
                }}
                onClick={confirmProductTypeChange}
              >
                {t("common.continue")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
