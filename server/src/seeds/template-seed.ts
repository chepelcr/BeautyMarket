import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  templates,
  organizations,
  pages,
  categoriesTable,
  themeSettings,
  contactSettings,
  paymentSettings,
  shippingSettings,
} from '../entities';

// Template definitions (based on live site examples)
const defaultTemplates = [
  {
    name: 'jmarkets-demo',
    displayName: 'JMarkets Demo',
    description: 'Tienda de ejemplo completa con productos, carrito de compras, checkout y todas las funcionalidades de la plataforma.',
    category: 'demo',
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'tech-gadgets',
    displayName: 'Tech Gadgets Pro',
    description: 'Últimos gadgets y accesorios electrónicos. Smartphones, laptops, tablets y dispositivos innovadores para la vida moderna.',
    category: 'electronics',
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'vintage-fashion',
    displayName: 'Vintage Fashion Co',
    description: 'Colección curada de ropa vintage y retro. Piezas únicas de décadas pasadas con estilo atemporal.',
    category: 'fashion',
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'artisan-crafts',
    displayName: 'Artisan Crafts Studio',
    description: 'Manualidades y suministros para DIY. Materiales para tejer, pintar, trabajar la madera y artículos únicos hechos a mano.',
    category: 'crafts',
    isActive: true,
    sortOrder: 4,
  },
  {
    name: 'gourmet-foods',
    displayName: 'Gourmet Foods Market',
    description: 'Alimentos orgánicos y especiales premium. Quesos artesanales, especias exóticas, bebidas artesanales y productos especiales.',
    category: 'food',
    isActive: true,
    sortOrder: 5,
  },
  {
    name: 'fitness-hub',
    displayName: 'Fitness Equipment Hub',
    description: 'Equipamiento de fitness para hogar y gimnasio. Mancuernas, tapetes de yoga, bandas de resistencia y accesorios de entrenamiento.',
    category: 'sports',
    isActive: true,
    sortOrder: 6,
  },
  {
    name: 'pet-care',
    displayName: 'Pet Care Supplies',
    description: 'Todo para tus mascotas. Juguetes, productos de aseo, nutrición y camas cómodas para gatos y perros.',
    category: 'pets',
    isActive: true,
    sortOrder: 7,
  },
  {
    name: 'beauty-essentials',
    displayName: 'Beauty Essentials',
    description: 'Cosméticos premium y cuidado de la piel. Productos de belleza naturales, cremas hidratantes, maquillaje y fragancias elegantes.',
    category: 'beauty',
    isActive: true,
    sortOrder: 8,
  },
  {
    name: 'playground',
    displayName: 'Playground',
    description: 'Plantilla experimental para probar nuevas funcionalidades y construir desde cero.',
    category: 'development',
    isActive: true,
    sortOrder: 100,
  },
];

// Template organization configurations
interface TemplateOrgConfig {
  templateName: string;
  subdomain: string;
  organizationName: string;
  theme: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    logoUrl?: string;
    faviconUrl?: string;
  };
  contact: {
    email?: string;
    phone?: string;
    address?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    whatsappNumber?: string;
    businessHours?: string;
  };
  payment: {
    currency?: string;
    cashOnDeliveryEnabled?: boolean;
    stripeEnabled?: boolean;
  };
  shipping: {
    defaultShippingCost?: number;
    freeShippingThreshold?: number;
    enableLocalPickup?: boolean;
    enableCorreosShipping?: boolean;
    enableUberFlash?: boolean;
  };
  categories: Array<{
    name: string;
    slug: string;
    description: string;
    backgroundColor: string;
    buttonColor: string;
    sortOrder: number;
  }>;
}

const templateConfigs: TemplateOrgConfig[] = [
  {
    templateName: 'jmarkets-demo',
    subdomain: 'jmarkets-demo-example',
    organizationName: 'JMarkets Demo',
    theme: {
      primaryColor: '#f97316', // Orange-500 (marketplace energy)
      secondaryColor: '#1e40af', // Blue-800 (trust)
      fontFamily: 'Inter',
    },
    contact: {
      email: 'demo@jmarkets.com',
      phone: '+1-555-DEMO',
      address: '123 Marketplace Street, Demo City',
      businessHours: 'Mon-Sat: 9AM-9PM, Sun: 10AM-6PM',
    },
    payment: {
      currency: 'USD',
      cashOnDeliveryEnabled: true,
    },
    shipping: {
      defaultShippingCost: 500,
      freeShippingThreshold: 5000,
      enableLocalPickup: true,
    },
    categories: [
      {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Latest gadgets and tech',
        backgroundColor: '#fed7aa', // Orange-200
        buttonColor: '#f97316',
        sortOrder: 1,
      },
      {
        name: 'Fashion',
        slug: 'fashion',
        description: 'Trending clothing and accessories',
        backgroundColor: '#bfdbfe', // Blue-200
        buttonColor: '#1e40af',
        sortOrder: 2,
      },
      {
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Everything for your home',
        backgroundColor: '#fef3c7', // Amber-100
        buttonColor: '#fbbf24',
        sortOrder: 3,
      },
    ],
  },
  {
    templateName: 'tech-gadgets',
    subdomain: 'tech-gadgets-example',
    organizationName: 'Tech Gadgets Pro',
    theme: {
      primaryColor: '#1e3a8a', // Blue-900 (tech sophistication)
      secondaryColor: '#06b6d4', // Cyan-500 (modern tech)
      fontFamily: 'Roboto',
    },
    contact: {
      email: 'info@techgadgets.com',
      phone: '+1-555-TECH',
      address: '456 Innovation Ave, Silicon Valley',
      businessHours: 'Mon-Fri: 9AM-8PM, Sat-Sun: 10AM-6PM',
    },
    payment: {
      currency: 'USD',
      cashOnDeliveryEnabled: true,
    },
    shipping: {
      defaultShippingCost: 600,
      freeShippingThreshold: 10000,
      enableLocalPickup: true,
    },
    categories: [
      {
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Latest mobile devices',
        backgroundColor: '#dbeafe', // Blue-100
        buttonColor: '#1e3a8a',
        sortOrder: 1,
      },
      {
        name: 'Laptops & Tablets',
        slug: 'laptops-tablets',
        description: 'Portable computing devices',
        backgroundColor: '#cffafe', // Cyan-100
        buttonColor: '#06b6d4',
        sortOrder: 2,
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Tech accessories and peripherals',
        backgroundColor: '#e0e7ff', // Indigo-100
        buttonColor: '#3b82f6',
        sortOrder: 3,
      },
    ],
  },
  {
    templateName: 'vintage-fashion',
    subdomain: 'vintage-fashion-example',
    organizationName: 'Vintage Fashion Co',
    theme: {
      primaryColor: '#881337', // Rose-900 (vintage burgundy)
      secondaryColor: '#eab308', // Yellow-500 (retro mustard)
      fontFamily: 'Playfair Display',
    },
    contact: {
      email: 'hello@vintagefashion.com',
      phone: '+1-555-RETRO',
      address: '789 Vintage Lane, Fashion District',
      businessHours: 'Tue-Sat: 11AM-7PM, Sun: 12PM-5PM',
    },
    payment: {
      currency: 'USD',
      cashOnDeliveryEnabled: true,
    },
    shipping: {
      defaultShippingCost: 700,
      freeShippingThreshold: 8000,
      enableLocalPickup: true,
    },
    categories: [
      {
        name: 'Vintage Clothing',
        slug: 'vintage-clothing',
        description: 'Authentic retro apparel',
        backgroundColor: '#fce7f3', // Pink-100
        buttonColor: '#881337',
        sortOrder: 1,
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Classic jewelry and bags',
        backgroundColor: '#fef3c7', // Amber-100
        buttonColor: '#eab308',
        sortOrder: 2,
      },
      {
        name: 'Shoes',
        slug: 'shoes',
        description: 'Timeless footwear',
        backgroundColor: '#ffe4e6', // Rose-100
        buttonColor: '#f43f5e',
        sortOrder: 3,
      },
    ],
  },
  {
    templateName: 'artisan-crafts',
    subdomain: 'artisan-crafts-example',
    organizationName: 'Artisan Crafts Studio',
    theme: {
      primaryColor: '#ea580c', // Orange-600 (terracotta)
      secondaryColor: '#15803d', // Green-700 (forest)
      fontFamily: 'Merriweather',
    },
    contact: {
      email: 'studio@artisancrafts.com',
      phone: '+1-555-CRAFT',
      address: '321 Maker Street, Artisan Quarter',
      businessHours: 'Mon-Sat: 10AM-6PM',
    },
    payment: {
      currency: 'USD',
      cashOnDeliveryEnabled: true,
    },
    shipping: {
      defaultShippingCost: 450,
      freeShippingThreshold: 5500,
      enableLocalPickup: true,
    },
    categories: [
      {
        name: 'DIY Supplies',
        slug: 'diy-supplies',
        description: 'Materials for your projects',
        backgroundColor: '#fed7aa', // Orange-200
        buttonColor: '#ea580c',
        sortOrder: 1,
      },
      {
        name: 'Handmade Items',
        slug: 'handmade-items',
        description: 'Unique artisan creations',
        backgroundColor: '#d1fae5', // Green-100
        buttonColor: '#15803d',
        sortOrder: 2,
      },
      {
        name: 'Tools',
        slug: 'tools',
        description: 'Crafting tools and equipment',
        backgroundColor: '#fef3c7', // Amber-100
        buttonColor: '#ca8a04',
        sortOrder: 3,
      },
    ],
  },
  {
    templateName: 'gourmet-foods',
    subdomain: 'gourmet-foods-example',
    organizationName: 'Gourmet Foods Market',
    theme: {
      primaryColor: '#dc2626', // Red-600 (appetite stimulation)
      secondaryColor: '#166534', // Green-800 (fresh organic)
      fontFamily: 'Playfair Display',
    },
    contact: {
      email: 'info@gourmetfoods.com',
      phone: '+1-555-FOOD',
      address: '654 Culinary Boulevard, Foodie District',
      businessHours: 'Mon-Sat: 8AM-8PM, Sun: 9AM-6PM',
    },
    payment: {
      currency: 'USD',
      cashOnDeliveryEnabled: true,
    },
    shipping: {
      defaultShippingCost: 800,
      freeShippingThreshold: 7500,
      enableLocalPickup: true,
    },
    categories: [
      {
        name: 'Artisan Cheese',
        slug: 'artisan-cheese',
        description: 'Premium cheeses from around the world',
        backgroundColor: '#fee2e2', // Red-100
        buttonColor: '#dc2626',
        sortOrder: 1,
      },
      {
        name: 'Organic Produce',
        slug: 'organic-produce',
        description: 'Fresh organic fruits and vegetables',
        backgroundColor: '#dcfce7', // Green-100
        buttonColor: '#166534',
        sortOrder: 2,
      },
      {
        name: 'Specialty Items',
        slug: 'specialty-items',
        description: 'Exotic spices and gourmet ingredients',
        backgroundColor: '#fef3c7', // Amber-100
        buttonColor: '#d97706',
        sortOrder: 3,
      },
    ],
  },
  {
    templateName: 'fitness-hub',
    subdomain: 'fitness-hub-example',
    organizationName: 'Fitness Equipment Hub',
    theme: {
      primaryColor: '#dc2626', // Red-600 (energy, power)
      secondaryColor: '#ea580c', // Orange-600 (enthusiasm)
      fontFamily: 'Montserrat',
    },
    contact: {
      email: 'support@fitnesshub.com',
      phone: '+1-555-FITT',
      address: '987 Strength Avenue, Fitness District',
      businessHours: 'Mon-Fri: 6AM-9PM, Sat-Sun: 8AM-6PM',
    },
    payment: {
      currency: 'USD',
      cashOnDeliveryEnabled: true,
    },
    shipping: {
      defaultShippingCost: 1000,
      freeShippingThreshold: 15000,
      enableLocalPickup: true,
    },
    categories: [
      {
        name: 'Strength Training',
        slug: 'strength-training',
        description: 'Weights and resistance equipment',
        backgroundColor: '#fee2e2', // Red-100
        buttonColor: '#dc2626',
        sortOrder: 1,
      },
      {
        name: 'Cardio Equipment',
        slug: 'cardio-equipment',
        description: 'Treadmills, bikes, and more',
        backgroundColor: '#fed7aa', // Orange-200
        buttonColor: '#ea580c',
        sortOrder: 2,
      },
      {
        name: 'Yoga & Pilates',
        slug: 'yoga-pilates',
        description: 'Mats, blocks, and accessories',
        backgroundColor: '#f3f4f6', // Gray-100
        buttonColor: '#0a0a0a',
        sortOrder: 3,
      },
    ],
  },
  {
    templateName: 'pet-care',
    subdomain: 'pet-care-example',
    organizationName: 'Pet Care Supplies',
    theme: {
      primaryColor: '#2563eb', // Blue-600 (trust, caring)
      secondaryColor: '#f97316', // Orange-500 (playful)
      fontFamily: 'Nunito',
    },
    contact: {
      email: 'care@petcaresupplies.com',
      phone: '+1-555-PETS',
      address: '147 Paw Street, Pet Lovers District',
      businessHours: 'Mon-Sat: 9AM-7PM, Sun: 10AM-5PM',
    },
    payment: {
      currency: 'USD',
      cashOnDeliveryEnabled: true,
    },
    shipping: {
      defaultShippingCost: 500,
      freeShippingThreshold: 5000,
      enableLocalPickup: true,
    },
    categories: [
      {
        name: 'Dog Supplies',
        slug: 'dog-supplies',
        description: 'Everything for your canine companion',
        backgroundColor: '#dbeafe', // Blue-100
        buttonColor: '#2563eb',
        sortOrder: 1,
      },
      {
        name: 'Cat Supplies',
        slug: 'cat-supplies',
        description: 'All things feline',
        backgroundColor: '#fed7aa', // Orange-200
        buttonColor: '#f97316',
        sortOrder: 2,
      },
      {
        name: 'Pet Health',
        slug: 'pet-health',
        description: 'Vitamins, supplements, and care',
        backgroundColor: '#d1fae5', // Green-100
        buttonColor: '#16a34a',
        sortOrder: 3,
      },
    ],
  },
  {
    templateName: 'beauty-essentials',
    subdomain: 'beauty-essentials-example',
    organizationName: 'Beauty Essentials',
    theme: {
      primaryColor: '#e91e63', // Pink-600 (beauty, elegance)
      secondaryColor: '#f8bbd0', // Pink-100 (soft, feminine)
      fontFamily: 'Playfair Display',
    },
    contact: {
      email: 'hello@beautyessentials.com',
      phone: '+1-555-BEAUTY',
      address: '789 Cosmetics Avenue, Beauty District',
      businessHours: 'Mon-Sat: 10AM-8PM, Sun: 11AM-6PM',
    },
    payment: {
      currency: 'USD',
      cashOnDeliveryEnabled: true,
    },
    shipping: {
      defaultShippingCost: 600,
      freeShippingThreshold: 7500,
      enableLocalPickup: true,
    },
    categories: [
      {
        name: 'Skincare',
        slug: 'skincare',
        description: 'Premium skincare and moisturizers',
        backgroundColor: '#fce7f3', // Pink-100
        buttonColor: '#e91e63',
        sortOrder: 1,
      },
      {
        name: 'Makeup',
        slug: 'makeup',
        description: 'Lipsticks, eyeshadow, and foundation',
        backgroundColor: '#fde4ef', // Pink-50
        buttonColor: '#ff6090',
        sortOrder: 2,
      },
      {
        name: 'Fragrances',
        slug: 'fragrances',
        description: 'Elegant perfumes and body mists',
        backgroundColor: '#fef9f3', // Cream
        buttonColor: '#d81b60',
        sortOrder: 3,
      },
    ],
  },
];

// Standard pages for each template organization
const standardPages = [
  { type: 'home', slug: '/', title: 'Home', sortOrder: 1 },
  { type: 'products', slug: '/products', title: 'Products', sortOrder: 2 },
  { type: 'categories', slug: '/categories', title: 'Categories', sortOrder: 3 },
  { type: 'about', slug: '/about', title: 'About Us', sortOrder: 4 },
  { type: 'contact', slug: '/contact', title: 'Contact', sortOrder: 5 },
  { type: 'cart', slug: '/cart', title: 'Shopping Cart', sortOrder: 6 },
  { type: 'checkout', slug: '/checkout', title: 'Checkout', sortOrder: 7 },
];

/**
 * Seed templates into the database
 */
export async function seedTemplates(db: PostgresJsDatabase): Promise<Map<string, string>> {
  const templateIdMap = new Map<string, string>();

  for (const template of defaultTemplates) {
    // Check if template already exists
    const existing = await db
      .select()
      .from(templates)
      .where(eq(templates.name, template.name))
      .limit(1);

    if (existing.length > 0) {
      templateIdMap.set(template.name, existing[0].id);
      console.log(`Template '${template.name}' already exists, skipping...`);
      continue;
    }

    // Insert new template
    const [inserted] = await db.insert(templates).values(template).returning();
    templateIdMap.set(template.name, inserted.id);
    console.log(`Created template: ${template.name}`);
  }

  return templateIdMap;
}

/**
 * Seed template organizations with settings, pages, and categories
 */
export async function seedTemplateOrganizations(
  db: PostgresJsDatabase,
  templateIdMap: Map<string, string>
): Promise<void> {
  for (const config of templateConfigs) {
    const templateId = templateIdMap.get(config.templateName);
    if (!templateId) {
      console.warn(`Template '${config.templateName}' not found, skipping organization...`);
      continue;
    }

    // Check if organization already exists
    const existingOrg = await db
      .select()
      .from(organizations)
      .where(eq(organizations.subdomain, config.subdomain))
      .limit(1);

    let orgId: string;

    if (existingOrg.length > 0) {
      orgId = existingOrg[0].id;
      console.log(`Organization '${config.subdomain}' already exists, skipping...`);
      continue;
    } else {
      // Create template organization
      const orgData = {
        name: config.organizationName,
        slug: config.subdomain,
        subdomain: config.subdomain, // <-- CRITICAL: Enables subdomain lookup
        isTemplate: true,
        templateId: templateId,
        isActive: true,
        infrastructureStatus: 'pending' as const,
      };

      const [insertedOrg] = await db.insert(organizations).values(orgData).returning();
      orgId = insertedOrg.id;
      console.log(`Created template organization: ${config.subdomain}`);
    }

    // Create theme settings
    const existingTheme = await db
      .select()
      .from(themeSettings)
      .where(eq(themeSettings.organizationId, orgId))
      .limit(1);

    if (existingTheme.length === 0) {
      await db.insert(themeSettings).values({
        ...config.theme,
        organizationId: orgId,
      });
      console.log(`Created theme settings for: ${config.subdomain}`);
    }

    // Create contact settings
    const existingContact = await db
      .select()
      .from(contactSettings)
      .where(eq(contactSettings.organizationId, orgId))
      .limit(1);

    if (existingContact.length === 0) {
      await db.insert(contactSettings).values({
        ...config.contact,
        organizationId: orgId,
      });
      console.log(`Created contact settings for: ${config.subdomain}`);
    }

    // Create payment settings
    const existingPayment = await db
      .select()
      .from(paymentSettings)
      .where(eq(paymentSettings.organizationId, orgId))
      .limit(1);

    if (existingPayment.length === 0) {
      await db.insert(paymentSettings).values({
        ...config.payment,
        organizationId: orgId,
      });
      console.log(`Created payment settings for: ${config.subdomain}`);
    }

    // Create shipping settings
    const existingShipping = await db
      .select()
      .from(shippingSettings)
      .where(eq(shippingSettings.organizationId, orgId))
      .limit(1);

    if (existingShipping.length === 0) {
      await db.insert(shippingSettings).values({
        ...config.shipping,
        organizationId: orgId,
      });
      console.log(`Created shipping settings for: ${config.subdomain}`);
    }

    // Create standard pages
    for (const page of standardPages) {
      const existingPage = await db
        .select()
        .from(pages)
        .where(eq(pages.organizationId, orgId))
        .limit(100);

      const pageExists = existingPage.some((p) => p.slug === page.slug);

      if (!pageExists) {
        const pageData = {
          organizationId: orgId,
          type: page.type,
          slug: page.slug,
          title: page.title,
          isActive: true,
          sortOrder: page.sortOrder,
        };

        await db.insert(pages).values(pageData);
        console.log(`Created page '${page.type}' for: ${config.subdomain}`);
      }
    }

    // Create categories
    for (const category of config.categories) {
      const existingCategory = await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.organizationId, orgId))
        .limit(100);

      const categoryExists = existingCategory.some((c) => c.slug === category.slug);

      if (!categoryExists) {
        await db.insert(categoriesTable).values({
          organizationId: orgId,
          name: category.name,
          slug: category.slug,
          description: category.description,
          backgroundColor: category.backgroundColor,
          buttonColor: category.buttonColor,
          sortOrder: category.sortOrder,
        });
        console.log(`Created category '${category.name}' for: ${config.subdomain}`);
      }
    }

    console.log(`Completed setup for template organization: ${config.subdomain}\n`);
  }
}

/**
 * Main seed function for templates
 */
export async function seedTemplatesMain(db: PostgresJsDatabase): Promise<void> {
  console.log('Starting template seed...');

  try {
    // Seed templates
    console.log('\n--- Seeding Templates ---');
    const templateIdMap = await seedTemplates(db);

    // Seed template organizations (excluding playground)
    console.log('\n--- Seeding Template Organizations ---');
    await seedTemplateOrganizations(db, templateIdMap);

    console.log('\nTemplate seed completed successfully!');
  } catch (error) {
    console.error('Error seeding templates:', error);
    throw error;
  }
}

// Export for reference
export { defaultTemplates, templateConfigs, standardPages };
