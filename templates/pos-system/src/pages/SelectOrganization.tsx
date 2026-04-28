import { useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { useLocation } from "wouter";

export default function SelectOrganization() {
  const { user } = useAuthContext();
  const { useUserOrganizations } = useOrganization();
  const { data: orgs = [], isLoading, error } = useUserOrganizations(user?.userId);
  const [, navigate] = useLocation();

  // Auto-select if only one org - must be in useEffect to avoid render-phase navigation
  useEffect(() => {
    if (!isLoading && orgs.length === 1 && !sessionStorage.getItem('selectedOrgId')) {
      console.log('[SelectOrganization] Auto-selecting single org:', orgs[0]);
      sessionStorage.setItem("selectedOrgId", orgs[0].id);
      const role = user?.role;
      const targetPath = role === "cajero" ? "/pos" : "/dashboard";
      console.log('[SelectOrganization] Navigating to:', targetPath, 'User role:', role);
      navigate(targetPath);
    }
  }, [isLoading, orgs, user?.role, navigate]);

  const handleSelect = (org: { id: string; name: string; templateName?: string }) => {
    console.log('[SelectOrganization] User selected org:', org);
    sessionStorage.setItem("selectedOrgId", org.id);
    // Redirect based on role
    const role = user?.role;
    navigate(role === "cajero" ? "/pos" : "/dashboard");
  };

  if (isLoading) {
    console.log('[SelectOrganization] Loading organizations...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted font-barlow text-lg animate-pulse">Cargando organizaciones...</div>
      </div>
    );
  }

  if (error || orgs.length === 0) {
    console.error('[SelectOrganization] Error or no orgs:', { error, orgsCount: orgs.length });
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6">
        <div className="text-4xl">⚠️</div>
        <div className="text-destructive font-barlow font-bold text-xl text-center">
          No tenés organizaciones disponibles
        </div>
        <div className="text-muted text-sm text-center">
          Contactá al administrador para que te agregue a una organización.
        </div>
      </div>
    );
  }

  console.log('[SelectOrganization] Showing org selection, count:', orgs.length);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏢</div>
          <h1 className="font-barlow font-extrabold text-2xl text-foreground">
            SELECCIONÁ TU ORGANIZACIÓN
          </h1>
        </div>

        <div className="flex flex-col gap-3">
          {orgs.map((org) => (
            <button
              key={org.id}
              onClick={() => handleSelect(org)}
              className="w-full px-5 py-4 bg-surface border border-surface-border rounded-xl text-left hover:border-primary transition-colors group"
            >
              <div className="font-barlow font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {org.name}
              </div>
              <div className="text-muted text-xs mt-0.5">{org.template_name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
