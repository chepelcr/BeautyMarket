import { useMemo } from 'react';
import { Facebook, MapPin, Clock, Flame } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useMenu } from '@/hooks/useMenu';
import { ProductCard } from '@/components/ProductCard';

export function LandingPage() {
  const { organization, theme, contact } = useOrganization();
  const { products, categories, isLoading } = useMenu();

  const name = organization?.name ?? BRAND.name;
  const tagline = organization?.description ?? BRAND.tagline;
  const logoUrl = theme?.logoUrl ?? '/logo.png';
  const facebookUrl = contact?.facebookUrl ?? BRAND.contact.facebookUrl;
  const mapsUrl = contact?.googleMapsUrl ?? BRAND.contact.googleMapsUrl;

  const grouped = useMemo(() => {
    const byCat = new Map<string, typeof products>();
    products.forEach((p) => {
      const key = p.category?.category_id ?? p.category_id ?? 'otros';
      if (!byCat.has(key)) byCat.set(key, []);
      byCat.get(key)!.push(p);
    });
    return byCat;
  }, [products]);

  return (
    <main>
      {/* HERO */}
      <section id="inicio" className="pollo-hero text-pollo-cream">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-secondary/20 text-secondary px-3 py-1 rounded-full text-xs uppercase tracking-wider font-semibold">
              <Flame size={14} /> Asado al carbón
            </span>
            <h1 className="mt-4 text-5xl md:text-6xl font-display tracking-wider text-secondary leading-none">
              {name}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-pollo-cream/90 max-w-lg">
              {tagline}
            </p>
            <p className="mt-3 text-sm text-pollo-cream/70 max-w-lg">{BRAND.description}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#menu"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:opacity-90 transition"
              >
                Ver el menú
              </a>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-secondary text-secondary-foreground px-6 py-3 rounded-md font-semibold hover:opacity-90 transition flex items-center gap-2"
              >
                <MapPin size={18} /> Cómo llegar
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="border border-pollo-cream/30 text-pollo-cream px-6 py-3 rounded-md font-semibold hover:bg-pollo-cream/10 transition flex items-center gap-2"
              >
                <Facebook size={18} /> Facebook
              </a>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <div className="bg-pollo-cream rounded-2xl p-6 shadow-2xl rotate-2 hover:rotate-0 transition-transform">
              <img
                src={logoUrl}
                alt={`${name} logo`}
                className="w-64 h-64 md:w-80 md:h-80 object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {BRAND.highlights.map((h) => (
            <div
              key={h.title}
              className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-md transition"
            >
              <div className="text-4xl">{h.emoji}</div>
              <h3 className="mt-3 text-xl font-display tracking-wide text-primary">{h.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{h.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MENU */}
      <section id="menu" className="pollo-gradient-soft">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display tracking-wider text-primary">
              Nuestro menú
            </h2>
            <p className="mt-3 text-muted-foreground">
              Pollo asado a la leña, combos familiares y guarniciones recién hechas.
              {!organization && ' (Mostrando carta de muestra — conecta una organización para ver tu menú real.)'}
            </p>
          </div>

          {isLoading ? (
            <div className="mt-10 grid md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 bg-card animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="mt-10 space-y-12">
              {Array.from(grouped.entries()).map(([catId, items]) => {
                const cat = categories.find((c) => c.category_id === catId);
                return (
                  <div key={catId}>
                    <h3 className="text-2xl font-display tracking-wide text-pollo-charcoal border-b-2 border-primary inline-block pb-1">
                      {cat?.name ?? items[0]?.category?.name ?? 'Otros'}
                    </h3>
                    <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map((p) => (
                        <ProductCard key={p.product_id} product={p} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ABOUT */}
      <section id="nosotros" className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-display tracking-wider text-primary">
            Una tradición porteña
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            En <strong>{name}</strong> servimos pollo asado al carbón con la sazón de
            recetas familiares, hechas con paciencia y cariño. Cada plato es un pedacito
            de hogar, listo para disfrutar con la familia o para llevar.
          </p>
          <div className="mt-6 bg-secondary/20 border border-secondary/40 rounded-xl p-5">
            <p className="text-sm text-muted-foreground">{BRAND.ownerRole}</p>
            <p className="text-2xl font-display tracking-wide text-pollo-charcoal">
              {BRAND.owner}
            </p>
          </div>
        </div>
        <div className="bg-pollo-cream rounded-2xl p-8 shadow-lg grill-stripes">
          <img
            src="/logo.png"
            alt="Pollo Porteño"
            className="w-full max-w-sm mx-auto object-contain"
          />
        </div>
      </section>

      {/* VISIT */}
      <section id="visitanos" className="bg-pollo-charcoal text-pollo-cream">
        <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-display tracking-wider text-secondary">
              Visítanos
            </h2>
            <p className="mt-4 text-pollo-cream/80">
              Te esperamos para que disfrutes nuestro pollo recién salido de la parrilla.
            </p>

            <ul className="mt-8 space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-secondary mt-1" size={20} />
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  Ver ubicación en Google Maps
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Facebook className="text-secondary mt-1" size={20} />
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  Síguenos en Facebook
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="text-secondary mt-1" size={20} />
                <div>
                  {BRAND.hours.map((h) => (
                    <div key={h.day} className="text-sm">
                      <span className="font-semibold">{h.day}:</span>{' '}
                      <span className="text-pollo-cream/80">{h.value}</span>
                    </div>
                  ))}
                </div>
              </li>
            </ul>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl overflow-hidden shadow-2xl bg-pollo-cream/5 border border-pollo-cream/10 flex flex-col items-center justify-center p-10 hover:bg-pollo-cream/10 transition"
          >
            <MapPin size={48} className="text-secondary" />
            <p className="mt-3 font-display text-2xl tracking-wider text-secondary">
              Abrir en Google Maps
            </p>
            <p className="mt-1 text-sm text-pollo-cream/60">Toca para obtener indicaciones</p>
          </a>
        </div>
      </section>
    </main>
  );
}
