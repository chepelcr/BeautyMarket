import { Link } from "wouter";
import { Instagram, Facebook, Twitter, Mail, MessageCircle, MapPin, Heart, Sparkles, Store } from "lucide-react";
import { useContact, useHomePageSections, useTheme } from "@/hooks/useContent";
import { useSubdomainContext } from "@/contexts/SubdomainContext";
import { getSectionByType } from "@/lib/pageUtils";

export default function Footer() {
  const landingUrl = import.meta.env.VITE_LANDING_PAGE_URL || 'https://jmarkets.jcampos.dev';
  const { data: contact } = useContact();
  const { organization } = useSubdomainContext();
  const { data: theme } = useTheme();
  const { data: sections = [] } = useHomePageSections();
  const newsletter = getSectionByType(sections, 'newsletter')?.content || {};

  return (
    <footer className="bg-gradient-to-br from-pink-50 via-white to-pink-50 border-t border-border">
      {/* Newsletter Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center mb-12">
          
          {theme?.logoUrl ? (
            <img src={theme.logoUrl} alt="Logo" className="w-12 h-12 mx-auto mb-4" />
          ) : (
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          )}
          <h3 className="text-3xl font-serif font-bold text-foreground mb-3">
            {newsletter.title || 'Únete a Nuestra Comunidad'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {newsletter.description || 'Suscríbete para recibir consejos exclusivos, lanzamientos de productos y ofertas especiales'}
          </p>
          <form className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder={newsletter.placeholder || 'Ingresa tu correo'}
              className="flex-1 px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="btn-beauty whitespace-nowrap"
            >
              {newsletter.buttonText || 'Suscribirse'}
            </button>
          </form>
        </div>

        <div className="beauty-divider mb-12"></div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              
              {theme?.logoUrl ? (
                <img src={theme.logoUrl} alt="Logo" className="w-6 h-6" />
              ) : (
                <Sparkles className="w-6 h-6 text-primary" />
              )}
              <span className="text-xl font-serif font-bold text-foreground">
                {organization?.name || 'Beauty Essentials'}
              </span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Cosméticos y productos de cuidado premium para tu belleza natural. Libre de crueldad, vegano y hecho con amor.
            </p>
            <div className="flex gap-3">
              {contact?.instagramUrl && (
                <a
                  href={contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-full hover:bg-primary hover:text-white transition-colors border border-border"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {contact?.facebookUrl && (
                <a
                  href={contact.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-full hover:bg-primary hover:text-white transition-colors border border-border"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {contact?.twitterUrl && (
                <a
                  href={contact.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-full hover:bg-primary hover:text-white transition-colors border border-border"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h4 className="font-serif font-bold text-foreground mb-4">Enlaces Rápidos</h4>
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
                    Ver Todos los Productos
                  </a>
                </Link>
              </li>
              <li>
                <a href="#about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Acerca de Nosotros
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Nuestra Historia
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Blog de Belleza
                </a>
              </li>
              <li className="pt-2">
                <a
                  href={landingUrl}
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                >
                  <Store className="w-4 h-4" />
                  Crea Tu Propia Tienda
                </a>
              </li>
            </ul>
          </div>

          {/* Atención al Cliente */}
          <div>
            <h4 className="font-serif font-bold text-foreground mb-4">Atención al Cliente</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Envíos y Devoluciones
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Contáctanos
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif font-bold text-foreground mb-4">Contáctanos</h4>
            <ul className="space-y-3">
              {contact?.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-sm">
                    {contact.address}
                  </span>
                </li>
              )}
              {contact?.phone && (
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <a href={`https://wa.me/${contact.whatsappNumber?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hola, me gustaría obtener más información")}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact?.email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <a href={`mailto:${contact.email}`} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {contact.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="beauty-divider mb-6"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p className="flex items-center gap-1">
            Hecho con <Heart className="w-4 h-4 text-primary fill-primary" /> por JCampos para JMarkets
          </p>
          <p>2024 JMarkets by JCampos. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <span className="font-medium">Libre de Crueldad</span>
            <span className="font-medium">Vegano</span>
            <span className="font-medium">Natural</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
