import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProductFilters {
  categoryId?: string;
  isActive?: boolean;
  priceMin?: number;
  priceMax?: number;
}

export interface ProductListState {
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Filters
  filters: ProductFilters;
  setFilters: (filters: ProductFilters) => void;
  clearFilters: () => void;

  // Sorting
  sortBy: 'name' | 'price' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  setSorting: (sortBy: 'name' | 'price' | 'createdAt', sortOrder: 'asc' | 'desc') => void;

  // Pagination
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Selection
  selectedProductIds: Set<string>;
  toggleSelection: (productId: string) => void;
  selectAll: (productIds: string[]) => void;
  clearSelection: () => void;
  isSelected: (productId: string) => boolean;
}

export const useProductListStore = create<ProductListState>()(
  persist(
    (set, get) => ({
      // Search
      searchQuery: '',
      setSearchQuery: (query: string) => set({ searchQuery: query, page: 1 }),

      // Filters
      filters: {},
      setFilters: (filters: ProductFilters) => set({ filters, page: 1 }),
      clearFilters: () => set({ filters: {}, page: 1 }),

      // Sorting
      sortBy: 'createdAt',
      sortOrder: 'desc',
      setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),

      // Pagination
      page: 1,
      pageSize: 12,
      setPage: (page: number) => set({ page }),
      setPageSize: (size: number) => set({ pageSize: size, page: 1 }),

      // Selection
      selectedProductIds: new Set(),
      toggleSelection: (productId: string) => {
        const selected = new Set(get().selectedProductIds);
        if (selected.has(productId)) {
          selected.delete(productId);
        } else {
          selected.add(productId);
        }
        set({ selectedProductIds: selected });
      },
      selectAll: (productIds: string[]) => {
        set({ selectedProductIds: new Set(productIds) });
      },
      clearSelection: () => set({ selectedProductIds: new Set() }),
      isSelected: (productId: string) => get().selectedProductIds.has(productId),
    }),
    {
      name: 'product-list-storage',
      partialize: (state) => ({
        pageSize: state.pageSize,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<ProductListState>),
        // Always initialize selection as empty Set — Sets are not JSON-serializable
        selectedProductIds: new Set<string>(),
      }),
    }
  )
);
