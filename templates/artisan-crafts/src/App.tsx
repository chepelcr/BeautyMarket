import { Route, Switch } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import NotFoundPage from '@/pages/NotFoundPage';
import CartSidebar from '@/components/cart/cart-sidebar';
import CheckoutModal from '@/components/cart/checkout-modal';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/products" component={ProductsPage} />
          <Route path="/products/:id" component={ProductDetailPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </main>
      <Footer />
      <CartSidebar />
      <CheckoutModal />
    </div>
  );
}

export default App;
