import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { LineDetailModal } from './line-detail/LineDetailModal';
import { DOCUMENT_TYPES } from '@/types/invoice';
import type { DocTypeCode } from '@/types/invoice';
import type { ClientSearchResult } from '@/hooks/useClientSearch';
import type { Product } from '@/types';

const fmt = (n: number) => '₡' + Math.round(n).toLocaleString('es-CR');

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
  onAdd: (product: Product) => void;
  onRemove: (id: string) => void;
  onUpdateLine: (id: string, patch: { qty?: number; lineDiscount?: number; lineNote?: string }) => void;
  onCheckout: () => void;
  onSelectClient: () => void;
  onClearClient: () => void;
}

export function CartSidebar({
  cartItems,
  cartTotal,
  subtotal,
  taxAmount,
  items,
  selectedClient,
  onAdd,
  onRemove,
  onUpdateLine,
  onCheckout,
  onSelectClient,
  onClearClient,
}: CartSidebarProps) {
  const { doc_type, setDocType } = useCart();
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingItem = editingId ? items[editingId] : null;

  return (
    <>
      <aside className="flex flex-col bg-card overflow-hidden border-l border-border">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-[15px]">Orden</span>
            <span className="px-1.5 h-5 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold t-num">
              {cartItems.length}
            </span>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={() => useCart.getState().clear()}
              className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Document type selector */}
        <div className="px-3 py-2 border-b border-border shrink-0">
          <div className="grid grid-cols-3 gap-1 p-0.5 rounded-md bg-muted">
            {DOCUMENT_TYPES.slice(0, 3).map((dt) => (
              <button
                key={dt.code}
                onClick={() => setDocType(dt.code as DocTypeCode)}
                title={dt.label}
                className={cn(
                  'h-7 rounded text-[11px] font-display font-bold uppercase tracking-wider transition-colors',
                  doc_type === dt.code
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {dt.short}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1 p-0.5 rounded-md mt-1">
            {DOCUMENT_TYPES.slice(3).map((dt) => (
              <button
                key={dt.code}
                onClick={() => setDocType(dt.code as DocTypeCode)}
                title={dt.label}
                className={cn(
                  'h-7 rounded text-[10px] font-display font-bold uppercase tracking-wider transition-colors',
                  doc_type === dt.code
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {dt.short}
              </button>
            ))}
          </div>
        </div>

        {/* Customer button */}
        <div className="px-3 py-2 border-b border-border shrink-0">
          <button
            onClick={onSelectClient}
            className={cn(
              'w-full h-9 rounded-md border border-dashed text-[12px] flex items-center justify-between px-3 hover:bg-muted transition-colors',
              selectedClient ? 'border-primary text-primary' : 'border-border text-muted-foreground'
            )}
          >
            <span className="truncate flex items-center gap-2">
              <span className="shrink-0">👤</span>
              <span className="truncate">
                {selectedClient
                  ? selectedClient.client_name || selectedClient.business_name || 'Cliente'
                  : 'Cliente (opcional)'}
              </span>
            </span>
            {selectedClient ? (
              <button
                onClick={(e) => { e.stopPropagation(); onClearClient(); }}
                className="text-muted-foreground hover:text-destructive shrink-0 ml-1"
              >
                ✕
              </button>
            ) : (
              <span className="text-muted-foreground shrink-0">›</span>
            )}
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-auto scroll-area px-3 py-2 space-y-2">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-8 gap-2">
              <span className="text-3xl opacity-40">🛒</span>
              <div className="text-[12px]">Carrito vacío<br />Selecciona productos del catálogo</div>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="rounded-md border border-border bg-background p-2.5">
                <div className="flex justify-between gap-2">
                  <span className="text-[12px] font-semibold leading-tight line-clamp-1">{item.lineNote || item.name}</span>
                  <span className="text-[11px] font-mono t-num shrink-0">{fmt(item.price * item.qty)}</span>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <button
                    onClick={() => setEditingId(item.id)}
                    className="text-[10px] text-muted-foreground hover:text-primary px-1.5 py-0.5 rounded border border-border hover:border-primary/40"
                  >
                    %
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onRemove(item.id)}
                      className="w-6 h-6 rounded border border-border bg-card flex items-center justify-center text-muted-foreground hover:border-primary/40 text-xs"
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-[12px] font-mono t-num">{item.qty}</span>
                    <button
                      onClick={() => items[item.id] && onAdd(items[item.id].product)}
                      className="w-6 h-6 rounded border border-border bg-card flex items-center justify-center text-muted-foreground hover:border-primary/40 text-xs"
                    >
                      +
                    </button>
                    <button
                      onClick={() => onUpdateLine(item.id, { qty: 0 })}
                      className="w-6 h-6 rounded border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 ml-1 text-xs"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div className="px-4 py-3 border-t border-border space-y-1 text-[12px] shrink-0">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono t-num">{fmt(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">I.V.A.</span>
            <span className="font-mono t-num">{fmt(taxAmount)}</span>
          </div>
          <div className="flex justify-between text-[15px] font-display font-extrabold pt-1">
            <span>Total</span>
            <span className="font-mono t-num text-primary">{fmt(cartTotal)}</span>
          </div>
          <button
            onClick={onCheckout}
            disabled={cartItems.length === 0}
            className="mt-2 w-full h-11 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cobrar · {fmt(cartTotal)}
            <span>›</span>
          </button>
        </div>
      </aside>

      {/* Line detail modal */}
      {editingItem && (
        <LineDetailModal
          product={editingItem.product}
          qty={editingItem.qty}
          lineDiscount={editingItem.lineDiscount}
          lineNote={editingItem.lineNote}
          onSave={(patch) => { onUpdateLine(editingId!, patch); setEditingId(null); }}
          onClose={() => setEditingId(null)}
        />
      )}
    </>
  );
}
