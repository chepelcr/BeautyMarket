import { createContext, useContext } from "react";

interface OrgContextValue {
  orgId: string;
  orgName: string;
}

const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({ orgId, orgName, children }: OrgContextValue & { children: React.ReactNode }) {
  return <OrgContext.Provider value={{ orgId, orgName }}>{children}</OrgContext.Provider>;
}

export function useOrgContext(): OrgContextValue {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrgContext must be used inside DashboardLayout");
  return ctx;
}
