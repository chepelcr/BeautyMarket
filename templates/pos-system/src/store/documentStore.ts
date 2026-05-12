import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InvoiceFormData, DocTypeCode, DOCUMENT_TYPES } from '@/types/invoice';

export interface DocumentTab {
  id: string;
  type: 'new' | 'existing';
  title: string;
  doc_type: DocTypeCode;
  data?: Partial<InvoiceFormData>;
  is_dirty?: boolean;
}

type ViewMode = 'tabs' | 'list';

interface DocumentStore {
  open_documents: DocumentTab[];
  active_document_tab: string | null;
  view_mode: ViewMode;
  is_received: boolean;

  // Tab actions
  addDocumentTab: (tab: DocumentTab) => void;
  removeDocumentTab: (id: string) => void;
  setActiveDocumentTab: (id: string) => void;
  updateDocumentTab: (id: string, patch: Partial<DocumentTab>) => void;
  closeAllTabs: () => void;

  // View actions
  setViewMode: (mode: ViewMode) => void;
  setIsReceived: (received: boolean) => void;
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      open_documents: [],
      active_document_tab: null,
      view_mode: 'list',
      is_received: false,

      addDocumentTab: (tab) => {
        set((state) => ({
          open_documents: [...state.open_documents, tab],
          active_document_tab: tab.id,
          view_mode: 'tabs',
        }));
      },

      removeDocumentTab: (id) => {
        set((state) => {
          const remaining = state.open_documents.filter((d) => d.id !== id);
          const was_active = state.active_document_tab === id;
          const new_active = was_active
            ? remaining.length > 0
              ? remaining[remaining.length - 1].id
              : null
            : state.active_document_tab;

          return {
            open_documents: remaining,
            active_document_tab: new_active,
            view_mode: remaining.length === 0 ? 'list' : state.view_mode,
          };
        });
      },

      setActiveDocumentTab: (id) => set({ active_document_tab: id }),

      updateDocumentTab: (id, patch) => {
        set((state) => ({
          open_documents: state.open_documents.map((doc) =>
            doc.id === id ? { ...doc, ...patch } : doc
          ),
        }));
      },

      closeAllTabs: () =>
        set({ open_documents: [], active_document_tab: null, view_mode: 'list' }),

      setViewMode: (mode) => set({ view_mode: mode }),

      setIsReceived: (received) => set({ is_received: received }),
    }),
    {
      name: 'pos-document-store',
      partialize: (state) => ({
        open_documents: state.open_documents,
        active_document_tab: state.active_document_tab,
        view_mode: state.view_mode,
        is_received: state.is_received,
      }),
    }
  )
);

/** Helper: create a new document tab ID */
export function newDocTabId(): string {
  return `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
