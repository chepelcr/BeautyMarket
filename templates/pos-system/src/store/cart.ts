import { create } from "zustand";
import type { Product } from "../types";

interface CartItem {
  product: Product;
  qty: number;
  lineDiscount?: number; // percentage override for this line (e.g. 10 = 10%)
  lineNote?: string;     // description override for this line
}

interface CartStore {
  items: Record<string, CartItem>;
  add: (product: Product) => void;
  remove: (productId: string) => void;
  updateLine: (productId: string, patch: { qty?: number; lineDiscount?: number; lineNote?: string }) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: {},

  add: (product) => {
    const pid = product.product_id;
    set((state) => ({
      items: {
        ...state.items,
        [pid]: {
          product,
          qty: (state.items[pid]?.qty ?? 0) + 1,
          lineDiscount: state.items[pid]?.lineDiscount,
          lineNote: state.items[pid]?.lineNote,
        },
      },
    }));
  },

  remove: (productId) => {
    set((state) => {
      const item = state.items[productId];
      if (!item) return state;
      if (item.qty <= 1) {
        const { [productId]: _, ...rest } = state.items;
        return { items: rest };
      }
      return {
        items: {
          ...state.items,
          [productId]: { ...item, qty: item.qty - 1 },
        },
      };
    });
  },

  updateLine: (productId, patch) => {
    set((state) => {
      const item = state.items[productId];
      if (!item) return state;
      const updated = { ...item };
      if (patch.qty !== undefined && patch.qty > 0) updated.qty = patch.qty;
      if (patch.lineDiscount !== undefined) updated.lineDiscount = patch.lineDiscount;
      if (patch.lineNote !== undefined) updated.lineNote = patch.lineNote;
      return { items: { ...state.items, [productId]: updated } };
    });
  },

  clear: () => set({ items: {} }),

  total: () =>
    Object.values(get().items).reduce(
      (sum, { product, qty }) => sum + Number(product.sale_price ?? product.price ?? 0) * qty,
      0
    ),

  count: () =>
    Object.values(get().items).reduce((sum, { qty }) => sum + qty, 0),
}));
