import { Dumbbell, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { useSubdomainContext } from '@/contexts/SubdomainContext';
import { useContact, useHomePageSections } from '@/hooks/useContent';
import { useTheme } from '@/hooks/useContent';
import { getSectionByType } from '@/lib/pageUtils';
export default function Footer() {
  const { data: contact } = useContact();
  const { organization } = useSubdomainContext();
  const { data: theme } = useTheme();
  const { data: sections = [] } = useHomePageSections();
  const newsletter = getSectionByType(sections, 'newsletter')?.content || {};
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              
              {theme?.logoUrl ? (
                <img src={theme.logoUrl} alt="Logo" className="w-8 h-8" />
              ) : (
                <Dumbbell className="w-8 h-8 text-red-600" />
              )}
              <span className="text-xl font-black tracking-tight gradient-energy bg-clip-text text-transparent">
                {organization?.name || 'FITNESS HUB'}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Transform your body, elevate your mind. Premium fitness equipment
              and wellness products for champions.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-red-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-red-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-orange-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-red-600 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="font-black text-lg mb-4 text-red-600">SHOP</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Equipment
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Supplements
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Apparel
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Accessories
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-black text-lg mb-4 text-orange-600">SUPPORT</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Contáctanos
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-black text-lg mb-4 text-red-600">
              {newsletter.title || 'STAY MOTIVATED'}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {newsletter.description || 'Get weekly tips, workouts, and exclusive deals.'}
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder={newsletter.placeholder || 'Ingresa tu correo'}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-600 text-sm"
              />
              <button className="w-full btn-energy text-sm">
                {newsletter.buttonText || 'SUBSCRIBE'}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} {organization?.name || 'Fitness Hub'}. All rights reserved.
            | Built with determination.
          </p>
        </div>
      </div>
    </footer>
  );
}
