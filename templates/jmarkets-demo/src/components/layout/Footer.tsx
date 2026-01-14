import { Link } from "wouter";
import { useSubdomainContext } from '@/contexts/SubdomainContext';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MessageCircle, MapPin } from "lucide-react";
import { useContact } from "@/hooks/useContent";

export default function Footer() {
  const { data: contact } = useContact();
  const { organization } = useSubdomainContext();
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gradient">{organization?.name || 'JMarkets Demo'}</h3>
            <p className="text-gray-400 mb-4">
              Your trusted marketplace for quality products. Discover amazing deals and shop with confidence.
            </p>
            <div className="flex gap-3">
              {contact?.facebookUrl && (
                <a href={contact.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {contact?.twitterUrl && (
                <a href={contact.twitterUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {contact?.instagramUrl && (
                <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Shop</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link href="/products">
                  <a className="hover:text-primary transition-colors">All Products</a>
                </Link>
              </li>
              <li>
                <Link href="/products">
                  <a className="hover:text-primary transition-colors">Categories</a>
                </Link>
              </li>
              <li>
                <Link href="/products">
                  <a className="hover:text-primary transition-colors">Deals & Offers</a>
                </Link>
              </li>
              <li>
                <Link href="/products">
                  <a className="hover:text-primary transition-colors">New Arrivals</a>
                </Link>
              </li>
              <li>
                <Link href="/products">
                  <a className="hover:text-primary transition-colors">Bestsellers</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Support</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contáctanos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Order Tracking
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Contact</h4>
            <ul className="space-y-3 text-gray-400">
              {contact?.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{contact.address}</span>
                </li>
              )}
              {contact?.phone && (
                <li className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <a href={`https://wa.me/${contact.whatsappNumber?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hola, me gustaría obtener más información")}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{contact.phone}</a>
                </li>
              )}
              {contact?.email && (
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <a href={`mailto:${contact.email}`} className="hover:text-primary transition-colors">{contact.email}</a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; 2026 {organization?.name || 'JMarkets Demo'}. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-primary transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
