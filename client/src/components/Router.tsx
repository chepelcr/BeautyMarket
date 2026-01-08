import { Route, Switch } from "wouter";
import { Suspense, lazy } from "react";

// Import Login directly (not lazy) for testing
import Login from "@/pages/login";

// Lazy load other pages for better code splitting
const Admin = lazy(() => import("@/pages/admin"));
const Register = lazy(() => import("@/pages/Register"));
const VerifyEmail = lazy(() => import("@/pages/verify-email"));
const ForgotPassword = lazy(() => import("@/pages/forgot-password"));
const DeploymentHistory = lazy(() => import("@/pages/DeploymentHistory"));
const Profile = lazy(() => import("@/pages/Profile"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const CreateOrganization = lazy(() => import("@/pages/organizations/CreateOrganization"));
const SelectOrganization = lazy(() => import("@/pages/organizations/SelectOrganization"));
const OrganizationSettings = lazy(() => import("@/pages/organizations/OrganizationSettings"));
const AcceptInvitation = lazy(() => import("@/pages/organizations/AcceptInvitation"));
const TemplateGalleryDemo = lazy(() => import("@/pages/TemplateGalleryDemo"));

interface RouterProps {
  displayLocation: string;
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function Router({ displayLocation }: RouterProps) {
  return (
    <Switch location={displayLocation}>
      {/* Auth routes - Login is the main page */}
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />

      {/* Organization routes */}
      <Route path="/organizations/select" component={SelectOrganization} />
      <Route path="/organizations/new" component={CreateOrganization} />
      <Route path="/organizations/:id/settings" component={OrganizationSettings} />
      <Route path="/join/:token" component={AcceptInvitation} />

      {/* Admin routes */}
      <Route path="/admin" component={Admin} />
      <Route path="/admin/deployments" component={DeploymentHistory} />
      <Route path="/admin/profile" component={Profile} />

      {/* Demo routes */}
      <Route path="/demo/template-gallery" component={TemplateGalleryDemo} />
      <Route>404 - Page not found</Route>
    </Switch>
  );
}
