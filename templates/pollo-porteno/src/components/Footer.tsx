import { Facebook, MapPin, Phone, Mail } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import { useOrganization } from '@/contexts/OrganizationContext';

export function Footer() {
  const { organization, contact } = useOrganization();
  const name = organization?.name ?? BRAND.name;
  const facebookUrl = contact?.facebookUrl ?? BRAND.contact.facebookUrl;
  const mapsUrl = contact?.googleMapsUrl ?? BRAND.contact.googleMapsUrl;
  const phone = contact?.phone ?? BRAND.contact.phone;
  const email = contact?.email ?? BRAND.contact.email;
  const address = contact?.address ?? '';

  return (
    <footer className="pollo-hero text-pollo-cream mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-10">
        <div>
          <h3 className="text-3xl font-display tracking-wider text-secondary">{name}</h3>
          <p className="mt-3 text-pollo-cream/80 text-sm leading-relaxed">{BRAND.description}</p>
          <p className="mt-4 text-sm">
            <span className="text-secondary font-semibold">{BRAND.ownerRole}:</span>{' '}
            {BRAND.owner}
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-secondary uppercase tracking-wider text-sm">Contacto</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 text-secondary" />
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="hover:underline">
                {address || 'Ver ubicación en Google Maps'}
              </a>
            </li>
            {phone && (
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-secondary" />
                <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
              </li>
            )}
            {email && (
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-secondary" />
                <a href={`mailto:${email}`} className="hover:underline">{email}</a>
              </li>
            )}
            <li className="flex items-center gap-2">
              <Facebook size={16} className="text-secondary" />
              <a href={facebookUrl} target="_blank" rel="noreferrer" className="hover:underline">
                Síguenos en Facebook
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-secondary uppercase tracking-wider text-sm">Horario</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {BRAND.hours.map((h) => (
              <li key={h.day} className="flex justify-between gap-4 border-b border-pollo-cream/10 py-1">
                <span>{h.day}</span>
                <span className="text-pollo-cream/80">{h.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-pollo-cream/10">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-pollo-cream/60 flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} {name}. Todos los derechos reservados.</span>
          <span>Hecho con sazón porteña.</span>
        </div>
      </div>
    </footer>
  );
}
