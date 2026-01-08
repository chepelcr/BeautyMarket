import { Link } from "wouter";
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, Heart, Sparkles, Store } from "lucide-react";

export default function Footer() {
  const landingUrl = import.meta.env.VITE_LANDING_PAGE_URL || 'https://jmarkets.jcampos.dev';

  return (
    <footer className="bg-gradient-to-br from-pink-50 via-white to-pink-50 border-t border-border">
      {/* Newsletter Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-3xl font-serif font-bold text-foreground mb-3">
            Join Our Beauty Community
          </h3>
          <p className="text-muted-foreground mb-6">
            Subscribe to receive exclusive beauty tips, new product launches, and special offers
          </p>
          <form className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="btn-beauty whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>

        <div className="beauty-divider mb-12"></div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-xl font-serif font-bold text-foreground">
                Beauty Essentials
              </span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Premium cosmetics and skincare products for your natural beauty. Cruelty-free, vegan-friendly, and made with love.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white rounded-full hover:bg-primary hover:text-white transition-colors border border-border"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white rounded-full hover:bg-primary hover:text-white transition-colors border border-border"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white rounded-full hover:bg-primary hover:text-white transition-colors border border-border"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    Home
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/products">
                  <a className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    Shop All Products
                  </a>
                </Link>
              </li>
              <li>
                <a href="#about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Beauty Blog
                </a>
              </li>
              <li className="pt-2">
                <a
                  href={landingUrl}
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                >
                  <Store className="w-4 h-4" />
                  Start Your Own Store
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-serif font-bold text-foreground mb-4">Customer Care</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif font-bold text-foreground mb-4">Get In Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground text-sm">
                  123 Beauty Avenue, Suite 100<br />
                  New York, NY 10001
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="tel:+1234567890" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="mailto:hello@beautyessentials.com" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  hello@beautyessentials.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="beauty-divider mb-6"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p className="flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-primary fill-primary" /> by Beauty Essentials
          </p>
          <p>2024 Beauty Essentials. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="font-medium">Cruelty-Free</span>
            <span className="font-medium">Vegan</span>
            <span className="font-medium">Natural</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
