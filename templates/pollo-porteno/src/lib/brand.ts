/**
 * Pollo Porteño brand configuration.
 *
 * These values are used as the default content for the landing page.
 * When the storefront is connected to a real organization in the
 * markets API, the values returned by `storefrontApi.getOrganization`,
 * `getContact` and `getTheme` will override these defaults.
 */

export const BRAND = {
  name: 'Pollo Porteño',
  tagline: 'Auténtico sabor a la parrilla',
  description:
    'Pollo asado al carbón, recetas caseras y guarniciones que saben a hogar. ' +
    'Una tradición porteña que se siente desde el primer bocado.',
  owner: 'María Leticia Vega',
  ownerRole: 'Propietaria',
  contact: {
    facebookUrl:
      'https://www.facebook.com/photo/?fbid=534237635277587&set=a.534237618610922',
    googleMapsUrl: 'https://maps.app.goo.gl/oK8JHCuUQuXiGXJw9',
    phone: '',
    whatsapp: '',
    email: '',
  },
  hours: [
    { day: 'Lunes a Viernes', value: '11:00 a.m. – 9:00 p.m.' },
    { day: 'Sábado y Domingo', value: '11:00 a.m. – 10:00 p.m.' },
  ],
  highlights: [
    {
      title: 'Pollo asado al carbón',
      description:
        'Marinado por horas y cocinado lentamente sobre brasas para un sabor inconfundible.',
      emoji: '🔥',
    },
    {
      title: 'Guarniciones caseras',
      description:
        'Papas, ensalada fresca, tortillas y salsas preparadas todos los días.',
      emoji: '🥗',
    },
    {
      title: 'Recetas de familia',
      description:
        'Sazón porteña con la calidez de una tradición que pasa de generación en generación.',
      emoji: '👩‍🍳',
    },
  ],
  fallbackMenu: [
    {
      product_id: 'fallback-1',
      name: 'Pollo entero asado',
      description: 'Pollo entero a la leña con guarnición a elección.',
      price: 7500,
      category_id: 'parrilla',
      category: { category_id: 'parrilla', name: 'Parrilla' },
      image_url: null,
      status: 1,
    },
    {
      product_id: 'fallback-2',
      name: 'Medio pollo asado',
      description: 'Medio pollo a la leña con guarnición a elección.',
      price: 4200,
      category_id: 'parrilla',
      category: { category_id: 'parrilla', name: 'Parrilla' },
      image_url: null,
      status: 1,
    },
    {
      product_id: 'fallback-3',
      name: 'Cuarto de pollo',
      description: 'Cuarto de pollo asado, ideal para una persona.',
      price: 2500,
      category_id: 'parrilla',
      category: { category_id: 'parrilla', name: 'Parrilla' },
      image_url: null,
      status: 1,
    },
    {
      product_id: 'fallback-4',
      name: 'Combo familiar',
      description: 'Pollo entero + papas + ensalada + tortillas + 2 salsas.',
      price: 9800,
      category_id: 'combos',
      category: { category_id: 'combos', name: 'Combos' },
      image_url: null,
      status: 1,
    },
    {
      product_id: 'fallback-5',
      name: 'Papas a la francesa',
      description: 'Porción generosa, doradas y crujientes.',
      price: 1800,
      category_id: 'guarniciones',
      category: { category_id: 'guarniciones', name: 'Guarniciones' },
      image_url: null,
      status: 1,
    },
    {
      product_id: 'fallback-6',
      name: 'Ensalada fresca',
      description: 'Lechuga, tomate, pepino y aderezo de la casa.',
      price: 1500,
      category_id: 'guarniciones',
      category: { category_id: 'guarniciones', name: 'Guarniciones' },
      image_url: null,
      status: 1,
    },
  ],
} as const;
