import { Route, Switch, Redirect, useLocation } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
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
  const { user, org, isLoading } = useAuthContext();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted font-barlow text-lg animate-pulse">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    sessionStorage.setItem("redirectAfterLogin", location);
    return <Redirect to="/login" />;
  }

  if (!org && location !== "/organizations/select") {
    return <Redirect to="/organizations/select" />;
  }

  if (roles && user.role && !roles.includes(user.role)) {
    return <Redirect to={user.role === "cajero" ? "/pos" : "/dashboard"} />;
  }

  return <Component />;
}

export default function App() {
  const { user, org } = useAuthContext();

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
          <ProtectedRoute component={POSPage} roles={["cajero", "gerente", "supervisor"]} />
        )}
      />
      <Route
        path="/dashboard"
        component={() => (
          <ProtectedRoute component={DashboardPage} roles={["gerente", "supervisor"]} />
        )}
      />
      {/* Root redirect */}
      <Route path="/">
        {user && org ? (
          <Redirect to={user.role === "cajero" ? "/pos" : "/dashboard"} />
        ) : user ? (
          <Redirect to="/organizations/select" />
        ) : (
          <Redirect to="/login" />
        )}
      </Route>
    </Switch>
  );
}
