import { Router, Route, Switch } from 'wouter';
import { SubdomainProvider } from '@/contexts/SubdomainContext';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import DealsPage from "@/pages/DealsPage";
import ServicesPage from "@/pages/ServicesPage";
import ProgramsPage from "@/pages/ProgramsPage";
import AboutPage from "@/pages/AboutPage";
import CartSidebar from './components/cart/cart-sidebar';
import CheckoutModal from './components/cart/checkout-modal';

function App() {
  return (
    <SubdomainProvider>
      <Router>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/products" component={ProductsPage} />
          <Route path="/products/:id" component={ProductDetailPage} />
          <Route path="/deals" component={DealsPage} />
          <Route path="/services" component={ServicesPage} />
          <Route path="/programs" component={ProgramsPage} />
          <Route path="/about" component={AboutPage} />
          {/* Catch-all route for 404 - must be last */}
          <Route component={NotFoundPage} />
        </Switch>
        <CartSidebar />
        <CheckoutModal />
      </Router>
    </SubdomainProvider>
  );
}

export default App;
