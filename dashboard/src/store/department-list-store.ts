import { create } from 'zustand';

interface DepartmentListState {
  searchQuery: string;
  sortBy: 'departmentCode' | 'name' | 'supplierCode' | 'createdOn' | 'updatedOn';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;

  setSearchQuery: (query: string) => void;
  setSorting: (sortBy: DepartmentListState['sortBy'], sortOrder: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  resetFilters: () => void;
}

const initialState = {
  searchQuery: '',
  sortBy: 'departmentCode' as const,
  sortOrder: 'asc' as const,
  page: 1,
  pageSize: 12,
};

export const useDepartmentListStore = create<DepartmentListState>((set) => ({
  ...initialState,

  setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),
  setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
  setPage: (page) => set({ page }),
  setPageSize: (size) => set({ pageSize: size, page: 1 }),
  resetFilters: () => set({ ...initialState }),
}));
