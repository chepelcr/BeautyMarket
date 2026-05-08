import { Icon } from "@/components/ui";
import { POS } from "@/theme/pos";
import type { ClientSearchResult } from "@/hooks/useClientSearch";

interface ClientSelectorProps {
  clients: ClientSearchResult[];
  isLoading: boolean;
  query: string;
  selected: ClientSearchResult | null;
  onQueryChange: (v: string) => void;
  onSelect: (client: ClientSearchResult) => void;
}

export function ClientSelector({ clients, isLoading, query, selected, onQueryChange, onSelect }: ClientSelectorProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${POS.border}`, flexShrink: 0 }}>
        <div style={{ fontFamily: POS.fontDisplay, fontSize: 22, fontWeight: 600, color: POS.text, marginBottom: 12 }}>
          Clientes
        </div>
        <div style={{ position: "relative" }}>
          <Icon name="search" size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: POS.muted }} />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar por nombre, cédula..."
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${POS.border}`,
              borderRadius: 10,
              color: POS.text,
              fontFamily: POS.fontUI,
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px" }}>
        {isLoading ? (
          <div style={{ paddingTop: 32, textAlign: "center", color: POS.muted, fontFamily: POS.fontUI, fontSize: 14 }}>
            Cargando...
          </div>
        ) : clients.length === 0 ? (
          <div style={{ paddingTop: 32, textAlign: "center", color: POS.muted, fontFamily: POS.fontUI, fontSize: 14 }}>
            Sin resultados
          </div>
        ) : (
          clients.map((c) => (
            <button
              key={c.client_id}
              onClick={() => onSelect(c)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderBottom: `1px solid ${POS.border}`,
                background: "transparent",
                border: "none",
                borderBottomColor: POS.border,
                cursor: "pointer",
                textAlign: "left",
                font: "inherit",
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: POS.roseLight, border: `1px solid ${POS.rose}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: POS.fontDisplay, fontSize: 18, color: POS.rose, fontWeight: 600 }}>
                  {(c.client_name || c.business_name || c.client_gln || "?").charAt(0).toUpperCase()}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: POS.fontUI, fontSize: 14, fontWeight: 600, color: POS.text }}>
                  {c.client_name || c.business_name || c.client_gln || "Sin nombre"}
                </div>
                {c.identification?.number && (
                  <div style={{ fontFamily: POS.fontUI, fontSize: 12, color: POS.muted }}>{c.identification.number}</div>
                )}
              </div>
              {selected?.client_id === c.client_id && (
                <Icon name="check" size={16} style={{ color: POS.rose, flexShrink: 0 }} />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
