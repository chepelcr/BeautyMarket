import { Link } from 'wouter';
import { Facebook, Instagram, Twitter, Mail, MessageCircle, MapPin, ChefHat } from 'lucide-react';
import { useTheme } from '@/hooks/useContent';
import { useSubdomainContext } from '@/contexts/SubdomainContext';

export default function Footer() {
  const { organization } = useSubdomainContext();
  const { data: theme } = useTheme();
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              
              {theme?.logoUrl ? (
                <img src={theme.logoUrl} alt="Logo" className="w-7 h-7" />
              ) : (
                <ChefHat className="w-7 h-7 text-gourmet-gold" />
              )}
              <h3 className="text-xl font-serif font-bold text-white">{organization?.name || 'Gourmet Foods'}</h3>
            </div>
            <p className="text-sm text-stone-400 mb-4">
              Premium specialty foods and artisanal products, curated for discerning palates.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2 bg-stone-800 hover:bg-gourmet-red rounded-lg transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-stone-800 hover:bg-gourmet-red rounded-lg transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-stone-800 hover:bg-gourmet-red rounded-lg transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products">
                  <a className="hover:text-gourmet-gold transition-colors">All Products</a>
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-gourmet-gold transition-colors">
                  Artisan Cheese
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gourmet-gold transition-colors">
                  Charcuterie
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gourmet-gold transition-colors">
                  Specialty Oils
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gourmet-gold transition-colors">
                  Gourmet Coffee
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gourmet-green transition-colors">
                  Organic Selection
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-gourmet-gold transition-colors">
                  Acerca de Nosotros
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gourmet-gold transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gourmet-gold transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gourmet-gold transition-colors">
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gourmet-gold transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gourmet-gold transition-colors">
                  Política de Privacidad
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Get in Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gourmet-gold flex-shrink-0 mt-0.5" />
                <span>123 Gourmet Street, Culinary District, NY 10001</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-gourmet-gold flex-shrink-0" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gourmet-gold flex-shrink-0" />
                <span>hello@gourmetfoods.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-stone-400">
          <p>&copy; 2026 {organization?.name || 'Gourmet Foods Market'}. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gourmet-gold transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-gourmet-gold transition-colors">
              Política de Privacidad
            </a>
            <a href="#" className="hover:text-gourmet-gold transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
