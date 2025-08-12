import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import strawberryLogo from "@assets/image_1755019713048.png";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { items, toggleCart } = useCartStore();
  const { user, isAuthenticated, isLoading } = useAuth();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const baseNavItems = [
    { href: "/", label: "Inicio", id: "home" },
    { href: "/products", label: "Productos", id: "productos" },
  ];

  // Add admin link if user is authenticated
  const navItems = isAuthenticated 
    ? [...baseNavItems, { href: "/admin", label: "Admin", id: "admin" }]
    : baseNavItems;

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      queryClient.setQueryData(["/api/user"], null);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img 
                src={strawberryLogo} 
                alt="Strawberry Essentials Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-serif text-xl font-semibold text-gray-900">
              Strawberry Essentials
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`text-gray-700 hover:text-pink-primary transition-colors ${
                  location === item.href ? "text-pink-primary font-medium" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Auth Section, Cart & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* User greeting and logout for authenticated users */}
            {isAuthenticated && user && (
              <div className="hidden md:flex items-center space-x-3 bg-gradient-to-r from-pink-primary to-coral px-4 py-2 rounded-full">
                <span className="text-white text-sm font-medium">
                  Hola, {(user as any).username}
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-white text-white bg-transparent hover:bg-white hover:text-pink-primary text-xs px-3 py-1 h-7"
                >
                  Cerrar Sesión
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCart}
              className="relative p-2 text-gray-700 hover:text-pink-primary transition-colors"
            >
              <i className="fas fa-shopping-bag text-xl"></i>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-coral text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2 text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"} text-xl`}></i>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`text-gray-700 hover:text-pink-primary transition-colors ${
                    location === item.href ? "text-pink-primary font-medium" : ""
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile auth section */}
              {isAuthenticated && user && (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="text-gray-700 text-sm">
                    Hola, {(user as any).username}
                  </div>
                  <Button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Cerrar Sesión
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
