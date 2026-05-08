import { useState } from "react";
import { Icon } from "@/components/ui";
import { POS } from "@/theme/pos";
import { CartRow } from "./CartRow";
import { CartLineEditor } from "./CartLineEditor";
import { PaymentFlow } from "./PaymentFlow";
import type { PayMethod } from "@/hooks/useCartFlow";
import type { ClientSearchResult } from "@/hooks/useClientSearch";
import type { Product } from "@/types";

const fmt = (n: number) => "₡" + Math.round(n).toLocaleString("es-CR");

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  qty: number;
  lineDiscount?: number;
  lineNote?: string;
  product: Product;
}

interface CartSidebarProps {
  cartItems: CartItem[];
  cartTotal: number;
  subtotal: number;
  taxAmount: number;
  items: Record<string, { product: Product; qty: number; lineDiscount?: number; lineNote?: string }>;
  selectedClient: ClientSearchResult | null;
  showPayment: boolean;
  payMethod: PayMethod;
  cashGiven: string;
  sinpeCode: string;
  given: number;
  change: number;
  canConfirm: boolean;
  onAdd: (product: Product) => void;
  onRemove: (id: string) => void;
  onUpdateLine: (id: string, patch: { qty?: number; lineDiscount?: number; lineNote?: string }) => void;
  onShowPayment: () => void;
  onHidePayment: () => void;
  onSelectClient: () => void;
  onClearClient: () => void;
  onPayMethodChange: (m: PayMethod) => void;
  onCashGivenChange: (v: string) => void;
  onSinpeCodeChange: (v: string) => void;
  onConfirmPayment: () => void;
}

export function CartSidebar({
  cartItems,
  cartTotal,
  subtotal,
  taxAmount,
  items,
  selectedClient,
  showPayment,
  payMethod,
  cashGiven,
  sinpeCode,
  given,
  change,
  canConfirm,
  onAdd,
  onRemove,
  onUpdateLine,
  onShowPayment,
  onHidePayment,
  onSelectClient,
  onClearClient,
  onPayMethodChange,
  onCashGivenChange,
  onSinpeCodeChange,
  onConfirmPayment,
}: CartSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingItem = editingId ? items[editingId] : null;

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: POS.surface,
          borderLeft: `1px solid ${POS.border}`,
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${POS.border}`, flexShrink: 0 }}>
          <div style={{ fontFamily: POS.fontDisplay, fontSize: 22, fontWeight: 600, color: POS.text, marginBottom: 12 }}>
            Orden actual
          </div>
          {/* Client selector */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              background: POS.bg,
              borderRadius: 10,
              border: `1px solid ${selectedClient ? POS.rose : POS.border}`,
              cursor: "pointer",
            }}
            onClick={onSelectClient}
          >
            <Icon name="user" size={16} style={{ color: selectedClient ? POS.rose : POS.muted, flexShrink: 0 }} />
            {selectedClient ? (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: POS.fontUI, fontSize: 13, fontWeight: 600, color: POS.rose, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedClient.client_name || selectedClient.business_name || selectedClient.client_gln || "Cliente"}
                </div>
                {selectedClient.identification?.number && (
                  <div style={{ fontFamily: POS.fontUI, fontSize: 10, color: POS.muted }}>{selectedClient.identification.number}</div>
                )}
              </div>
            ) : (
              <span style={{ fontFamily: POS.fontUI, fontSize: 13, color: POS.muted }}>Seleccionar cliente (opcional)</span>
            )}
            {selectedClient && (
              <button
                onClick={(e) => { e.stopPropagation(); onClearClient(); }}
                style={{ background: "none", border: "none", color: POS.muted, cursor: "pointer", padding: 0, display: "flex" }}
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Cart items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 48 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🛒</div>
              <div style={{ fontFamily: POS.fontUI, fontSize: 14, color: POS.muted }}>Carrito vacío</div>
              <div style={{ fontFamily: POS.fontUI, fontSize: 12, color: POS.muted, marginTop: 4 }}>
                Selecciona productos del catálogo
              </div>
            </div>
          ) : (
            cartItems.map((item) => (
              <CartRow
                key={item.id}
                item={item}
                onDecrease={() => onRemove(item.id)}
                onIncrease={() => {
                  if (items[item.id]) onAdd(items[item.id].product);
                }}
                onEdit={() => setEditingId(item.id)}
              />
            ))
          )}
        </div>

        {/* Totals + payment */}
        {cartItems.length > 0 && !showPayment && (
          <div style={{ padding: "16px 20px 20px", borderTop: `1px solid ${POS.border}`, flexShrink: 0 }}>
            <div style={{ marginBottom: 16 }}>
              {[
                { label: "Subtotal", value: fmt(subtotal) },
                { label: "Impuestos", value: fmt(taxAmount) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: POS.fontUI, fontSize: 13, color: POS.muted }}>{label}</span>
                  <span style={{ fontFamily: POS.fontUI, fontSize: 13, color: POS.muted, fontVariantNumeric: "tabular-nums" }}>{value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${POS.border}` }}>
                <span style={{ fontFamily: POS.fontUI, fontSize: 14, fontWeight: 600, color: POS.text }}>Total</span>
                <span style={{ fontFamily: POS.fontDisplay, fontSize: 26, fontWeight: 700, color: POS.rose, fontVariantNumeric: "tabular-nums" }}>
                  {fmt(cartTotal)}
                </span>
              </div>
            </div>
            <button
              onClick={onShowPayment}
              style={{
                width: "100%",
                padding: "15px 0",
                background: POS.rose,
                color: "#1C1C1E",
                border: "none",
                borderRadius: 12,
                fontFamily: POS.fontUI,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              Cobrar {fmt(cartTotal)}
            </button>
          </div>
        )}

        {showPayment && (
          <PaymentFlow
            cartTotal={cartTotal}
            payMethod={payMethod}
            cashGiven={cashGiven}
            sinpeCode={sinpeCode}
            given={given}
            change={change}
            canConfirm={canConfirm}
            onPayMethodChange={onPayMethodChange}
            onCashGivenChange={onCashGivenChange}
            onSinpeCodeChange={onSinpeCodeChange}
            onBack={onHidePayment}
            onConfirm={onConfirmPayment}
          />
        )}
      </div>

      {editingItem && (
        <CartLineEditor
          product={editingItem.product}
          qty={editingItem.qty}
          lineDiscount={editingItem.lineDiscount}
          lineNote={editingItem.lineNote}
          onSave={(patch) => onUpdateLine(editingId!, patch)}
          onClose={() => setEditingId(null)}
        />
      )}
    </>
  );
}
