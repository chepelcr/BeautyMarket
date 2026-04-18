import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { api, userPath } from "@/lib/api";

interface OrgOption {
  id: string;
  name: string;
  templateName: string;
}

export default function SelectOrganization() {
  const { user, selectOrg } = useAuthContext();
  const [, navigate] = useLocation();

  const { data: orgs = [], isLoading, error } = useQuery({
    queryKey: ["user-orgs", user?.userId],
    enabled: !!user,
    queryFn: () =>
      api.get<OrgOption[]>(userPath(user!.userId, "/organizations")),
  });

  // Auto-select if only one org
  useEffect(() => {
    if (orgs.length === 1) {
      handleSelect(orgs[0]);
    }
  }, [orgs]);

  const handleSelect = (org: OrgOption) => {
    if (org.templateName !== "pollos-sales") {
      alert("Esta organización no tiene el template Pollos Sales.");
      return;
    }
    selectOrg(org);
    // Redirect based on role
    const role = user?.role;
    navigate(role === "cajero" ? "/pos" : "/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted font-barlow text-lg animate-pulse">Cargando organizaciones...</div>
      </div>
    );
  }

  if (error || orgs.length === 0) {
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
              <div className="text-muted text-xs mt-0.5">{org.templateName}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
