import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import loadable from "@loadable/component";
import { Loader2 } from "lucide-react";
import { createContext, useContext } from "react";
import { getSubdomain } from "@/lib/subdomain";
import { useOrganization } from "@/hooks/useOrganization";
import type { Organization } from "@/models";

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Loader2 className="h-8 w-8 animate-spin text-pink-primary" />
  </div>
);

// Lazy loaded page components with loading fallback
const Home = loadable(() => import("@/pages/home"), { fallback: <PageLoader /> });
const Products = loadable(() => import("@/pages/products"), { fallback: <PageLoader /> });
const About = loadable(() => import("@/pages/about"), { fallback: <PageLoader /> });
const Admin = loadable(() => import("@/pages/admin"), { fallback: <PageLoader /> });
const Login = loadable(() => import("@/pages/login"), { fallback: <PageLoader /> });
const Register = loadable(() => import("@/pages/register"), { fallback: <PageLoader /> });
const VerifyEmail = loadable(() => import("@/pages/verify-email"), { fallback: <PageLoader /> });
const ForgotPassword = loadable(() => import("@/pages/forgot-password"), { fallback: <PageLoader /> });
const DeploymentHistory = loadable(() => import("./pages/DeploymentHistory"), { fallback: <PageLoader /> });
const Profile = loadable(() => import("./pages/Profile"), { fallback: <PageLoader /> });
const ResetPassword = loadable(() => import("./pages/ResetPassword"), { fallback: <PageLoader /> });

// Organization pages
const CreateOrganization = loadable(() => import("./pages/organizations/CreateOrganization"), { fallback: <PageLoader /> });
const OrganizationSettings = loadable(() => import("./pages/organizations/OrganizationSettings"), { fallback: <PageLoader /> });
const AcceptInvitation = loadable(() => import("./pages/organizations/AcceptInvitation"), { fallback: <PageLoader /> });

// Layout components (kept static for immediate rendering)
import Navbar from "@/components/layout/navbar";
import { DynamicFooter } from "@/components/dynamic-footer";
import CartSidebar from "@/components/cart/cart-sidebar";
import CheckoutModal from "@/components/cart/checkout-modal";
import { PreDeploymentBanner } from "@/components/pre-deployment-banner";

// Subdomain context for tenant-aware components
interface SubdomainContextType {
  subdomain: string | null;
  organization: Organization | null;
  isLoading: boolean;
  error: Error | null;
}

const SubdomainContext = createContext<SubdomainContextType>({
  subdomain: null,
  organization: null,
  isLoading: false,
  error: null,
});

export const useSubdomainContext = () => useContext(SubdomainContext);

// Subdomain provider component
function SubdomainProvider({ children }: { children: React.ReactNode }) {
  const subdomain = getSubdomain();
  const { useOrganizationBySubdomain } = useOrganization();
  const { data: organization, isLoading, error } = useOrganizationBySubdomain(subdomain);

  return (
    <SubdomainContext.Provider value={{
      subdomain,
      organization: organization || null,
      isLoading,
      error: error as Error | null
    }}>
      {children}
    </SubdomainContext.Provider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:category" component={Products} />
      <Route path="/about" component={About} />
      <Route path="/admin/deployments" component={DeploymentHistory} />
      <Route path="/admin/profile" component={Profile} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/admin" component={Admin} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/forgot-password" component={ForgotPassword} />
      {/* Organization routes */}
      <Route path="/organizations/new" component={CreateOrganization} />
      <Route path="/organizations/:id/settings" component={OrganizationSettings} />
      <Route path="/join/:token" component={AcceptInvitation} />
      <Route>404 - Page not found</Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SubdomainProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-cream dark:bg-gray-900 flex flex-col">
            <Navbar />
            <PreDeploymentBanner />
            <main className="flex-grow">
              <Router />
            </main>
            <DynamicFooter />
            <CartSidebar />
            <CheckoutModal />
            <Toaster />
          </div>
        </TooltipProvider>
      </SubdomainProvider>
    </QueryClientProvider>
  );
}

export default App;
