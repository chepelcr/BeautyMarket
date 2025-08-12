import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Products from "@/pages/products";
import Admin from "@/pages/admin";
import Login from "@/pages/login";
import DeploymentHistory from "./pages/DeploymentHistory";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import Navbar from "@/components/layout/navbar";
import { DynamicFooter } from "@/components/dynamic-footer";
import CartSidebar from "@/components/cart/cart-sidebar";
import CheckoutModal from "@/components/cart/checkout-modal";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:category" component={Products} />
      <Route path="/admin/deployments" component={DeploymentHistory} />
      <Route path="/admin/profile" component={Profile} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/admin" component={Admin} />
      <Route path="/login" component={Login} />
      <Route>404 - Page not found</Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-cream dark:bg-gray-900">
          <Navbar />
          <Router />
          <DynamicFooter />
          <CartSidebar />
          <CheckoutModal />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
