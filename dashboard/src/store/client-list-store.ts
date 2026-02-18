import { create } from 'zustand';

interface ClientListState {
  searchQuery: string;
  sortBy: 'clientName' | 'clientGln' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;

  setSearchQuery: (query: string) => void;
  setSorting: (sortBy: 'clientName' | 'clientGln' | 'createdAt' | 'updatedAt', sortOrder: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  resetFilters: () => void;
}

const initialState = {
  searchQuery: '',
  sortBy: 'createdAt' as const,
  sortOrder: 'desc' as const,
  page: 1,
  pageSize: 12,
};

export const useClientListStore = create<ClientListState>((set) => ({
  ...initialState,

  setSearchQuery: (query) =>
    set({ searchQuery: query, page: 1 }),

  setSorting: (sortBy, sortOrder) =>
    set({ sortBy, sortOrder, page: 1 }),

  setPage: (page) =>
    set({ page }),

  setPageSize: (size) =>
    set({ pageSize: size, page: 1 }),

  resetFilters: () =>
    set({ ...initialState }),
}));
