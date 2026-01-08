import { Route, Switch } from "wouter";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import NotFound from "@/pages/NotFound";
import CartSidebar from "@/components/cart/cart-sidebar";
import CheckoutModal from "@/components/cart/checkout-modal";
import { Toaster } from "@/components/ui/toaster";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/products" component={Products} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route component={NotFound} />
      </Switch>
      <CartSidebar />
      <CheckoutModal />
      <Toaster />
    </div>
  );
}
