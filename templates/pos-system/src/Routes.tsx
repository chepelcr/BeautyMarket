import { Route, Switch, Redirect, useLocation, useParams } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { DocumentVersionProvider } from "@/contexts/DocumentVersionContext";
import { CountryISO } from "@/lib/enums";
import { ROUTES } from "@/routePaths";
import { PageTransition } from "@/components/ui/PageTransition";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Login from "@/pages/Login";
import SelectOrganization from "@/pages/SelectOrganization";
import DashboardHome from "@/pages/dashboard/DashboardPage";
import SessionsPage from "@/pages/dashboard/SessionsPage";
import PuestosPage from "@/pages/dashboard/PuestosPage";
import ProductsPage from "@/pages/dashboard/ProductsPage";
import ReportePage from "@/pages/dashboard/ReportePage";
import POSIntegratedPage from "@/pages/dashboard/POSIntegratedPage";
import ClientsPage from "@/pages/dashboard/ClientsPage";
import ClientDetailPage from "@/pages/dashboard/ClientDetailPage";
import ProductDetailPage from "@/pages/dashboard/ProductDetailPage";

const DASHBOARD_ROLES = ["gerente", "supervisor", "customer", "cajero"];

// Auth guard — redirects to login if unauthenticated, checks role if provided
function RequireAuth({
  children,
  roles,
}: {
  children: React.ReactNode;
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
    return <Redirect to={ROUTES.DASHBOARD} />;
  }

  return <>{children}</>;
}

// Shorthand: protected page inside the dashboard shell
function DashboardPage({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={DASHBOARD_ROLES}>
      <DocumentVersionProvider isoCode={CountryISO.COSTA_RICA}>
        <DashboardLayout>
          <PageTransition>{children}</PageTransition>
        </DashboardLayout>
      </DocumentVersionProvider>
    </RequireAuth>
  );
}

// Client detail route — reads :clientId from Wouter params
function ClientDetailRoute() {
  const { clientId } = useParams<{ clientId: string }>();
  return (
    <DashboardPage>
      <ClientDetailPage clientId={clientId ?? ""} />
    </DashboardPage>
  );
}

// Product detail route — reads :productId from Wouter params
function ProductDetailRoute() {
  const { productId } = useParams<{ productId: string }>();
  return (
    <DashboardPage>
      <ProductDetailPage productId={productId ?? ""} />
    </DashboardPage>
  );
}

export default function Routes() {
  const { user } = useAuthContext();

  return (
    <Switch>
      {/* Public */}
      <Route path={ROUTES.LOGIN} component={Login} />
      <Route
        path={ROUTES.SELECT_ORG}
        component={() => (
          <RequireAuth>
            <SelectOrganization />
          </RequireAuth>
        )}
      />

      {/* Dashboard — more specific paths first */}
      <Route
        path={ROUTES.DASHBOARD_SESSIONS}
        component={() => <DashboardPage><SessionsPage /></DashboardPage>}
      />
      <Route
        path={ROUTES.DASHBOARD_STATIONS}
        component={() => <DashboardPage><PuestosPage /></DashboardPage>}
      />
      
      {/* Products — detail before list so :productId is matched first */}
      <Route
        path={`${ROUTES.DASHBOARD_PRODUCTS}/:productId`}
        component={ProductDetailRoute}
      />
      <Route
        path={ROUTES.DASHBOARD_PRODUCTS}
        component={() => <DashboardPage><ProductsPage /></DashboardPage>}
      />
      
      <Route
        path={ROUTES.DASHBOARD_REPORTS}
        component={() => <DashboardPage><ReportePage /></DashboardPage>}
      />
      <Route
        path={ROUTES.DASHBOARD_POS}
        component={() => <DashboardPage><POSIntegratedPage /></DashboardPage>}
      />

      {/* Clients — detail before list so :clientId is matched first */}
      <Route
        path={`${ROUTES.DASHBOARD_CLIENTS}/:clientId`}
        component={ClientDetailRoute}
      />
      <Route
        path={ROUTES.DASHBOARD_CLIENTS}
        component={() => <DashboardPage><ClientsPage /></DashboardPage>}
      />

      <Route
        path={ROUTES.DASHBOARD}
        component={() => <DashboardPage><DashboardHome /></DashboardPage>}
      />

      {/* Root redirect */}
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
