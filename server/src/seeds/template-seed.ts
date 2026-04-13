import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import {
  templates,
  templateThemeSettings,
  templateContactSettings,
  templatePaymentSettings,
  templateShippingSettings,
  templatePages,
  templatePageSections,
  templateSectionContent,
  templateCategories,
  templateProducts,
  type InsertTemplate,
} from '../entities';

const baseDomain = process.env.VITE_BASE_DOMAIN || 'j-markets.jcampos.dev';

const defaultTemplates: InsertTemplate[] = [
  {
    name: 'jmarkets-demo',
    displayName: 'JMarkets Demo',
    description: 'Complete demo store with all features',
    category: 'demo',
    thumbnailUrl: '/templates/jmarkets-demo.jpg',
    previewUrl: `https://jmarkets-demo-example.${baseDomain}`,
    repositoryUrl: 'https://github.com/chepelcr/template-jmarkets-demo',
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'beauty-essentials',
    displayName: 'Beauty Essentials',
    description: 'Modern beauty and cosmetics store template',
    category: 'beauty',
    thumbnailUrl: '/templates/beauty-essentials.jpg',
    previewUrl: `https://beauty-essentials-example.${baseDomain}`,
    repositoryUrl: 'https://github.com/chepelcr/template-beauty-essentials',
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'tech-gadgets',
    displayName: 'Tech Gadgets',
    description: 'Technology and electronics store template',
    category: 'technology',
    thumbnailUrl: '/templates/tech-gadgets.jpg',
    previewUrl: `https://tech-gadgets-example.${baseDomain}`,
    repositoryUrl: 'https://github.com/chepelcr/template-tech-gadgets',
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'vintage-fashion',
    displayName: 'Vintage Fashion',
    description: 'Elegant vintage clothing store template',
    category: 'fashion',
    thumbnailUrl: '/templates/vintage-fashion.jpg',
    previewUrl: `https://vintage-fashion-example.${baseDomain}`,
    repositoryUrl: 'https://github.com/chepelcr/template-vintage-fashion',
    isActive: true,
    sortOrder: 4,
  },
  {
    name: 'artisan-crafts',
    displayName: 'Artisan Crafts',
    description: 'Handmade crafts and artisan products template',
    category: 'crafts',
    thumbnailUrl: '/templates/artisan-crafts.jpg',
    previewUrl: `https://artisan-crafts-example.${baseDomain}`,
    repositoryUrl: 'https://github.com/chepelcr/template-artisan-crafts',
    isActive: true,
    sortOrder: 5,
  },
  {
    name: 'gourmet-foods',
    displayName: 'Gourmet Foods',
    description: 'Premium food and beverage store template',
    category: 'food',
    thumbnailUrl: '/templates/gourmet-foods.jpg',
    previewUrl: `https://gourmet-foods-example.${baseDomain}`,
    repositoryUrl: 'https://github.com/chepelcr/template-gourmet-foods',
    isActive: true,
    sortOrder: 6,
  },
  {
    name: 'fitness-hub',
    displayName: 'Fitness Hub',
    description: 'Sports and fitness equipment store template',
    category: 'fitness',
    thumbnailUrl: '/templates/fitness-hub.jpg',
    previewUrl: `https://fitness-hub-example.${baseDomain}`,
    repositoryUrl: 'https://github.com/chepelcr/template-fitness-hub',
    isActive: true,
    sortOrder: 7,
  },
  {
    name: 'pet-care',
    displayName: 'Pet Care',
    description: 'Pet supplies and accessories store template',
    category: 'pets',
    thumbnailUrl: '/templates/pet-care.jpg',
    previewUrl: `https://pet-care-example.${baseDomain}`,
    repositoryUrl: 'https://github.com/chepelcr/template-pet-care',
    isActive: true,
    sortOrder: 8,
  },
];

async function seedTemplateContent(db: PostgresJsDatabase, templateId: string, templateName: string) {
  const existingTheme = await db
    .select()
    .from(templateThemeSettings)
    .where(eq(templateThemeSettings.templateId, templateId))
    .limit(1);

  if (existingTheme.length === 0) {
    await db.insert(templateThemeSettings).values({
      templateId,
      primaryColor: '#e91e63',
      secondaryColor: '#fce7f3',
      logoUrl: null,
      faviconUrl: null,
      fontFamily: 'Inter',
      loadingIcon: 'Sparkles',
      productFallbackIcon: 'Sparkles',
    });
    console.log(`  ✓ Added theme settings`);
  } else {
    // Always update icon fields
    await db.update(templateThemeSettings)
      .set({ 
        loadingIcon: 'Sparkles', 
        productFallbackIcon: 'Sparkles' 
      })
      .where(eq(templateThemeSettings.templateId, templateId));
    console.log(`  ✓ Updated theme settings`);
  }

  const existingContact = await db
    .select()
    .from(templateContactSettings)
    .where(eq(templateContactSettings.templateId, templateId))
    .limit(1);

  if (existingContact.length === 0) {
    await db.insert(templateContactSettings).values({
      templateId,
      email: 'contact@example.com',
      phone: '+50670391069',
      address: '123 Main St, City, Country',
      facebookUrl: 'https://facebook.com/example',
      instagramUrl: 'https://instagram.com/example',
      twitterUrl: 'https://twitter.com/example',
      whatsappNumber: '+50670391069',
      businessHours: 'Mon-Fri: 9AM-6PM',
    });
    console.log(`  ✓ Added contact settings`);
  } else {
    // Always update contact settings
    await db.update(templateContactSettings)
      .set({
        phone: '+50670391069',
        facebookUrl: 'https://facebook.com/example',
        instagramUrl: 'https://instagram.com/example',
        twitterUrl: 'https://twitter.com/example',
        whatsappNumber: '+50670391069',
        businessHours: 'Mon-Fri: 9AM-6PM',
      })
      .where(eq(templateContactSettings.templateId, templateId));
    console.log(`  ✓ Updated contact settings`);
  }

  const existingPayment = await db
    .select()
    .from(templatePaymentSettings)
    .where(eq(templatePaymentSettings.templateId, templateId))
    .limit(1);

  if (existingPayment.length === 0) {
    await db.insert(templatePaymentSettings).values({
      templateId,
      currency: 'USD',
      cashOnDeliveryEnabled: true,
      bankTransferEnabled: false,
      bankAccountDetails: null,
    });
    console.log(`  ✓ Added payment settings`);
  }

  const existingShipping = await db
    .select()
    .from(templateShippingSettings)
    .where(eq(templateShippingSettings.templateId, templateId))
    .limit(1);

  if (existingShipping.length === 0) {
    await db.insert(templateShippingSettings).values({
      templateId,
      freeShippingThreshold: '50.00',
      defaultShippingCost: '5.00',
      enableLocalPickup: true,
      enableCorreosShipping: false,
      enableUberFlash: false,
    });
    console.log(`  ✓ Added shipping settings`);
  }

  // Check for home page
  const existingHomePage = await db
    .select()
    .from(templatePages)
    .where(and(
      eq(templatePages.templateId, templateId),
      eq(templatePages.slug, 'home')
    ))
    .limit(1);

  let homePage;
  if (existingHomePage.length === 0) {
    [homePage] = await db.insert(templatePages).values({
      templateId,
      type: 'home',
      slug: 'home',
      title: 'Inicio',
      metaDescription: 'Bienvenido a nuestra tienda',
      isActive: true,
      sortOrder: 1,
    }).returning();
    console.log(`  ✓ Added home page`);
  } else {
    homePage = existingHomePage[0];
  }

  // Check for about page
  const existingAboutPage = await db
    .select()
    .from(templatePages)
    .where(and(
      eq(templatePages.templateId, templateId),
      eq(templatePages.slug, 'about')
    ))
    .limit(1);

  let aboutPage;
  if (existingAboutPage.length === 0) {
    [aboutPage] = await db.insert(templatePages).values({
      templateId,
      type: 'about',
      slug: 'about',
      title: 'Sobre Nosotros',
      metaDescription: 'Conoce más sobre nosotros',
      isActive: true,
      sortOrder: 2,
    }).returning();
    console.log(`  ✓ Added about page`);
  } else {
    aboutPage = existingAboutPage[0];
  }

  // Check for products page
  const existingProductsPage = await db
    .select()
    .from(templatePages)
    .where(and(
      eq(templatePages.templateId, templateId),
      eq(templatePages.slug, 'products')
    ))
    .limit(1);

  let productsPage;
  if (existingProductsPage.length === 0) {
    [productsPage] = await db.insert(templatePages).values({
      templateId,
      type: 'products',
      slug: 'products',
      title: 'Productos',
      metaDescription: 'Explora nuestra colección completa',
      isActive: true,
      sortOrder: 3,
    }).returning();
    console.log(`  ✓ Added products page`);
  } else {
    productsPage = existingProductsPage[0];
  }

  // Check for services page
  const existingServicesPage = await db
    .select()
    .from(templatePages)
    .where(and(
      eq(templatePages.templateId, templateId),
      eq(templatePages.slug, 'services')
    ))
    .limit(1);

  let servicesPage;
  if (existingServicesPage.length === 0) {
    [servicesPage] = await db.insert(templatePages).values({
      templateId,
      type: 'services',
      slug: 'services',
      title: 'Servicios',
      metaDescription: 'Descubre nuestros servicios profesionales',
      isActive: true,
      sortOrder: 4,
    }).returning();
    console.log(`  ✓ Added services page`);
  } else {
    servicesPage = existingServicesPage[0];
  }

  // Check for programs page
  const existingProgramsPage = await db
    .select()
    .from(templatePages)
    .where(and(
      eq(templatePages.templateId, templateId),
      eq(templatePages.slug, 'programs')
    ))
    .limit(1);

  let programsPage;
  if (existingProgramsPage.length === 0) {
    [programsPage] = await db.insert(templatePages).values({
      templateId,
      type: 'programs',
      slug: 'programs',
      title: 'Programas',
      metaDescription: 'Únete a nuestros programas especializados',
      isActive: true,
      sortOrder: 5,
    }).returning();
    console.log(`  ✓ Added programs page`);
  } else {
    programsPage = existingProgramsPage[0];
  }

  // Check for deals page
  const existingDealsPage = await db
    .select()
    .from(templatePages)
    .where(and(
      eq(templatePages.templateId, templateId),
      eq(templatePages.slug, 'deals')
    ))
    .limit(1);

  let dealsPage;
  if (existingDealsPage.length === 0) {
    [dealsPage] = await db.insert(templatePages).values({
      templateId,
      type: 'deals',
      slug: 'deals',
      title: 'Ofertas',
      metaDescription: 'Descubre nuestras ofertas exclusivas',
      isActive: true,
      sortOrder: 6,
    }).returning();
    console.log(`  ✓ Added deals page`);
  } else {
    dealsPage = existingDealsPage[0];
  }

  // Check and add/update missing sections
  const existingSections = await db
    .select()
    .from(templatePageSections)
    .where(eq(templatePageSections.templatePageId, homePage.id));

  const existingSectionTypes = new Set(existingSections.map(s => s.sectionType));

  // Delete all existing sections to recreate with Spanish content
  if (existingSections.length > 0) {
    for (const section of existingSections) {
      await db.delete(templateSectionContent).where(eq(templateSectionContent.templateSectionId, section.id));
    }
    await db.delete(templatePageSections).where(eq(templatePageSections.templatePageId, homePage.id));
  }

  // Hero Section
  const [heroSection] = await db.insert(templatePageSections).values({
    templatePageId: homePage.id,
    sectionType: 'hero',
    name: 'Banner Principal',
    sortOrder: 1,
    isActive: true,
  }).returning();

    await db.insert(templateSectionContent).values([
      { templateSectionId: heroSection.id, componentId: 'hero-badge', key: 'badge', value: 'Nueva Colección Disponible', valueType: 'string', displayName: 'Badge Text', sortOrder: 1 },
      { templateSectionId: heroSection.id, componentId: 'hero-title', key: 'title', value: 'Descubre Tu Belleza Natural', valueType: 'string', displayName: 'Hero Title', sortOrder: 2 },
      { templateSectionId: heroSection.id, componentId: 'hero-subtitle', key: 'subtitle', value: 'Productos premium elaborados con ingredientes naturales', valueType: 'string', displayName: 'Hero Subtitle', sortOrder: 3 },
      { templateSectionId: heroSection.id, componentId: 'hero-cta-primary', key: 'ctaPrimary', value: 'Comprar Ahora', valueType: 'string', displayName: 'Primary CTA', sortOrder: 4 },
      { templateSectionId: heroSection.id, componentId: 'hero-cta-secondary', key: 'ctaSecondary', value: 'Saber Más', valueType: 'string', displayName: 'Secondary CTA', sortOrder: 5 },
      { templateSectionId: heroSection.id, componentId: 'hero-stats', key: 'stats', value: JSON.stringify([{label: 'Clientes Felices', value: '10K+'}, {label: 'Productos Premium', value: '50+'}, {label: 'Natural y Seguro', value: '100%'}]), valueType: 'json', displayName: 'Stats', sortOrder: 6 },
      { templateSectionId: heroSection.id, componentId: 'hero-image', key: 'image', value: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80', valueType: 'image_url', displayName: 'Hero Image', sortOrder: 7 },
    ]);
    console.log(`  ✓ Updated hero section`);

  // Benefits Section
  const [benefitsSection] = await db.insert(templatePageSections).values({
      templatePageId: homePage.id,
      sectionType: 'benefits',
      name: 'Beneficios',
      sortOrder: 2,
      isActive: true,
    }).returning();

    await db.insert(templateSectionContent).values([
      { templateSectionId: benefitsSection.id, componentId: 'benefits-items', key: 'items', value: JSON.stringify([{icon: 'Leaf', title: 'Ingredientes Naturales', description: 'Formulados con ingredientes orgánicos de origen vegetal'}, {icon: 'ShieldCheck', title: 'Probado Dermatológicamente', description: 'Clínicamente probado y aprobado para todo tipo de piel'}, {icon: 'Heart', title: 'Libre de Crueldad', description: 'Nunca probado en animales, siempre vegano'}, {icon: 'Award', title: 'Premiado', description: 'Reconocido por expertos líderes de la industria de belleza'}]), valueType: 'json', displayName: 'Benefits Items', sortOrder: 1 },
    ]);
    console.log(`  ✓ Updated benefits section`);

  // CTA Section
  const [ctaSection] = await db.insert(templatePageSections).values({
      templatePageId: homePage.id,
      sectionType: 'cta',
      name: 'Llamado a la Acción',
      sortOrder: 3,
      isActive: true,
    }).returning();

    await db.insert(templateSectionContent).values([
      { templateSectionId: ctaSection.id, componentId: 'cta-title', key: 'title', value: 'Únete a Nuestra Comunidad de Belleza', valueType: 'string', displayName: 'CTA Title', sortOrder: 1 },
      { templateSectionId: ctaSection.id, componentId: 'cta-description', key: 'description', value: 'Obtén acceso exclusivo a nuevos productos, consejos de belleza y ofertas especiales', valueType: 'string', displayName: 'CTA Description', sortOrder: 2 },
      { templateSectionId: ctaSection.id, componentId: 'cta-button', key: 'buttonText', value: 'Suscribirse', valueType: 'string', displayName: 'Button Text', sortOrder: 3 },
      { templateSectionId: ctaSection.id, componentId: 'cta-count', key: 'subscriberCount', value: '10,000+', valueType: 'string', displayName: 'Subscriber Count', sortOrder: 4 },
      { templateSectionId: ctaSection.id, componentId: 'cta-count-text', key: 'subscriberText', value: 'amantes de la belleza ya suscritos', valueType: 'string', displayName: 'Subscriber Text', sortOrder: 5 },
    ]);
    console.log(`  ✓ Updated CTA section`);

  // Testimonials Section
  const [testimonialsSection] = await db.insert(templatePageSections).values({
      templatePageId: homePage.id,
      sectionType: 'testimonials',
      name: 'Testimonios',
      sortOrder: 4,
      isActive: true,
    }).returning();

    await db.insert(templateSectionContent).values([
      { templateSectionId: testimonialsSection.id, componentId: 'testimonials-title', key: 'title', value: 'Lo Que Dicen Nuestros Clientes', valueType: 'string', displayName: 'Section Title', sortOrder: 1 },
      { templateSectionId: testimonialsSection.id, componentId: 'testimonials-description', key: 'description', value: 'Historias reales de personas reales que aman nuestros productos', valueType: 'string', displayName: 'Section Description', sortOrder: 2 },
      { templateSectionId: testimonialsSection.id, componentId: 'testimonials-items', key: 'items', value: JSON.stringify([{name: 'Sarah Johnson', role: 'Entusiasta del Cuidado de la Piel', text: '¡Los productos han transformado mi piel! ¡Altamente recomendado!', rating: 5}, {name: 'Emily Chen', role: 'Maquilladora', text: 'Como profesional, confío en esta marca para todos mis clientes. La calidad es inigualable.', rating: 5}, {name: 'Jessica Martinez', role: 'Bloguera de Belleza', text: '¡Finalmente encontré una marca que es efectiva y ética!', rating: 5}]), valueType: 'json', displayName: 'Testimonials', sortOrder: 3 },
    ]);
    console.log(`  ✓ Updated testimonials section`);

  // Featured Section
  const [featuredSection] = await db.insert(templatePageSections).values({
    templatePageId: homePage.id,
    sectionType: 'featured',
    name: 'Productos Destacados',
    sortOrder: 5,
    isActive: true,
  }).returning();

  await db.insert(templateSectionContent).values([
    { templateSectionId: featuredSection.id, componentId: 'featured-badge', key: 'badge', value: 'Más Vendidos', valueType: 'string', displayName: 'Badge', sortOrder: 1 },
    { templateSectionId: featuredSection.id, componentId: 'featured-title', key: 'title', value: 'Productos Destacados', valueType: 'string', displayName: 'Title', sortOrder: 2 },
    { templateSectionId: featuredSection.id, componentId: 'featured-subtitle', key: 'subtitle', value: 'Descubre nuestros productos más amados, seleccionados para tu rutina de cuidado', valueType: 'string', displayName: 'Subtitle', sortOrder: 3 },
  ]);
  console.log(`  ✓ Updated featured section`);

  // Newsletter Section (for footer)
  const [newsletterSection] = await db.insert(templatePageSections).values({
    templatePageId: homePage.id,
    sectionType: 'newsletter',
    name: 'Newsletter',
    sortOrder: 6,
    isActive: true,
  }).returning();

  await db.insert(templateSectionContent).values([
    { templateSectionId: newsletterSection.id, componentId: 'newsletter-title', key: 'title', value: 'Únete a Nuestra Comunidad', valueType: 'string', displayName: 'Title', sortOrder: 1 },
    { templateSectionId: newsletterSection.id, componentId: 'newsletter-description', key: 'description', value: 'Suscríbete para recibir consejos exclusivos, lanzamientos de productos y ofertas especiales', valueType: 'string', displayName: 'Description', sortOrder: 2 },
    { templateSectionId: newsletterSection.id, componentId: 'newsletter-placeholder', key: 'placeholder', value: 'Ingresa tu correo', valueType: 'string', displayName: 'Input Placeholder', sortOrder: 3 },
    { templateSectionId: newsletterSection.id, componentId: 'newsletter-button', key: 'buttonText', value: 'Suscribirse', valueType: 'string', displayName: 'Button Text', sortOrder: 4 },
  ]);
  console.log(`  ✓ Updated newsletter section`);

  // About page sections
  const existingAboutSections = await db
    .select()
    .from(templatePageSections)
    .where(eq(templatePageSections.templatePageId, aboutPage.id));

  // Delete all existing about sections to recreate with Spanish content
  if (existingAboutSections.length > 0) {
    for (const section of existingAboutSections) {
      await db.delete(templateSectionContent).where(eq(templateSectionContent.templateSectionId, section.id));
    }
    await db.delete(templatePageSections).where(eq(templatePageSections.templatePageId, aboutPage.id));
  }

  // About Hero Section
  const [aboutHeroSection] = await db.insert(templatePageSections).values({
      templatePageId: aboutPage.id,
      sectionType: 'hero',
      name: 'Banner Sobre Nosotros',
      sortOrder: 1,
      isActive: true,
    }).returning();

    await db.insert(templateSectionContent).values([
      { templateSectionId: aboutHeroSection.id, componentId: 'about-hero-title', key: 'title', value: 'Sobre Nosotros', valueType: 'string', displayName: 'Title', sortOrder: 1 },
      { templateSectionId: aboutHeroSection.id, componentId: 'about-hero-subtitle', key: 'subtitle', value: 'Dando vida a la belleza natural desde 2020', valueType: 'string', displayName: 'Subtitle', sortOrder: 2 },
    ]);
    console.log(`  ✓ Updated about hero section`);

  // About Story Section
  const [storySection] = await db.insert(templatePageSections).values({
      templatePageId: aboutPage.id,
      sectionType: 'story',
      name: 'Nuestra Historia',
      sortOrder: 2,
      isActive: true,
    }).returning();

    await db.insert(templateSectionContent).values([
      { templateSectionId: storySection.id, componentId: 'story-title', key: 'title', value: 'Nuestra Historia', valueType: 'string', displayName: 'Title', sortOrder: 1 },
      { templateSectionId: storySection.id, componentId: 'story-content', key: 'content', value: 'Fuimos fundados con una misión simple: proporcionar productos naturales de alta calidad que realcen tu belleza natural. Creemos que la verdadera belleza viene de adentro, y nuestros productos están diseñados para apoyar y celebrar tu belleza única.', valueType: 'text', displayName: 'Content', sortOrder: 2 },
    ]);
    console.log(`  ✓ Updated story section`);

  // About Values Section
  const [valuesSection] = await db.insert(templatePageSections).values({
      templatePageId: aboutPage.id,
      sectionType: 'values',
      name: 'Nuestros Valores',
      sortOrder: 3,
      isActive: true,
    }).returning();

    await db.insert(templateSectionContent).values([
      { templateSectionId: valuesSection.id, componentId: 'values-title', key: 'title', value: 'Nuestros Valores', valueType: 'string', displayName: 'Title', sortOrder: 1 },
      { templateSectionId: valuesSection.id, componentId: 'values-items', key: 'items', value: JSON.stringify([{icon: 'Leaf', title: 'Ingredientes Naturales', description: 'Usamos solo los mejores ingredientes naturales y orgánicos en todos nuestros productos.'}, {icon: 'Heart', title: 'Libre de Crueldad', description: 'Nunca probado en animales. Siempre vegano y ético.'}, {icon: 'Award', title: 'Calidad Asegurada', description: 'Probado dermatológicamente y aprobado para todo tipo de piel.'}, {icon: 'Users', title: 'Comunidad Primero', description: 'Apoyando comunidades locales y prácticas sostenibles.'}]), valueType: 'json', displayName: 'Values', sortOrder: 2 },
    ]);
    console.log(`  ✓ Updated values section`);

  // Products page sections
  const existingProductsSections = await db
    .select()
    .from(templatePageSections)
    .where(eq(templatePageSections.templatePageId, productsPage.id));

  if (existingProductsSections.length > 0) {
    for (const section of existingProductsSections) {
      await db.delete(templateSectionContent).where(eq(templateSectionContent.templateSectionId, section.id));
    }
    await db.delete(templatePageSections).where(eq(templatePageSections.templatePageId, productsPage.id));
  }

  const [productsHeroSection] = await db.insert(templatePageSections).values({
    templatePageId: productsPage.id,
    sectionType: 'hero',
    name: 'Banner Productos',
    sortOrder: 1,
    isActive: true,
  }).returning();

  await db.insert(templateSectionContent).values([
    { templateSectionId: productsHeroSection.id, componentId: 'products-hero-title', key: 'title', value: 'Nuestros Productos', valueType: 'string', displayName: 'Title', sortOrder: 1 },
    { templateSectionId: productsHeroSection.id, componentId: 'products-hero-subtitle', key: 'subtitle', value: 'Descubre nuestra colección completa de productos premium, cuidadosamente elaborados con ingredientes naturales', valueType: 'string', displayName: 'Subtitle', sortOrder: 2 },
  ]);

  console.log(`  ✓ Updated products page sections`);

  // Services page sections
  const existingServicesSections = await db
    .select()
    .from(templatePageSections)
    .where(eq(templatePageSections.templatePageId, servicesPage.id));

  if (existingServicesSections.length > 0) {
    for (const section of existingServicesSections) {
      await db.delete(templateSectionContent).where(eq(templateSectionContent.templateSectionId, section.id));
    }
    await db.delete(templatePageSections).where(eq(templatePageSections.templatePageId, servicesPage.id));
  }

  const [servicesHeroSection] = await db.insert(templatePageSections).values({
    templatePageId: servicesPage.id,
    sectionType: 'hero',
    name: 'Banner Servicios',
    sortOrder: 1,
    isActive: true,
  }).returning();

  await db.insert(templateSectionContent).values([
    { templateSectionId: servicesHeroSection.id, componentId: 'services-hero-title', key: 'title', value: 'Nuestros Servicios', valueType: 'string', displayName: 'Title', sortOrder: 1 },
    { templateSectionId: servicesHeroSection.id, componentId: 'services-hero-subtitle', key: 'subtitle', value: 'Servicios profesionales diseñados para brindarte la mejor experiencia', valueType: 'string', displayName: 'Subtitle', sortOrder: 2 },
  ]);
  console.log(`  ✓ Updated services page sections`);

  // Programs page sections
  const existingProgramsSections = await db
    .select()
    .from(templatePageSections)
    .where(eq(templatePageSections.templatePageId, programsPage.id));

  if (existingProgramsSections.length > 0) {
    for (const section of existingProgramsSections) {
      await db.delete(templateSectionContent).where(eq(templateSectionContent.templateSectionId, section.id));
    }
    await db.delete(templatePageSections).where(eq(templatePageSections.templatePageId, programsPage.id));
  }

  const [programsHeroSection] = await db.insert(templatePageSections).values({
    templatePageId: programsPage.id,
    sectionType: 'hero',
    name: 'Banner Programas',
    sortOrder: 1,
    isActive: true,
  }).returning();

  await db.insert(templateSectionContent).values([
    { templateSectionId: programsHeroSection.id, componentId: 'programs-hero-title', key: 'title', value: 'Nuestros Programas', valueType: 'string', displayName: 'Title', sortOrder: 1 },
    { templateSectionId: programsHeroSection.id, componentId: 'programs-hero-subtitle', key: 'subtitle', value: 'Programas especializados para ayudarte a alcanzar tus objetivos', valueType: 'string', displayName: 'Subtitle', sortOrder: 2 },
  ]);
  console.log(`  ✓ Updated programs page sections`);

  // Deals page sections
  const existingDealsSections = await db
    .select()
    .from(templatePageSections)
    .where(eq(templatePageSections.templatePageId, dealsPage.id));

  if (existingDealsSections.length > 0) {
    for (const section of existingDealsSections) {
      await db.delete(templateSectionContent).where(eq(templateSectionContent.templateSectionId, section.id));
    }
    await db.delete(templatePageSections).where(eq(templatePageSections.templatePageId, dealsPage.id));
  }

  const [dealsHeroSection] = await db.insert(templatePageSections).values({
    templatePageId: dealsPage.id,
    sectionType: 'hero',
    name: 'Banner Ofertas',
    sortOrder: 1,
    isActive: true,
  }).returning();

  await db.insert(templateSectionContent).values([
    { templateSectionId: dealsHeroSection.id, componentId: 'deals-hero-badge', key: 'badge', value: 'Ofertas Especiales', valueType: 'string', displayName: 'Badge', sortOrder: 1 },
    { templateSectionId: dealsHeroSection.id, componentId: 'deals-hero-title', key: 'title', value: 'Ofertas y Descuentos', valueType: 'string', displayName: 'Title', sortOrder: 2 },
    { templateSectionId: dealsHeroSection.id, componentId: 'deals-hero-subtitle', key: 'subtitle', value: 'Ahorra en grande en tus productos favoritos con nuestras ofertas exclusivas', valueType: 'string', displayName: 'Subtitle', sortOrder: 3 },
  ]);
  console.log(`  ✓ Updated deals page sections`);

  const existingCategories = await db
    .select()
    .from(templateCategories)
    .where(eq(templateCategories.templateId, templateId));

  const categories = getCategoriesForTemplate(templateName, templateId);
  
  if (existingCategories.length === 0) {
    await db.insert(templateCategories).values(categories);
    console.log(`  ✓ Added ${categories.length} categories`);
  } else {
    // Always update categories to match current template definition
    await db.delete(templateCategories).where(eq(templateCategories.templateId, templateId));
    await db.insert(templateCategories).values(categories);
    console.log(`  ✓ Updated ${categories.length} categories`);
  }

  const existingProducts = await db
    .select()
    .from(templateProducts)
    .where(eq(templateProducts.templateId, templateId));

  const updatedCategories = await db.select().from(templateCategories).where(eq(templateCategories.templateId, templateId));

  if (updatedCategories.length > 0) {
    const products = getProductsForTemplate(templateName, templateId, updatedCategories);
    
    if (existingProducts.length === 0) {
      await db.insert(templateProducts).values(products);
      console.log(`  ✓ Added ${products.length} products`);
    } else {
      // Always update products to match current template definition
      await db.delete(templateProducts).where(eq(templateProducts.templateId, templateId));
      await db.insert(templateProducts).values(products);
      console.log(`  ✓ Updated ${products.length} products`);
    }
  }
}

function getCategoriesForTemplate(templateName: string, templateId: string) {
  const templateCategories: Record<string, any[]> = {
    'beauty-essentials': [
      { name: 'Cuidado de la Piel', slug: 'skincare', description: 'Productos premium para el cuidado de la piel' },
      { name: 'Maquillaje', slug: 'makeup', description: 'Colección profesional de maquillaje' },
    ],
    'tech-gadgets': [
      { name: 'Audio', slug: 'audio', description: 'Auriculares y altavoces' },
      { name: 'Wearables', slug: 'wearables', description: 'Relojes inteligentes y rastreadores de fitness' },
    ],
    'vintage-fashion': [
      { name: 'Ropa', slug: 'clothing', description: 'Vestidos y abrigos vintage' },
      { name: 'Accesorios', slug: 'accessories', description: 'Bolsos y gafas de sol' },
    ],
    'artisan-crafts': [
      { name: 'Decoración del Hogar', slug: 'home-decor', description: 'Artículos decorativos hechos a mano' },
      { name: 'Accesorios', slug: 'accessories', description: 'Accesorios artesanales' },
    ],
    'gourmet-foods': [
      { name: 'Quesos y Lácteos', slug: 'cheese-dairy', description: 'Productos de queso artesanal' },
      { name: 'Despensa', slug: 'pantry', description: 'Esenciales gourmet para la despensa' },
    ],
    'fitness-hub': [
      { name: 'Equipamiento', slug: 'equipment', description: 'Equipamiento y accesorios de fitness' },
      { name: 'Entrenamiento', slug: 'training', description: 'Programas y servicios de entrenamiento' },
    ],
    'pet-care': [
      { name: 'Suministros para Perros', slug: 'dog-supplies', description: 'Productos para perros' },
      { name: 'Suministros para Gatos', slug: 'cat-supplies', description: 'Productos para gatos' },
    ],
    'jmarkets-demo': [
      { name: 'Destacados', slug: 'featured', description: 'Productos destacados' },
      { name: 'Nuevos Ingresos', slug: 'new-arrivals', description: 'Últimos productos' },
    ],
  };

  const categories = templateCategories[templateName] || templateCategories['jmarkets-demo'];

  return categories.map((cat, idx) => ({
    templateId,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    backgroundColor: '#f3f4f6',
    buttonColor: '#e91e63',
    image1Url: null,
    image2Url: null,
    isActive: true,
    sortOrder: idx + 1,
  }));
}

const VALID_PRODUCT_TYPES = ['product', 'service', 'program'] as const;
type ProductType = typeof VALID_PRODUCT_TYPES[number];

function validateProductTypes(products: any[], templateName: string): void {
  const invalidProducts = products.filter(p => !VALID_PRODUCT_TYPES.includes(p.type));
  if (invalidProducts.length > 0) {
    const invalid = invalidProducts.map(p => `${p.name} (type: ${p.type})`).join(', ');
    throw new Error(`Template '${templateName}' has invalid product types: ${invalid}. Valid types: ${VALID_PRODUCT_TYPES.join(', ')}`);
  }
}

function getProductsForTemplate(templateName: string, templateId: string, categories: any[]) {
  const cat1 = categories[0]?.id;
  const cat2 = categories[1]?.id;

  const templateProducts: Record<string, any[]> = {
    'beauty-essentials': [
      { name: 'Crema Facial de Lujo', price: 4999, categoryId: cat1, onSale: false, isService: false, type: 'product' },
      { name: 'Suero Anti-Edad', price: 7999, categoryId: cat1, onSale: false, isService: false, type: 'product' },
      { name: 'Set de Mascarillas Hidratantes', price: 2999, categoryId: cat1, originalPrice: 4999, discount: 40, onSale: true, isService: false, type: 'product' },
      { name: 'Bálsamo Labial Orgánico', price: 1299, categoryId: cat2, originalPrice: 1999, discount: 35, onSale: true, isService: false, type: 'product' },
      { name: 'Tratamiento Facial', price: 9999, categoryId: cat1, duration: '60 minutos', onSale: false, isService: true, type: 'service' },
      { name: 'Sesión de Maquillaje', price: 7999, categoryId: cat2, duration: '45 minutos', onSale: false, isService: true, type: 'service' },
      { name: 'Programa de Rutina de Cuidado', price: 14999, categoryId: cat1, duration: '30 días', difficulty: 'beginner', onSale: false, isService: false, type: 'program' },
      { name: 'Programa Anti-Edad', price: 19999, categoryId: cat1, originalPrice: 24999, discount: 20, duration: '60 días', difficulty: 'intermediate', onSale: true, isService: false, type: 'program' },
    ],
    'tech-gadgets': [
      { name: 'Auriculares Inalámbricos Pro', price: 14999, categoryId: cat1, onSale: false, isService: false, type: 'product' },
      { name: 'Reloj Inteligente Ultra', price: 39999, categoryId: cat2, onSale: false, isService: false, type: 'product' },
      { name: 'Hub USB-C', price: 4999, categoryId: cat1, originalPrice: 7999, discount: 38, onSale: true, isService: false, type: 'product' },
      { name: 'Cargador Portátil', price: 2999, categoryId: cat1, originalPrice: 4999, discount: 40, onSale: true, isService: false, type: 'product' },
      { name: 'Servicio de Configuración Técnica', price: 9999, categoryId: cat1, duration: '2 horas', onSale: false, isService: true, type: 'service' },
      { name: 'Programa de Configuración de Casa Inteligente', price: 29999, categoryId: cat2, duration: '1 semana', difficulty: 'beginner', onSale: false, isService: false, type: 'program' },
    ],
    'vintage-fashion': [
      { name: 'Vestido Swing Años 50', price: 18900, categoryId: cat1, onSale: false, isService: false, type: 'product' },
      { name: 'Abrigo de Tweed', price: 24900, categoryId: cat1, originalPrice: 34900, discount: 29, onSale: true, isService: false, type: 'product' },
      { name: 'Bolso de Cuero', price: 15900, categoryId: cat2, onSale: false, isService: false, type: 'product' },
      { name: 'Gafas de Sol Vintage', price: 7900, categoryId: cat2, originalPrice: 9900, discount: 20, onSale: true, isService: false, type: 'product' },
      { name: 'Servicio de Estilismo Personal', price: 12999, categoryId: cat1, duration: '90 minutos', onSale: false, isService: true, type: 'service' },
      { name: 'Programa de Transformación de Vestuario', price: 49999, categoryId: cat1, duration: '4 semanas', difficulty: 'intermediate', onSale: false, isService: false, type: 'program' },
    ],
    'artisan-crafts': [
      { name: 'Cuenco de Cerámica Hecho a Mano', price: 4800, categoryId: cat1, originalPrice: 6800, discount: 29, onSale: true, isService: false, type: 'product' },
      { name: 'Tapiz de Macramé Tejido', price: 6500, categoryId: cat1, onSale: false, isService: false, type: 'product' },
      { name: 'Diario de Cuero', price: 4200, categoryId: cat2, onSale: false, isService: false, type: 'product' },
      { name: 'Tabla de Servir de Madera', price: 7800, categoryId: cat1, onSale: false, isService: false, type: 'product' },
      { name: 'Taller de Artesanía Personalizado', price: 8999, categoryId: cat1, duration: '3 horas', onSale: false, isService: true, type: 'service' },
      { name: 'Programa de Maestría en Cerámica', price: 24999, categoryId: cat1, duration: '8 semanas', difficulty: 'beginner', onSale: false, isService: false, type: 'program' },
    ],
    'gourmet-foods': [
      { name: 'Parmesano Reggiano Añejo', price: 2499, categoryId: cat1, onSale: false, isService: false, type: 'product' },
      { name: 'Aceite de Oliva con Trufa', price: 2799, categoryId: cat2, originalPrice: 3499, discount: 20, onSale: true, isService: false, type: 'product' },
      { name: 'Miel Cruda Orgánica', price: 1899, categoryId: cat2, onSale: false, isService: false, type: 'product' },
      { name: 'Masa Madre Artesanal', price: 1599, categoryId: cat2, onSale: false, isService: false, type: 'product' },
      { name: 'Servicio de Chef Privado', price: 19999, categoryId: cat2, duration: '3 horas', onSale: false, isService: true, type: 'service' },
      { name: 'Programa de Maestría Culinaria', price: 39999, categoryId: cat2, duration: '12 semanas', difficulty: 'intermediate', onSale: false, isService: false, type: 'program' },
    ],
    'fitness-hub': [
      { name: 'Mancuernas Ajustables Pro', price: 29900, categoryId: cat1, onSale: false, isService: false, type: 'product' },
      { name: 'Máquina de Remo Elite', price: 89900, categoryId: cat1, onSale: false, isService: false, type: 'product' },
      { name: 'Colchoneta de Yoga Premium', price: 4900, categoryId: cat1, originalPrice: 6900, discount: 29, onSale: true, isService: false, type: 'product' },
      { name: 'Set de Bandas de Resistencia', price: 2999, categoryId: cat1, originalPrice: 4999, discount: 40, onSale: true, isService: false, type: 'product' },
      { name: 'Sesión de Entrenamiento Personal', price: 9999, categoryId: cat2, duration: '60 minutos', onSale: false, isService: true, type: 'service' },
      { name: 'Programa Principiante', price: 4999, categoryId: cat2, duration: '4 semanas', difficulty: 'beginner', onSale: false, isService: false, type: 'program' },
      { name: 'Programa Avanzado', price: 7999, categoryId: cat2, duration: '8 semanas', difficulty: 'advanced', onSale: false, isService: false, type: 'program' },
      { name: 'Programa Intermedio', price: 5999, categoryId: cat2, originalPrice: 7999, discount: 25, duration: '6 semanas', difficulty: 'intermediate', onSale: true, isService: false, type: 'program' },
    ],
    'pet-care': [
      { name: 'Comida Premium para Perros 15kg', price: 5999, categoryId: cat1, onSale: false, isService: false, type: 'product' },
      { name: 'Set de Juguetes Interactivos para Gatos', price: 2999, categoryId: cat2, originalPrice: 4499, discount: 33, onSale: true, isService: false, type: 'product' },
      { name: 'Cama Ortopédica para Mascotas', price: 7999, categoryId: cat1, onSale: false, isService: false, type: 'product' },
      { name: 'Kit de Aseo para Mascotas', price: 3999, categoryId: cat2, originalPrice: 5999, discount: 33, onSale: true, isService: false, type: 'product' },
      { name: 'Servicio de Peluquería Canina', price: 6999, categoryId: cat1, duration: '90 minutos', onSale: false, isService: true, type: 'service' },
      { name: 'Sesión de Entrenamiento para Mascotas', price: 8999, categoryId: cat1, duration: '60 minutos', onSale: false, isService: true, type: 'service' },
      { name: 'Programa de Entrenamiento para Cachorros', price: 29999, categoryId: cat1, duration: '8 semanas', difficulty: 'beginner', onSale: false, isService: false, type: 'program' },
    ],
    'jmarkets-demo': [
      { name: 'Producto Demo 1', price: 4999, categoryId: cat1, onSale: false, isService: false, type: 'product' },
      { name: 'Producto Demo 2', price: 7999, categoryId: cat1, onSale: false, isService: false, type: 'product' },
      { name: 'Artículo en Oferta Demo', price: 2999, categoryId: cat2, originalPrice: 4999, discount: 40, onSale: true, isService: false, type: 'product' },
      { name: 'Servicio Demo', price: 9999, categoryId: cat2, duration: '60 minutos', onSale: false, isService: true, type: 'service' },
      { name: 'Programa Demo', price: 14999, categoryId: cat2, duration: '4 semanas', difficulty: 'beginner', onSale: false, isService: false, type: 'program' },
    ],
  };

  const products = templateProducts[templateName] || templateProducts['jmarkets-demo'];

  validateProductTypes(products, templateName);

  return products.map(p => ({
    templateId,
    categoryId: p.categoryId,
    name: p.name,
    description: `de alta calidad ${p.name.toLowerCase()}`,
    price: p.price,
    originalPrice: p.originalPrice || null,
    discount: p.discount || null,
    onSale: p.onSale,
    isService: p.isService,
    type: p.type as 'product' | 'service' | 'program',
    duration: p.duration || null,
    difficulty: p.difficulty || null,
    imageUrl: null,
    isActive: true,
    stockQuantity: p.isService ? 0 : 100,
  }));
}

export async function seedTemplates(db: PostgresJsDatabase<any>): Promise<void> {
  console.log('Starting template seed...\n');

  for (const template of defaultTemplates) {
    const existing = await db
      .select()
      .from(templates)
      .where(eq(templates.name, template.name))
      .limit(1);

    let templateId: string;

    if (existing.length > 0) {
      console.log(`Template '${template.name}' already exists`);
      templateId = existing[0].id;
      
      // Update fields if they changed
      const updates: any = {};
      if (existing[0].previewUrl !== template.previewUrl) {
        updates.previewUrl = template.previewUrl;
      }
      if (existing[0].repositoryUrl !== template.repositoryUrl) {
        updates.repositoryUrl = template.repositoryUrl;
      }
      
      if (Object.keys(updates).length > 0) {
        await db
          .update(templates)
          .set(updates)
          .where(eq(templates.id, templateId));
        if (updates.previewUrl) console.log(`  ✓ Updated preview URL`);
        if (updates.repositoryUrl) console.log(`  ✓ Updated repository URL`);
      }
    } else {
      const [insertedTemplate] = await db.insert(templates).values(template).returning();
      templateId = insertedTemplate.id;
      console.log(`Created template: ${template.name}`);
    }

    await seedTemplateContent(db, templateId, template.name);
    console.log('');
  }

  console.log('Template seed completed successfully!');
}
