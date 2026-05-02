import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import { useOrganization } from '@/contexts/OrganizationContext';

const NAV_ITEMS = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#menu', label: 'Menú' },
  { href: '#nosotros', label: 'Nosotros' },
  { href: '#visitanos', label: 'Visítanos' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { organization, theme } = useOrganization();
  const name = organization?.name ?? BRAND.name;
  const logoUrl = theme?.logoUrl ?? '/logo.png';

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#inicio" className="flex items-center gap-3">
          <img
            src={logoUrl}
            alt={`${name} logo`}
            className="h-12 w-12 rounded-full object-cover bg-white shadow-sm border border-border"
          />
          <span className="font-display text-2xl tracking-wider text-primary">{name}</span>
        </a>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
          <a
            href={BRAND.contact.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition"
          >
            ¿Cómo llegar?
          </a>
        </nav>

        <button
          className="md:hidden p-2 rounded-md hover:bg-muted"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col p-4 gap-3">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-base py-2 text-foreground/80 hover:text-primary"
              >
                {item.label}
              </a>
            ))}
            <a
              href={BRAND.contact.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold text-center"
            >
              ¿Cómo llegar?
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
