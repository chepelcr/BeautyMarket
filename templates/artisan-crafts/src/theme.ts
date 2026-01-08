/**
 * Artisan Crafts Template Theme Configuration
 *
 * Visual Identity:
 * - Colors: Terracotta #ea580c, Forest Green #15803d, Golden Yellow #ca8a04
 * - Background: Natural canvas (Amber-50 #fffbeb)
 * - Font: Merriweather (body) + Josefin Sans (headings)
 * - Style: Organic, handmade, artisanal, rustic
 * - Aesthetic: Organic, textured, warm, rounded corners
 */

export const theme = {
  name: 'Artisan Crafts',
  category: 'handmade-crafts',

  // Color palette
  colors: {
    primary: {
      main: '#ea580c',      // Terracotta
      light: '#fb923c',
      dark: '#c2410c',
      contrast: '#ffffff',
    },
    secondary: {
      main: '#15803d',      // Forest Green
      light: '#22c55e',
      dark: '#14532d',
      contrast: '#ffffff',
    },
    accent: {
      main: '#ca8a04',      // Golden Yellow
      light: '#facc15',
      dark: '#a16207',
      contrast: '#ffffff',
    },
    background: {
      main: '#fffbeb',      // Natural canvas
      surface: '#fef3c7',   // Cream paper
      card: '#ffffff',
    },
    text: {
      primary: '#292524',   // Warm black
      secondary: '#57534e', // Stone-600
      muted: '#78716c',     // Stone-500
    },
  },

  // Typography
  typography: {
    fontFamily: {
      heading: '"Josefin Sans", sans-serif',
      body: '"Merriweather", serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  // Spacing and layout
  spacing: {
    borderRadius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
      '2xl': '2rem',
      full: '9999px',
    },
    container: {
      maxWidth: '1280px',
      padding: '1rem',
    },
  },

  // Component styles
  components: {
    button: {
      borderRadius: '0.75rem',  // Rounded corners
      padding: {
        sm: '0.5rem 1rem',
        md: '0.75rem 1.5rem',
        lg: '1rem 2rem',
      },
      shadow: '0 4px 6px -1px rgba(234, 88, 12, 0.1)',
    },
    card: {
      borderRadius: '1rem',      // Organic rounded corners
      padding: '1.5rem',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e7e5e4',
    },
    input: {
      borderRadius: '0.75rem',
      padding: '0.75rem 1rem',
      border: '1px solid #e7e5e4',
    },
  },

  // Design elements
  elements: {
    // Hand-drawn style decorations
    decorative: {
      useHandDrawn: true,
      useTextures: true,
      useBadges: true,
    },
    // Natural textures
    textures: {
      paper: true,
      canvas: true,
      wood: false,
    },
    // Special effects
    effects: {
      shadows: 'soft',
      transitions: 'smooth',
      animations: 'subtle',
    },
  },

  // Layout preferences
  layout: {
    style: 'organic',         // organic | modern | classic
    grid: {
      columns: {
        mobile: 1,
        tablet: 2,
        desktop: 3,
      },
      gap: '1.5rem',
    },
    hero: {
      style: 'natural',       // Natural imagery with craft elements
      overlay: 'warm',        // Warm overlay
    },
  },

  // Product display
  product: {
    cardStyle: 'rounded',     // Rounded corners
    imageStyle: 'natural',    // Natural product photography
    badgeStyle: 'stamp',      // Stamp-style badges
    priceStyle: 'prominent',
  },

  // Navigation
  navigation: {
    style: 'sticky',
    background: 'transparent',
    shadow: 'subtle',
  },
} as const;

export type Theme = typeof theme;

export default theme;
