import { Route, Switch } from "wouter";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { SubdomainProvider } from '@/contexts/SubdomainContext';
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import DealsPage from "@/pages/DealsPage";
import ServicesPage from "@/pages/ServicesPage";
import ProgramsPage from "@/pages/ProgramsPage";
import AboutPage from "@/pages/AboutPage";
import NotFound from "@/pages/NotFound";
import CartSidebar from "@/components/cart/cart-sidebar";
import CheckoutModal from "@/components/cart/checkout-modal";
import { Toaster } from "@/components/ui/toaster";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SubdomainProvider>
        <div className="min-h-screen bg-background">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/products" component={Products} />
            <Route path="/products/:id" component={ProductDetail} />
            <Route path="/deals" component={DealsPage} />
            <Route path="/services" component={ServicesPage} />
            <Route path="/programs" component={ProgramsPage} />
            <Route path="/about" component={AboutPage} />
            <Route component={NotFound} />
          </Switch>
          <CartSidebar />
          <CheckoutModal />
          <Toaster />
        </div>
      </SubdomainProvider>
    </QueryClientProvider>
  );
}
