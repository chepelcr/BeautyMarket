import React from 'react';
import { Route, Switch } from 'wouter';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { PawPrintDecoration } from './components/PawPrintDecoration';
import CartSidebar from './components/cart/cart-sidebar';
import CheckoutModal from './components/cart/checkout-modal';

function App() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Decorative paw prints background */}
      <PawPrintDecoration />

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/products" component={ProductsPage} />
          <Route path="/products/:id" component={ProductDetailPage} />
          <Route path="/services" component={() => (
            <div className="relative z-10 p-8 text-center min-h-[60vh] flex items-center justify-center">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Pet Services</h1>
                <p className="text-xl text-muted-foreground">Coming Soon! Grooming, training, and more.</p>
              </div>
            </div>
          )} />
          <Route path="/about" component={() => (
            <div className="relative z-10 p-8 text-center min-h-[60vh] flex items-center justify-center">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">About PetCare</h1>
                <p className="text-xl text-muted-foreground">Your trusted partner in pet care.</p>
              </div>
            </div>
          )} />
          <Route component={NotFoundPage} />
        </Switch>
      </main>

      {/* Footer */}
      <Footer />

      {/* Cart Components */}
      <CartSidebar />
      <CheckoutModal />
    </div>
  );
}

export default App;
