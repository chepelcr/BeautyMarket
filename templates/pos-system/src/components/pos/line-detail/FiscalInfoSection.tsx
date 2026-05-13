import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileCheck, Search, X, AlertTriangle } from 'lucide-react';
import { SectionWrapper } from '@/components/common/SectionWrapper';
import { Spinner } from '@/components/ui';
import { useCabysSearch, useAllProductTypes, useAllTaxes } from '@/hooks/useDataApi';
import { CountryISO } from '@/lib/enums';
import type { LineDetail } from '@/types/lineDetail';
import type { CabysItem } from '@/services/data-api';

const ISO = CountryISO.COSTA_RICA;

interface FiscalInfoSectionProps {
  detail: LineDetail;
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<LineDetail>) => void;
}

export function FiscalInfoSection({ detail, isExpanded, onToggle, onChange }: FiscalInfoSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CabysItem[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingProductTypeId, setPendingProductTypeId] = useState<number | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: productTypesData } = useAllProductTypes();
  const { data: taxTypesData } = useAllTaxes({ iso_code: ISO });
  const productTypes = productTypesData ?? [];
  const taxTypes = taxTypesData ?? [];

  // Add CSS keyframes for fade animation
  useEffect(() => {
    const styleId = 'fiscal-section-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Get product type from detail or default to first one
  const productTypeId = detail.unit_id || (productTypes.length > 0 ? productTypes[0].id : undefined);

  const { refetch: runSearch, isFetching: isFetchingSearch } = useCabysSearch(
    {
      iso_code: ISO,
      search: searchTerm,
      size: 20,
      type: productTypeId,
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
    if (!searchTerm.trim()) return;
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
    // Update CABYS
    onChange({
      cabys: item.code,
    });
    
    // Auto-add IVA tax if suggested rate exists
    if (item.tax_rate?.percentage) {
      const suggestedRate = item.tax_rate.percentage;
      
      // Check if IVA already exists
      const existingIvaTax = detail.taxes.find((t) => {
        const tt = (taxTypes ?? []).find((x: any) => x.id === t.tax_type_id);
        return ['01', '07', '08'].includes(tt?.code ?? '');
      });
      
      const ivaTaxType = (taxTypes ?? []).find((t: any) => t.code === '01');
      
      if (ivaTaxType) {
        if (existingIvaTax) {
          // Update existing IVA rate
          onChange({
            cabys: item.code,
            taxes: detail.taxes.map((t) => {
              const tt = (taxTypes ?? []).find((x: any) => x.id === t.tax_type_id);
              if (['01', '07', '08'].includes(tt?.code ?? '')) {
                return { 
                  ...t, 
                  rate: suggestedRate,
                  tax_rate_id: item.tax_rate?.id,
                };
              }
              return t;
            }),
          });
        } else {
          // Add new IVA tax
          onChange({
            cabys: item.code,
            taxes: [
              ...detail.taxes,
              {
                tax_type_id: ivaTaxType.id,
                rate: suggestedRate,
                tax_rate_id: item.tax_rate?.id,
              },
            ],
          });
        }
      }
    }
    
    setShowResults(false);
    setSearchTerm(item.description ?? item.code);
  };

  const clearCabys = () => {
    onChange({ cabys: undefined });
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleProductTypeClick = (id: number) => {
    if (detail.cabys && detail.unit_id !== id) {
      setPendingProductTypeId(id);
      setShowConfirm(true);
    } else {
      onChange({ unit_id: id });
    }
  };

  const confirmProductTypeChange = () => {
    clearCabys();
    onChange({ unit_id: pendingProductTypeId, cabys: undefined });
    setPendingProductTypeId(undefined);
    setShowConfirm(false);
  };

  const loading = isFetchingSearch || isSearching;

  return (
    <>
      <SectionWrapper
        title="Información Fiscal"
        icon={FileCheck}
        isExpanded={isExpanded}
        onToggle={onToggle}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* 1. Product type — radio pills */}
          {productTypes.length > 0 && (
            <div>
              <label className="pp-label">Tipo de producto</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {productTypes.map((pt: { id: number; description: string }) => {
                  const selected = productTypeId === pt.id;
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

          {/* CABYS code display or search - with transition */}
          <div style={{ 
            transition: 'all 0.3s ease-in-out',
            opacity: 1,
          }}>
            {detail.cabys ? (
              /* Selected state */
              <div style={{
                animation: 'fadeIn 0.3s ease-in-out',
              }}>
                <label className="pp-label">Código CABYS</label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    background: "hsl(var(--primary) / 0.06)",
                    border: "1.5px solid hsl(var(--primary) / 0.35)",
                    borderRadius: 8,
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "hsl(var(--primary))",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {detail.cabys}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearCabys}
                    className="btn btn-ghost btn-icon btn-sm"
                    style={{
                      transition: 'all 0.15s ease-in-out',
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
                <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>
                  El código CABYS se puede modificar para esta línea específica.
                </div>
              </div>
            ) : (
              /* Search state */
              <div style={{ 
                position: "relative",
                animation: 'fadeIn 0.3s ease-in-out',
              }}>
                <label className="pp-label">Buscar código CABYS</label>
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
                        !productTypeId
                          ? "Selecciona tipo de producto primero"
                          : "Buscar por nombre de producto..."
                      }
                      value={searchTerm}
                      style={{ 
                        paddingLeft: 30, 
                        fontSize: 12,
                        transition: 'all 0.15s ease-in-out',
                      }}
                      disabled={!productTypeId}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      onFocus={() => searchResults.length > 0 && setShowResults(true)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={!searchTerm.trim() || !productTypeId || loading}
                    onClick={handleSearch}
                    style={{ 
                      flexShrink: 0, 
                      padding: "0 12px",
                      transition: 'all 0.15s ease-in-out',
                    }}
                  >
                    {loading ? <Spinner size={14} /> : <Search size={14} />}
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
                    animation: 'fadeIn 0.2s ease-in-out',
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
                            IVA sugerido: {item.tax_rate.percentage}%
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
                      No se encontraron resultados para "{searchTerm}"
                    </div>
                  )}
                </div>,
                document.body
              )}

              <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>
                Busca y selecciona un código CABYS para esta línea.
              </div>
            </div>
          )}
          </div>
        </div>
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
              <span style={{ fontSize: 15, fontWeight: 700 }}>Cambiar tipo de producto</span>
            </div>
            <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", marginBottom: 20, lineHeight: 1.5 }}>
              Al cambiar el tipo de producto se eliminará el código CABYS seleccionado. ¿Deseas continuar?
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => { setPendingProductTypeId(undefined); setShowConfirm(false); }}
              >
                Cancelar
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
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
