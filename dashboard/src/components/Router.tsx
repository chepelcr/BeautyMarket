import { Route, Switch } from "wouter";
import { Suspense, lazy } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// Lazy load all pages for better code splitting
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const CreateOrganization = lazy(() => import("@/pages/CreateOrganization"));
const SelectOrganization = lazy(() => import("@/pages/SelectOrganization"));

// Admin pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Profile = lazy(() => import("@/pages/Profile"));
const DeploymentHistory = lazy(() => import("@/pages/DeploymentHistory"));
const OrganizationSettings = lazy(() => import("@/pages/organizations/OrganizationSettings"));
const AcceptInvitation = lazy(() => import("@/pages/organizations/AcceptInvitation"));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const CategoriesPage = lazy(() => import("@/pages/CategoriesPage"));
const OrdersPage = lazy(() => import("@/pages/OrdersPage"));
const OrderDetailsPage = lazy(() => import("@/pages/OrderDetailsPage"));
const CustomersPage = lazy(() => import("@/pages/CustomersPage"));
const CustomerDetailsPage = lazy(() => import("@/pages/CustomerDetailsPage"));
const ConfirmationsPage = lazy(() => import("@/pages/ConfirmationsPage"));
const ConfirmationDetailsPage = lazy(() => import("@/pages/ConfirmationDetailsPage"));

// CMS and Settings pages
const ContentPage = lazy(() => import("@/pages/ContentPage"));
const SettingsPage = lazy(() => import("@/pages/settings/SettingsPage"));
const GeneralSettingsPage = lazy(() => import("@/pages/settings/GeneralSettingsPage"));
const ThemeSettingsPage = lazy(() => import("@/pages/settings/ThemeSettingsPage"));
const ContactSettingsPage = lazy(() => import("@/pages/settings/ContactSettingsPage"));
const PaymentSettingsPage = lazy(() => import("@/pages/settings/PaymentSettingsPage"));
const ShippingSettingsPage = lazy(() => import("@/pages/settings/ShippingSettingsPage"));
const TeamMembersPage = lazy(() => import("@/pages/TeamMembersPage"));

// Placeholder pages - will be implemented by parallel agents
const PlaceholderPage = ({ title }: { title: string }) => {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">{t('common.pageInProgress')}</p>
      </div>
    </div>
  );
};

interface RouterProps {
  displayLocation: string;
}

// Loading fallback component
function LoadingFallback() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    </div>
  );
}

export function Router({ displayLocation }: RouterProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch location={displayLocation}>
        {/* Auth routes - Login is the default route */}
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
        <Route path="/admin" component={Dashboard} />
        <Route path="/admin/products" component={ProductsPage} />
        <Route path="/admin/categories" component={CategoriesPage} />
        <Route path="/admin/orders" component={OrdersPage} />
        <Route path="/admin/orders/:orderId" component={OrderDetailsPage} />
        <Route path="/admin/confirmations" component={ConfirmationsPage} />
        <Route path="/admin/confirmations/:confirmationNumber" component={ConfirmationDetailsPage} />
        <Route path="/admin/customers" component={CustomersPage} />
        <Route path="/admin/customers/:customerId" component={CustomerDetailsPage} />
        <Route path="/admin/content">{() => <ContentPage />}</Route>
        <Route path="/admin/settings" component={SettingsPage} />
        <Route path="/admin/settings/general" component={GeneralSettingsPage} />
        <Route path="/admin/settings/theme" component={ThemeSettingsPage} />
        <Route path="/admin/settings/contact" component={ContactSettingsPage} />
        <Route path="/admin/settings/payment" component={PaymentSettingsPage} />
        <Route path="/admin/settings/shipping" component={ShippingSettingsPage} />
        <Route path="/admin/members" component={TeamMembersPage} />
        <Route path="/admin/profile" component={Profile} />
        <Route path="/admin/deployments" component={DeploymentHistory} />

        {/* 404 fallback */}
        <Route>404 - Page not found</Route>
      </Switch>
    </Suspense>
  );
}
