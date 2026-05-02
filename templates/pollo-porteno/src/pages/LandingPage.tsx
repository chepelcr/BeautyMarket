import { useMemo } from 'react';
import { Facebook, MapPin, Clock, Flame } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useMenu } from '@/hooks/useMenu';
import { useHomeContent } from '@/hooks/useHomeContent';
import { ProductCard } from '@/components/ProductCard';

interface BenefitItem {
  icon?: string;
  title?: string;
  description?: string;
  emoji?: string;
}

function asBenefitItems(value: unknown, fallback: BenefitItem[]): BenefitItem[] {
  if (Array.isArray(value)) return value as BenefitItem[];
  return fallback;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

export function LandingPage() {
  const { organization, theme, contact } = useOrganization();
  const { products, categories, isLoading } = useMenu();
  const { hero, benefits, cta, featured } = useHomeContent();

  // Brand identity (org overrides BRAND defaults).
  const name = organization?.name ?? BRAND.name;
  const tagline = organization?.description ?? BRAND.tagline;
  const logoUrl = theme?.logoUrl ?? '/logo.png';
  const facebookUrl = contact?.facebookUrl ?? BRAND.contact.facebookUrl;
  const mapsUrl = contact?.googleMapsUrl ?? BRAND.contact.googleMapsUrl;

  // Section copy (CMS overrides BRAND placeholder fallbacks).
  const heroBadge = asString(hero.badge, BRAND.heroBadge);
  const heroTitle = asString(hero.title, name);
  const heroSubtitle = asString(hero.subtitle, tagline);
  const heroCtaPrimary = asString(hero.ctaPrimary, BRAND.cta.menu);
  const heroCtaSecondary = asString(hero.ctaSecondary, BRAND.cta.directions);
  const heroImage = asString(hero.image, logoUrl);

  const benefitsItems = asBenefitItems(benefits.items, BRAND.highlights as unknown as BenefitItem[]);

  const featuredBadge = asString(featured.badge, BRAND.featured.badge);
  const featuredTitle = asString(featured.title, BRAND.featured.title);
  const featuredSubtitle = asString(featured.subtitle, BRAND.featured.subtitle);

  const ctaTitle = asString(cta.title, BRAND.cta.aboutTitle);
  const ctaDescription = asString(cta.description, BRAND.cta.aboutDescription);

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
              <Flame size={14} /> {heroBadge}
            </span>
            <h1 className="mt-4 text-5xl md:text-6xl font-display tracking-wider text-secondary leading-none">
              {heroTitle}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-pollo-cream/90 max-w-lg">
              {heroSubtitle}
            </p>
            <p className="mt-3 text-sm text-pollo-cream/70 max-w-lg">{BRAND.description}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#menu"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:opacity-90 transition"
              >
                {heroCtaPrimary}
              </a>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-secondary text-secondary-foreground px-6 py-3 rounded-md font-semibold hover:opacity-90 transition flex items-center gap-2"
              >
                <MapPin size={18} /> {heroCtaSecondary}
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
                src={heroImage}
                alt={`${name} logo`}
                className="w-64 h-64 md:w-80 md:h-80 object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS / BENEFITS */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {benefitsItems.slice(0, 3).map((item, idx) => (
            <div
              key={`${item.title ?? 'benefit'}-${idx}`}
              className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-md transition"
            >
              <div className="text-4xl">{item.emoji ?? '🔥'}</div>
              <h3 className="mt-3 text-xl font-display tracking-wide text-primary">
                {asString(item.title, BRAND.highlights[idx]?.title ?? 'Tradición porteña')}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {asString(item.description, BRAND.highlights[idx]?.description ?? '')}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* MENU */}
      <section id="menu" className="pollo-gradient-soft">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-block text-xs uppercase tracking-wider font-semibold bg-secondary/30 text-pollo-charcoal px-3 py-1 rounded-full">
              {featuredBadge}
            </span>
            <h2 className="mt-3 text-4xl md:text-5xl font-display tracking-wider text-primary">
              {featuredTitle}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {featuredSubtitle}
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
            {ctaTitle}
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">{ctaDescription}</p>
          <div className="mt-6 bg-secondary/20 border border-secondary/40 rounded-xl p-5">
            <p className="text-sm text-muted-foreground">{BRAND.ownerRole}</p>
            <p className="text-2xl font-display tracking-wide text-pollo-charcoal">
              {BRAND.owner}
            </p>
          </div>
        </div>
        <div className="bg-pollo-cream rounded-2xl p-8 shadow-lg grill-stripes">
          <img
            src={logoUrl}
            alt={name}
            className="w-full max-w-sm mx-auto object-contain"
          />
        </div>
      </section>

      {/* VISIT */}
      <section id="visitanos" className="bg-pollo-charcoal text-pollo-cream">
        <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-display tracking-wider text-secondary">
              {BRAND.visit.title}
            </h2>
            <p className="mt-4 text-pollo-cream/80">{BRAND.visit.subtitle}</p>

            <ul className="mt-8 space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-secondary mt-1" size={20} />
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {BRAND.visit.mapsLabel}
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
                  {BRAND.visit.facebookLabel}
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
              {BRAND.visit.openMaps}
            </p>
            <p className="mt-1 text-sm text-pollo-cream/60">{BRAND.visit.directions}</p>
          </a>
        </div>
      </section>
    </main>
  );
}
