import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  showCheckout: boolean;
  activeCategory?: string;
  total: number;
  
  // Actions
  addToCart: (product: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setShowCheckout: (show: boolean) => void;
  setActiveCategory: (category: string) => void;
  clearActiveCategory: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      showCheckout: false,
      activeCategory: undefined,
      total: 0,

      addToCart: (product) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === product.id);

        if (existingItem) {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                : item
            ),
            total: state.items.reduce((sum, item) => 
              item.id === product.id 
                ? sum + (item.price * (item.quantity + (product.quantity || 1)))
                : sum + (item.price * item.quantity), 0
            ),
          }));
        } else {
          const newItem: CartItem = { ...product, quantity: product.quantity || 1 };
          set((state) => ({
            items: [...state.items, newItem],
            total: state.total + (newItem.price * newItem.quantity),
          }));
        }
      },

      removeFromCart: (productId) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== productId);
          return {
            items: newItems,
            total: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          };
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
          total: state.items.reduce((sum, item) => 
            item.id === productId 
              ? sum + (item.price * quantity)
              : sum + (item.price * item.quantity), 0
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], total: 0 });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      setShowCheckout: (show) => {
        set({ showCheckout: show });
      },

      setActiveCategory: (category) => {
        set({ activeCategory: category });
      },

      clearActiveCategory: () => {
        set({ activeCategory: undefined });
      },
    }),
    {
      name: "strawberry-cart-storage",
      partialize: (state) => ({ items: state.items, total: state.total }),
    }
  )
);
