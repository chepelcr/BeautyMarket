import { create } from "zustand";
import type { Product } from "../hooks/useProducts";

interface CartItem {
  product: Product;
  qty: number;
}

interface CartStore {
  items: Record<number, CartItem>;
  add: (product: Product) => void;
  remove: (productId: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: {},

  add: (product) => {
    if ((product.stock_quantity ?? 0) === 0) return;
    const pid = parseInt(product.id, 10);
    set((state) => ({
      items: {
        ...state.items,
        [pid]: {
          product,
          qty: (state.items[pid]?.qty ?? 0) + 1,
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

  clear: () => set({ items: {} }),

  total: () =>
    Object.values(get().items).reduce(
      (sum, { product, qty }) => sum + product.price * qty,
      0
    ),

  count: () =>
    Object.values(get().items).reduce((sum, { qty }) => sum + qty, 0),
}));
