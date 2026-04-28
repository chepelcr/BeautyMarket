import { Route, Switch, Redirect, useLocation } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Login from "@/pages/Login";
import SelectOrganization from "@/pages/SelectOrganization";
import POSPage from "@/pages/pos/POSPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";

function ProtectedRoute({
  component: Component,
  roles,
}: {
  component: React.ComponentType;
  roles?: string[];
}) {
  const { user, isLoading } = useAuthContext();
  const [location] = useLocation();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted font-barlow text-lg animate-pulse">{t("common.loading")}</div>
      </div>
    );
  }

  if (!user) {
    sessionStorage.setItem("redirectAfterLogin", location);
    return <Redirect to="/login" />;
  }

  if (roles && user.role && !roles.includes(user.role)) {
    const targetPath = user.role === "cajero" ? "/pos" : "/dashboard";
    if (location === targetPath) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🚫</div>
            <div className="text-destructive font-barlow font-bold text-xl">
              {t("app.noPermissions")}
            </div>
            <div className="text-muted text-sm mt-2">
              {t("app.yourRole")} {user.role}
            </div>
          </div>
        </div>
      );
    }
    return <Redirect to={targetPath} />;
  }

  return <Component />;
}

export default function App() {
  const { user, isLoading } = useAuthContext();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl animate-bounce">🏪</div>
          <div className="text-primary font-barlow text-xl font-bold animate-pulse">
            {t("common.loading")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route
        path="/organizations/select"
        component={() => (
          <ProtectedRoute component={SelectOrganization} />
        )}
      />
      <Route
        path="/pos"
        component={() => (
          <ProtectedRoute component={POSPage} roles={["cajero", "gerente", "supervisor", "customer"]} />
        )}
      />
      <Route
        path="/dashboard"
        component={() => {
          console.log('[App] Dashboard route matched');
          return <ProtectedRoute component={DashboardPage} roles={["gerente", "supervisor", "customer"]} />;
        }}
      />
      {/* Root redirect */}
      <Route path="/">
        {user ? (
          <Redirect to={user.role === "cajero" ? "/pos" : "/dashboard"} />
        ) : (
          <Redirect to="/login" />
        )}
      </Route>
    </Switch>
  );
}
