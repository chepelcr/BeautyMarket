import { SubdomainProvider } from '@/contexts/SubdomainContext';
import { Route, Switch } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import NotFound from '@/pages/NotFound';
import DealsPage from "@/pages/DealsPage";
import ServicesPage from "@/pages/ServicesPage";
import ProgramsPage from "@/pages/ProgramsPage";
import AboutPage from "@/pages/AboutPage";
import CartSidebar from '@/components/cart/cart-sidebar';
import CheckoutModal from '@/components/cart/checkout-modal';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <SubdomainProvider>
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
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
      </main>
      <Footer />
      <CartSidebar />
      <CheckoutModal />
      <Toaster />
    </div>
  );
    </SubdomainProvider>
  );
}

export default App;
