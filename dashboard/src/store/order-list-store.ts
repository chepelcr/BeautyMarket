import { create } from 'zustand';

export interface OrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  creationStartDate?: string;
  creationEndDate?: string;
}

interface OrderListState {
  searchQuery: string;
  filters: OrderFilters;
  sortBy: 'createdAt' | 'customerName' | 'deliveryDate';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;

  setSearchQuery: (query: string) => void;
  setFilters: (filters: OrderFilters) => void;
  setSorting: (sortBy: 'createdAt' | 'customerName' | 'deliveryDate', sortOrder: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  resetFilters: () => void;
}

const initialState = {
  searchQuery: '',
  filters: {},
  sortBy: 'createdAt' as const,
  sortOrder: 'desc' as const,
  page: 1,
  pageSize: 12,
};

export const useOrderListStore = create<OrderListState>((set) => ({
  ...initialState,

  setSearchQuery: (query) =>
    set({ searchQuery: query, page: 1 }),

  setFilters: (filters) =>
    set({ filters, page: 1 }),

  setSorting: (sortBy, sortOrder) =>
    set({ sortBy, sortOrder, page: 1 }),

  setPage: (page) =>
    set({ page }),

  setPageSize: (size) =>
    set({ pageSize: size, page: 1 }),

  resetFilters: () =>
    set({ ...initialState }),
}));
