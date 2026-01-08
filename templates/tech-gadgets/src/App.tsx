import { Router, Route, Switch } from 'wouter';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import CartSidebar from './components/cart/cart-sidebar';
import CheckoutModal from './components/cart/checkout-modal';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/products/:id" component={ProductDetailPage} />
        {/* Catch-all route for 404 - must be last */}
        <Route component={NotFoundPage} />
      </Switch>
      <CartSidebar />
      <CheckoutModal />
    </Router>
  );
}

export default App;
