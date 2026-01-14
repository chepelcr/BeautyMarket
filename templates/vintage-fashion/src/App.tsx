import { SubdomainProvider } from '@/contexts/SubdomainContext';
import React from 'react';
import { Route, Switch } from 'wouter';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { DealsPage } from "@/pages/DealsPage";
import { ServicesPage } from "@/pages/ServicesPage";
import { ProgramsPage } from "@/pages/ProgramsPage";
import { AboutPage } from "@/pages/AboutPage";
import CartSidebar from './components/cart/cart-sidebar';
import CheckoutModal from './components/cart/checkout-modal';

function App() {
  return (
    <SubdomainProvider>
    <div className="min-h-screen bg-background vintage-texture flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/products" component={ProductsPage} />
          <Route path="/products/:id" component={ProductDetailPage} />
          <Route path="/deals" component={DealsPage} />
          <Route path="/services" component={ServicesPage} />
          <Route path="/programs" component={ProgramsPage} />
          <Route path="/about" component={AboutPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </main>

      <Footer />
      <CartSidebar />
      <CheckoutModal />
    </div>
  );
    </SubdomainProvider>
  );
}

export default App;
