import { Leaf, Instagram, Facebook, Twitter, Mail } from 'lucide-react';
import { useSubdomainContext } from '@/contexts/SubdomainContext';
import { useContact } from '@/hooks/useContent';
import { useTheme } from '@/hooks/useContent';import { Link } from 'wouter';
import { useContact } from '@/hooks/useContent';
import { useTheme } from '@/hooks/useContent';
export default function Footer() {
  const { data: contact } = useContact();
  const { organization } = useSubdomainContext();
  const { data: theme } = useTheme();
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container-organic">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              
              {theme?.logoUrl ? (
                <img src={theme.logoUrl} alt="Logo" className="w-6 h-6" />
              ) : (
                <Leaf className="w-6 h-6 text-primary" />
              )}
              <span className="text-xl font-bold">{organization?.name || 'Artisan Crafts'}</span>
            </div>
            <p className="text-background/70 text-sm">
              Connecting artisans with people who appreciate authentic, handmade quality.
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <a href="#" className="hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h5 className="font-semibold mb-4 font-sans">Shop</h5>
            <ul className="space-y-2 text-sm text-background/70">
              <li>
                <Link href="/products">
                  <a className="hover:text-primary transition-colors">All Products</a>
                </Link>
              </li>
              <li><a href="#" className="hover:text-primary transition-colors">Pottery</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Textiles</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Jewelry</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Home Decor</a></li>
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h5 className="font-semibold mb-4 font-sans">About</h5>
            <ul className="space-y-2 text-sm text-background/70">
              <li><a href="#" className="hover:text-primary transition-colors">Nuestra Historia</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Meet the Artisans</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Sustainability</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h5 className="font-semibold mb-4 font-sans">Help</h5>
            <ul className="space-y-2 text-sm text-background/70">
              <li><a href="#" className="hover:text-primary transition-colors">Contáctanos</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Track Order</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Gift Cards</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 text-center text-sm text-background/70">
          <p>&copy; {new Date().getFullYear()} {organization?.name || 'Artisan Crafts'}. Handcrafted with love.</p>
          <p className="mt-2 text-xs">
            Template powered by JMarkets | <a href="#" className="hover:text-primary transition-colors">Política de Privacidad</a> | <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
