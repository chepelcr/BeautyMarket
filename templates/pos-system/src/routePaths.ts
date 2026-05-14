export const ROUTES = {
  LOGIN: "/login",
  SELECT_ORG: "/organizations/select",

  DASHBOARD: "/dashboard",
  DASHBOARD_SESSIONS: "/dashboard/sessions",
  DASHBOARD_STATIONS: "/dashboard/stations",
  DASHBOARD_PRODUCTS: "/dashboard/products",
  DASHBOARD_REPORTS: "/dashboard/reports",
  DASHBOARD_POS: "/dashboard/pos",
  DASHBOARD_DOCUMENTS: "/dashboard/documents",
  DASHBOARD_CLIENTS: "/dashboard/clients",
} as const;

/** Build editor URL for a specific tab id */
export function documentEditorPath(tabId: string) {
  return `/dashboard/documents/new/${tabId}`;
}
