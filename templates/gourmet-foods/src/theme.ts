/**
 * Gourmet Foods Template Theme Configuration
 *
 * Visual Identity:
 * - Primary: Rich Red #dc2626 (appetite stimulation, culinary passion)
 * - Secondary: Deep Green #166534 (fresh, organic, farm-to-table)
 * - Accent: Amber Gold #d97706 (premium gourmet appeal)
 * - Style: Gourmet, sophisticated, appetizing, premium
 * - Aesthetic: Luxury, premium, food-focused photography
 */

export const theme = {
  name: 'Gourmet Foods',
  slug: 'gourmet-foods',

  colors: {
    // Primary: Rich Red - Appetite stimulation, energy, passion for food
    primary: {
      DEFAULT: '#dc2626', // red-600
      light: '#ef4444',   // red-500
      dark: '#b91c1c',    // red-700
      foreground: '#ffffff',
    },

    // Secondary: Deep Green - Fresh ingredients, organic, farm-to-table
    secondary: {
      DEFAULT: '#166534', // green-800
      light: '#16a34a',   // green-600
      dark: '#14532d',    // green-900
      foreground: '#ffffff',
    },

    // Accent: Amber Gold - Premium gourmet appeal, artisanal
    accent: {
      DEFAULT: '#d97706', // amber-600
      light: '#f59e0b',   // amber-500
      dark: '#b45309',    // amber-700
      foreground: '#ffffff',
    },

    // Neutral palette - Clean, food-safe whites
    background: '#ffffff',
    surface: '#fafaf9',      // stone-50
    card: '#ffffff',
    foreground: '#1c1917',   // stone-900
    border: '#e7e5e4',       // stone-200
    input: '#f5f5f4',        // stone-100
    muted: '#f5f5f4',
    'muted-foreground': '#78716c', // stone-500

    // Semantic colors
    destructive: '#dc2626',
    'destructive-foreground': '#ffffff',

    // Gourmet-specific colors
    'gourmet-red': '#dc2626',
    'gourmet-green': '#166534',
    'gourmet-gold': '#d97706',
    'gourmet-cream': '#fefce8', // yellow-50 for premium feel
  },

  typography: {
    fonts: {
      // Playfair Display - Elegant serif for headings (gourmet aesthetic)
      display: '"Playfair Display", Georgia, serif',
      serif: '"Playfair Display", Georgia, serif',

      // Source Sans Pro - Clean, readable body text
      sans: '"Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    },

    sizes: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
    },

    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },

    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  spacing: {
    radius: {
      sm: '0.25rem',  // 4px - Subtle elegance
      md: '0.5rem',   // 8px
      lg: '0.75rem',  // 12px
      xl: '1rem',     // 16px
    },
  },

  aesthetic: {
    style: 'gourmet',
    mood: 'sophisticated',
    feel: 'premium',

    // Design guidelines
    guidelines: {
      images: 'High-quality food photography essential',
      colors: 'Rich, saturated product images',
      effects: 'Gold foil effects for premium items',
      cards: 'Recipe card styling for content',
      badges: '"Fresh" and "Organic" badge designs',
      photography: 'Food-focused, appetizing, professional',
    },

    // Component styling hints
    components: {
      buttons: 'Slightly rounded, premium feel',
      cards: 'Clean white with subtle shadows',
      badges: 'Gold/green for premium/organic',
      images: 'High-quality, well-lit food photography',
    },
  },

  features: {
    // Template-specific features
    recipeIntegration: true,
    originHighlighting: true,
    premiumPresentation: true,
    organicBadges: true,

    // UI features
    darkMode: false, // Clean white is essential for food
    animations: 'subtle', // Elegant, not distracting

    // Food-specific features
    ingredientHighlights: true,
    nutritionalInfo: true,
    allergenTags: true,
    seasonalBadges: true,
  },
};

export type Theme = typeof theme;

export default theme;
