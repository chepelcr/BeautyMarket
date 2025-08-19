import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { SimpleThemeToggle } from "@/components/simple-theme-toggle";
import { HomePageContent } from "@shared/schema";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, Shield } from "lucide-react";
import strawberryLogo from "@assets/image_1755019713048.png";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { items, toggleCart } = useCartStore();
  const { user, isAuthenticated, isLoading } = useAuth();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Load dynamic site content
  const [homeContent, setHomeContent] = useState<HomePageContent[]>([]);

  useEffect(() => {
    const loadHomeContent = async () => {
      try {
        const response = await apiRequest('GET', '/api/home-content');
        setHomeContent(await response.json());
      } catch (error) {
        console.error('Failed to load home content:', error);
      }
    };
    
    loadHomeContent();
  }, []);

  // Get dynamic site title and logo
  const siteContent = homeContent?.filter(item => item.section === 'site') || [];
  const siteTitle = siteContent.find(item => item.key === 'title')?.value || 'Strawberry Essentials';
  const siteLogo = siteContent.find(item => item.key === 'logo')?.value || strawberryLogo;

  const navItems = [
    { href: "/", label: "Inicio", id: "home" },
    { href: "/products", label: "Productos", id: "productos" },
    { href: "/about", label: "Acerca", id: "acerca" },
  ];

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
    <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img 
                src={siteLogo} 
                alt={`${siteTitle} Logo`}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-serif text-xl font-semibold text-gray-900 dark:text-white">
              {siteTitle}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`text-gray-700 dark:text-gray-300 hover:text-pink-primary transition-colors ${
                  location === item.href ? "text-pink-primary font-medium" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Auth Section, Cart & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* User dropdown for authenticated users */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-pink-primary to-coral px-4 py-2 rounded-full text-white hover:from-pink-600 hover:to-coral-dark shadow-md"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {String((user as any)?.firstName || (user as any)?.username || 'Usuario')}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/admin/profile" className="flex items-center cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Mi Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center cursor-pointer">
                      <Shield className="w-4 h-4 mr-2" />
                      Administración
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : !isLoading && (
              // Login button for desktop
              <Link href="/login">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden md:flex"
                >
                  Iniciar Sesión
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCart}
              className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-pink-primary transition-colors"
            >
              <i className="fas fa-shopping-bag text-xl"></i>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-coral text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
            
            <SimpleThemeToggle />
            
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2 text-gray-700 dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"} text-xl`}></i>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`text-gray-700 dark:text-gray-300 hover:text-pink-primary transition-colors ${
                    location === item.href ? "text-pink-primary font-medium" : ""
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile auth section */}
              {isAuthenticated && user ? (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="text-gray-700 dark:text-gray-300 text-sm">
                    Hola, {String((user as any)?.firstName || (user as any)?.username || 'Usuario')}
                  </div>
                  <Link
                    href="/admin/profile"
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-pink-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Mi Perfil
                  </Link>
                  <Link
                    href="/admin"
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-pink-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Administración
                  </Link>
                  <Button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              ) : !isLoading && (
                // Login option for mobile
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href="/login"
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-pink-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Iniciar Sesión / Administrar
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
