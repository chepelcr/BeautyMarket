import { create } from 'zustand';
import { MAX_VISIBLE_TABS } from './documentStore';

/**
 * Minimal shared UI-state store. Currently tracks whether the left dashboard
 * sidebar is collapsed, because that affects how many open-document tabs fit
 * in the global navbar (DocumentsToolbar):
 *
 *  - Sidebar open    → less horizontal room → 2 tabs visible
 *  - Sidebar closed  → more room            → 3 tabs visible (= MAX_VISIBLE_TABS)
 *
 * Anything in the open-documents list beyond that count becomes "overflow" and
 * is only reachable through the right-side DocumentsMobileDrawer.
 */
interface UIStore {
  sidebar_collapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebar_collapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebar_collapsed: collapsed }),
  toggleSidebar: () => set((s) => ({ sidebar_collapsed: !s.sidebar_collapsed })),
}));

/**
 * Returns the number of document tabs that fit in the global navbar at the
 * current sidebar state. Tabs beyond this index are "overflow" and live in
 * the documents drawer.
 */
export function useMaxVisibleTabs(): number {
  const collapsed = useUIStore((s) => s.sidebar_collapsed);
  return collapsed ? MAX_VISIBLE_TABS : MAX_VISIBLE_TABS - 1;
}
