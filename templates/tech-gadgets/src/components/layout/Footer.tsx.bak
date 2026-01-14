import { Link } from 'wouter';
import { Zap, Github, Twitter, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container-tech py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div>
            <div className="flex items-center space-x-2 mb-4 group">
              <div className="relative">
                <Zap className="h-6 w-6 text-tech-cyan group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all" />
                <div className="absolute inset-0 bg-tech-cyan/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="font-bold text-lg animated-gradient-text">TechGadgets</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Your destination for cutting-edge technology and premium electronics.
              We bring you the latest innovations in the tech world.
            </p>
            {/* Social Links */}
            <div className="flex items-center space-x-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-background hover:bg-tech-cyan/20 rounded-sm transition-all group relative"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4 group-hover:text-tech-cyan transition-colors" />
                <div className="absolute inset-0 bg-tech-cyan/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-background hover:bg-tech-cyan/20 rounded-sm transition-all group relative"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4 group-hover:text-tech-cyan transition-colors" />
                <div className="absolute inset-0 bg-tech-cyan/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-background hover:bg-tech-cyan/20 rounded-sm transition-all group relative"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4 group-hover:text-tech-cyan transition-colors" />
                <div className="absolute inset-0 bg-tech-cyan/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/products" className="hover:text-tech-cyan transition-colors inline-block">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?filter=new" className="hover:text-tech-cyan transition-colors inline-block">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products?filter=bestsellers" className="hover:text-tech-cyan transition-colors inline-block">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/deals" className="hover:text-tech-cyan transition-colors inline-block">
                  Deals & Offers
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-tech-cyan transition-colors inline-block">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/help" className="hover:text-tech-cyan transition-colors inline-block">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-tech-cyan transition-colors inline-block">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-tech-cyan transition-colors inline-block">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="hover:text-tech-cyan transition-colors inline-block">
                  Warranty Policy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-tech-cyan transition-colors inline-block">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Contact Us</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-tech-cyan" />
                <span>123 Tech Street<br />Silicon Valley, CA 94025</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0 text-tech-cyan" />
                <a href="tel:+15551234567" className="hover:text-tech-cyan transition-colors">
                  +1 (555) 123-4567
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0 text-tech-cyan" />
                <a href="mailto:support@techgadgets.com" className="hover:text-tech-cyan transition-colors">
                  support@techgadgets.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-border pt-8 mb-8">
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="font-semibold mb-2 text-foreground">Stay Connected</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to our newsletter for exclusive deals and tech updates
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-background border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-tech-cyan text-foreground placeholder:text-muted-foreground text-sm"
              />
              <button className="btn-tech-accent px-6">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              &copy; {currentYear} TechGadgets. All rights reserved. Built with cutting-edge technology.
            </p>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-tech-cyan transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-tech-cyan transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-tech-cyan transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Gradient */}
      <div className="h-1 tech-gradient" />
    </footer>
  );
}
