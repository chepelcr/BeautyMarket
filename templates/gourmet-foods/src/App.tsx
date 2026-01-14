import { SubdomainProvider } from '@/contexts/SubdomainContext';
import { Route, Switch } from 'wouter';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import ServicesPage from "@/pages/ServicesPage";
import ProgramsPage from "@/pages/ProgramsPage";
import AboutPage from "@/pages/AboutPage";
import DealsPage from "@/pages/DealsPage";
import CartSidebar from './components/cart/cart-sidebar';
import CheckoutModal from './components/cart/checkout-modal';

function App() {
  return (
    <SubdomainProvider>
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/products/:id" component={ProductDetailPage} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/programs" component={ProgramsPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/deals" component={DealsPage} />
        <Route component={NotFoundPage} />
      </Switch>
      <CartSidebar />
      <CheckoutModal />
    </div>
  );
    </SubdomainProvider>
  );
}

export default App;
