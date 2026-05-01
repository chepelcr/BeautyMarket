import { Route, Switch, Redirect, useLocation } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Login from "@/pages/Login";
import SelectOrganization from "@/pages/SelectOrganization";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import { ROUTES } from "@/routePaths";

const DASHBOARD_ROLES = ["gerente", "supervisor", "customer", "cajero"];

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
    return <Redirect to={ROUTES.LOGIN} />;
  }

  if (roles && user.role && !roles.includes(user.role)) {
    const targetPath = ROUTES.DASHBOARD;
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

export default function Routes() {
  const { user } = useAuthContext();

  return (
    <Switch>
      <Route path={ROUTES.LOGIN} component={Login} />
      <Route
        path={ROUTES.SELECT_ORG}
        component={() => <ProtectedRoute component={SelectOrganization} />}
      />
      <Route
        path={ROUTES.DASHBOARD}
        component={() => <ProtectedRoute component={DashboardPage} roles={DASHBOARD_ROLES} />}
      />
      <Route
        path={`${ROUTES.DASHBOARD}/:page+`}
        component={() => <ProtectedRoute component={DashboardPage} roles={DASHBOARD_ROLES} />}
      />
      <Route path="/">
        {user ? (
          <Redirect to={ROUTES.DASHBOARD} />
        ) : (
          <Redirect to={ROUTES.LOGIN} />
        )}
      </Route>
    </Switch>
  );
}
