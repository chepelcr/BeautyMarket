import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  components,
  type ComponentConfig,
} from '../entities';

// Default components with their configurations
const defaultComponents = [
  {
    type: 'hero',
    displayName: 'Hero Banner',
    description: 'Hero banner with title, subtitle, and call-to-action button',
    isSystem: true,
    defaultConfig: {
      fields: [
        'title',
        'subtitle',
        'ctaText',
        'ctaLink',
        'backgroundImage',
        'alignment',
      ],
    } as ComponentConfig,
  },
  {
    type: 'product-grid',
    displayName: 'Product Grid',
    description: 'Grid layout for displaying products with filtering options',
    isSystem: true,
    defaultConfig: {
      fields: [
        'title',
        'columns',
        'itemsPerPage',
        'showFilters',
        'showSorting',
        'categoryFilter',
      ],
    } as ComponentConfig,
  },
  {
    type: 'category-showcase',
    displayName: 'Category Showcase',
    description: 'Display product categories with images and descriptions',
    isSystem: true,
    defaultConfig: {
      fields: [
        'title',
        'subtitle',
        'layout',
        'categoryIds',
        'showDescription',
        'columns',
      ],
    } as ComponentConfig,
  },
  {
    type: 'text-block',
    displayName: 'Text Block',
    description: 'Rich text content block with formatting support',
    isSystem: true,
    defaultConfig: {
      fields: [
        'title',
        'content',
        'alignment',
        'backgroundColor',
        'textColor',
        'padding',
      ],
    } as ComponentConfig,
  },
  {
    type: 'contact-form',
    displayName: 'Contact Form',
    description: 'Contact form with customizable fields',
    isSystem: true,
    defaultConfig: {
      fields: [
        'title',
        'subtitle',
        'fields',
        'submitButtonText',
        'successMessage',
        'recipientEmail',
      ],
    } as ComponentConfig,
  },
  {
    type: 'gallery',
    displayName: 'Image Gallery',
    description: 'Image gallery with lightbox and multiple layout options',
    isSystem: true,
    defaultConfig: {
      fields: [
        'title',
        'images',
        'layout',
        'columns',
        'showCaptions',
        'enableLightbox',
      ],
    } as ComponentConfig,
  },
  {
    type: 'features-list',
    displayName: 'Features List',
    description: 'List of features with icons and descriptions',
    isSystem: true,
    defaultConfig: {
      fields: [
        'title',
        'subtitle',
        'features',
        'layout',
        'iconStyle',
        'columns',
      ],
    } as ComponentConfig,
  },
];

/**
 * Seed components into the database
 */
export async function seedComponents(db: PostgresJsDatabase): Promise<Map<string, string>> {
  const componentIdMap = new Map<string, string>();

  for (const component of defaultComponents) {
    // Check if component already exists
    const existing = await db
      .select()
      .from(components)
      .where(eq(components.type, component.type))
      .limit(1);

    if (existing.length > 0) {
      componentIdMap.set(component.type, existing[0].id);
      console.log(`Component '${component.type}' already exists, skipping...`);
      continue;
    }

    // Insert new component
    const [inserted] = await db.insert(components).values(component).returning();
    componentIdMap.set(component.type, inserted.id);
    console.log(`Created component: ${component.type}`);
  }

  return componentIdMap;
}

/**
 * Main seed function for components
 */
export async function seedComponentsMain(db: PostgresJsDatabase): Promise<void> {
  console.log('Starting component seed...');

  try {
    console.log('\n--- Seeding Components ---');
    await seedComponents(db);

    console.log('\nComponent seed completed successfully!');
  } catch (error) {
    console.error('Error seeding components:', error);
    throw error;
  }
}

// Export default components for reference
export { defaultComponents };
