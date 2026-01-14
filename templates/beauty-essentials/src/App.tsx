import { Route, Switch } from "wouter";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import { SubdomainProvider } from '@/contexts/SubdomainContext';
import { useTheme } from '@/hooks/useContent';
import { useEffect } from 'react';
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import DealsPage from "@/pages/DealsPage";
import ServicesPage from "@/pages/ServicesPage";
import ProgramsPage from "@/pages/ProgramsPage";
import AboutPage from "@/pages/AboutPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import VerifyEmail from "@/pages/VerifyEmail";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFoundPage from "@/pages/NotFoundPage";
import CartSidebar from "@/components/cart/cart-sidebar";
import CheckoutModal from "@/components/cart/checkout-modal";

function AppContent() {
  const { data: theme } = useTheme();

  useEffect(() => {
    if (theme?.faviconUrl) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = theme.faviconUrl;
      }
    }
  }, [theme?.faviconUrl]);

  return (
    <div className="min-h-screen bg-background">
      <Switch>
        {/* Public routes */}
        <Route path="/" component={HomePage} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/products/:id" component={ProductDetailPage} />
        <Route path="/deals" component={DealsPage} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/programs" component={ProgramsPage} />
        <Route path="/about" component={AboutPage} />

        {/* Authentication routes */}
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/verify-email" component={VerifyEmail} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />

        {/* 404 fallback */}
        <Route component={NotFoundPage} />
      </Switch>
      <CartSidebar />
      <CheckoutModal />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SubdomainProvider>
        <AppContent />
      </SubdomainProvider>
    </QueryClientProvider>
  );
}
