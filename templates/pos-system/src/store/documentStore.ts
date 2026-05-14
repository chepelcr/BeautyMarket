import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InvoiceFormData, DocTypeCode } from '@/types/invoice';
import type { ClientSearchResult } from '@/hooks/useClientSearch';

// Cart item structure (matching cart store)
interface CartItem {
  product: any;
  qty: number;
  lineDiscount?: number;
  lineNote?: string;
  lineDetail?: any;
}

export interface DocumentTab {
  id: string;
  type: 'new' | 'existing';
  title: string;
  doc_type: DocTypeCode;
  /** Invoice form state — receiver, references, payments, copy_emails, sale_condition_id, currency_code, etc. */
  data?: Partial<InvoiceFormData>;
  is_dirty?: boolean;
  opened_at?: number;
  /** Cart state per tab — hydrated/saved by POSIntegratedPage on tab activation */
  cart_items?: Record<string, CartItem>;
  /** Selected client for this tab — drives CartSidebar pill and ReceiverTab pre-fill */
  selected_client?: ClientSearchResult | null;
}

interface DocumentStore {
  /** Open document tabs (drafts being edited) */
  open_documents: DocumentTab[];
  /** Active tab id — mirrors the URL when on /dashboard/documents/new/:tabId */
  active_document_tab: string | null;
  /** List filter: Emitidos (false) vs Recibidos (true) */
  is_received: boolean;

  // Tab actions
  addDocumentTab: (tab: DocumentTab) => void;
  removeDocumentTab: (id: string) => void;
  setActiveDocumentTab: (id: string | null) => void;
  updateDocumentTab: (id: string, patch: Partial<DocumentTab>) => void;
  closeAllTabs: () => void;

  // List filter
  setIsReceived: (received: boolean) => void;
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set) => ({
      open_documents: [],
      active_document_tab: null,
      is_received: false,

      addDocumentTab: (tab) => {
        set((state) => ({
          open_documents: [...state.open_documents, { ...tab, cart_items: {} }],
          active_document_tab: tab.id,
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
        set({ open_documents: [], active_document_tab: null }),

      setIsReceived: (received) => set({ is_received: received }),
    }),
    {
      name: 'pos-document-store',
      partialize: (state) => ({
        open_documents: state.open_documents,
        active_document_tab: state.active_document_tab,
        is_received: state.is_received,
      }),
    }
  )
);

/** Helper: create a new document tab ID */
export function newDocTabId(): string {
  return `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
