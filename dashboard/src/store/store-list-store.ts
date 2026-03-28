import { create } from 'zustand';

interface StoreListState {
  searchQuery: string;
  sortBy: 'storeCode' | 'storeName' | 'chain' | 'slotId';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;

  setSearchQuery: (query: string) => void;
  setSorting: (sortBy: StoreListState['sortBy'], sortOrder: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  resetFilters: () => void;
}

const initialState = {
  searchQuery: '',
  sortBy: 'storeCode' as const,
  sortOrder: 'asc' as const,
  page: 1,
  pageSize: 12,
};

export const useStoreListStore = create<StoreListState>((set) => ({
  ...initialState,

  setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),
  setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
  setPage: (page) => set({ page }),
  setPageSize: (size) => set({ pageSize: size, page: 1 }),
  resetFilters: () => set({ ...initialState }),
}));
