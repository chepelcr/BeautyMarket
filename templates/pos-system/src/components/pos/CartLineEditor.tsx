import { useState } from "react";
import { Icon } from "@/components/ui";
import { POS } from "@/theme/pos";
import type { Product } from "@/types";

interface CartLineEditorProps {
  product: Product;
  qty: number;
  lineDiscount?: number;
  lineNote?: string;
  onSave: (patch: { qty: number; lineDiscount: number; lineNote: string }) => void;
  onClose: () => void;
}

const fmt = (n: number) => "₡" + Math.round(n).toLocaleString("es-CR");

export function CartLineEditor({ product, qty, lineDiscount = 0, lineNote = "", onSave, onClose }: CartLineEditorProps) {
  const [editQty, setEditQty] = useState(String(qty));
  const [editDiscount, setEditDiscount] = useState(String(lineDiscount));
  const [editNote, setEditNote] = useState(lineNote);

  const parsedQty = Math.max(1, parseInt(editQty) || 1);
  const parsedDiscount = Math.min(100, Math.max(0, parseFloat(editDiscount) || 0));
  const basePrice = product.sale_price ?? product.price;
  const lineTotal = basePrice * parsedQty * (1 - parsedDiscount / 100);

  const handleSave = () => {
    onSave({ qty: parsedQty, lineDiscount: parsedDiscount, lineNote: editNote.trim() });
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 9000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: POS.surface,
          borderRadius: 16,
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${POS.border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: POS.fontUI, fontSize: 11, fontWeight: 600, color: POS.rose, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
              Editar línea
            </div>
            <div style={{ fontFamily: POS.fontDisplay, fontSize: 18, fontWeight: 600, color: POS.text }}>{product.name}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: POS.muted, cursor: "pointer", padding: 4, display: "flex" }}>
            <Icon name="close" size={18} />
          </button>
        </div>

        <div style={{ padding: "20px 20px 0" }}>
          {/* Quantity */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontFamily: POS.fontUI, fontSize: 12, fontWeight: 600, color: POS.muted, display: "block", marginBottom: 6 }}>
              Cantidad
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => setEditQty(String(Math.max(1, parsedQty - 1)))}
                style={{ width: 36, height: 36, border: `1px solid ${POS.border}`, background: "transparent", color: POS.text, cursor: "pointer", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Icon name="minus" size={14} />
              </button>
              <input
                type="number"
                min={1}
                value={editQty}
                onChange={(e) => setEditQty(e.target.value)}
                style={{ width: 80, padding: "8px 12px", border: `1px solid ${POS.border}`, borderRadius: 8, background: POS.bg, color: POS.text, fontFamily: POS.fontUI, fontSize: 16, fontWeight: 700, textAlign: "center" }}
              />
              <button
                onClick={() => setEditQty(String(parsedQty + 1))}
                style={{ width: 36, height: 36, border: `1px solid ${POS.border}`, background: "transparent", color: POS.rose, cursor: "pointer", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Icon name="plus" size={14} />
              </button>
            </div>
          </div>

          {/* Discount */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontFamily: POS.fontUI, fontSize: 12, fontWeight: 600, color: POS.muted, display: "block", marginBottom: 6 }}>
              Descuento en línea (%)
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={editDiscount}
                onChange={(e) => setEditDiscount(e.target.value)}
                placeholder="0"
                style={{ width: "100%", padding: "10px 40px 10px 12px", border: `1px solid ${POS.border}`, borderRadius: 8, background: POS.bg, color: POS.text, fontFamily: POS.fontUI, fontSize: 14, boxSizing: "border-box" }}
              />
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontFamily: POS.fontUI, fontSize: 14, color: POS.muted }}>%</span>
            </div>
          </div>

          {/* Note */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontFamily: POS.fontUI, fontSize: 12, fontWeight: 600, color: POS.muted, display: "block", marginBottom: 6 }}>
              Nota (descripción alternativa)
            </label>
            <input
              type="text"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder={product.name}
              style={{ width: "100%", padding: "10px 12px", border: `1px solid ${POS.border}`, borderRadius: 8, background: POS.bg, color: POS.text, fontFamily: POS.fontUI, fontSize: 14, boxSizing: "border-box" }}
            />
          </div>

          {/* Taxes (read-only) */}
          {product.taxes && product.taxes.length > 0 && (
            <div style={{ marginBottom: 16, padding: "12px 14px", background: POS.bg, borderRadius: 8, border: `1px solid ${POS.border}` }}>
              <div style={{ fontFamily: POS.fontUI, fontSize: 11, fontWeight: 600, color: POS.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Impuestos del producto
              </div>
              {product.taxes.map((t, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontFamily: POS.fontUI, fontSize: 12, color: POS.muted }}>Código {t.tax_code ?? "—"}</span>
                  <span style={{ fontFamily: POS.fontUI, fontSize: 12, color: POS.text, fontWeight: 600 }}>{t.rate}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Line total preview */}
          <div style={{ padding: "14px 0", borderTop: `1px solid ${POS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontFamily: POS.fontUI, fontSize: 13, color: POS.muted }}>Total de línea</span>
            <span style={{ fontFamily: POS.fontDisplay, fontSize: 22, fontWeight: 700, color: POS.rose }}>{fmt(lineTotal)}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "0 20px 20px", display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "12px 0", border: `1px solid ${POS.border}`, background: "transparent", color: POS.text, borderRadius: 10, fontFamily: POS.fontUI, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            style={{ flex: 2, padding: "12px 0", border: "none", background: POS.rose, color: "#1C1C1E", borderRadius: 10, fontFamily: POS.fontUI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            Aplicar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
