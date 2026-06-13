import { create } from 'zustand';

interface ConfirmationListState {
  page: number;
  pageSize: number;

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export const useConfirmationListStore = create<ConfirmationListState>((set) => ({
  page: 1,
  pageSize: 12,

  setPage: (page) =>
    set({ page }),

  setPageSize: (size) =>
    set({ pageSize: size, page: 1 }),
}));
