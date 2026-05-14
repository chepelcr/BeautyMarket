import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ROUTES } from "@/routePaths";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { OrgProvider } from "@/contexts/OrgContext";
import { crossAppApi, crossAppOrgPath } from "@/lib/api";
import DashboardShell from "@/components/layout/DashboardShell";

type NavId = "dashboard" | "config" | "puestos" | "productos" | "reporte" | "pos" | "documents" | "clients";

interface Session {
  name: string;
  context: string;
  status: number;
}

function getActiveNav(location: string): NavId {
  console.log('[DashboardLayout] getActiveNav called with location:', location);
  if (location.startsWith(ROUTES.DASHBOARD_SESSIONS)) return "config";
  if (location.startsWith(ROUTES.DASHBOARD_STATIONS)) return "puestos";
  if (location.startsWith(ROUTES.DASHBOARD_PRODUCTS)) return "productos";
  if (location.startsWith(ROUTES.DASHBOARD_REPORTS))  return "reporte";
  // Document editor and list both highlight the "documents" sidebar item
  if (location.startsWith(ROUTES.DASHBOARD_DOCUMENTS)) return "documents";
  // Legacy /dashboard/pos route also maps to documents (POS is now an editor view)
  if (location.startsWith(ROUTES.DASHBOARD_POS))      return "documents";
  if (location.startsWith(ROUTES.DASHBOARD_CLIENTS))  return "clients";
  return "dashboard";
}

const NAV_PATHS: Record<NavId, string> = {
  dashboard: ROUTES.DASHBOARD,
  config:    ROUTES.DASHBOARD_SESSIONS,
  puestos:   ROUTES.DASHBOARD_STATIONS,
  productos: ROUTES.DASHBOARD_PRODUCTS,
  reporte:   ROUTES.DASHBOARD_REPORTS,
  pos:       ROUTES.DASHBOARD_POS,
  documents: ROUTES.DASHBOARD_DOCUMENTS,
  clients:   ROUTES.DASHBOARD_CLIENTS,
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);
  const [location, navigate] = useLocation();

  const active = getActiveNav(location);

  const handleNav = (id: NavId) => {
    navigate(NAV_PATHS[id]);
  };

  const { data: sessionsData } = useQuery({
    queryKey: ["active-session", org?.id],
    enabled: !!org,
    staleTime: 60_000,
    queryFn: () =>
      crossAppApi.get<{ data: Session[] }>(crossAppOrgPath(org!.id, "/sessions?page_size=100&search=status:1")),
  });
  const activeSession = sessionsData?.data?.[0];

  if (!org) {
    // Org still loading — shell renders with empty content
    return (
      <DashboardShell active={active} onNav={handleNav}>
        {null}
      </DashboardShell>
    );
  }

  return (
    <OrgProvider orgId={org.id} orgName={org.name ?? ""}>
      <DashboardShell
        active={active}
        onNav={handleNav}
        sessionName={activeSession?.name}
        sessionLocation={activeSession?.context}
      >
        {children}
      </DashboardShell>
    </OrgProvider>
  );
}
