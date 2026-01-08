/**
 * Vintage Fashion Theme Configuration
 *
 * Design System based on vintage clothing aesthetic:
 * - Primary: Burgundy #881337 (Luxury, nostalgia, timeless)
 * - Secondary: Mustard #eab308 (Retro 60s-70s, warm)
 * - Accent: Dusty Rose #f43f5e (Romantic, feminine)
 * - Background: Warm Cream #fffbeb (Vintage paper)
 *
 * Typography:
 * - Headings: Playfair Display (elegant serif)
 * - Body: Lora (classic readable serif)
 */

export const vintageTheme = {
  name: 'vintage-fashion',
  displayName: 'Vintage Fashion Co.',

  colors: {
    // Primary palette
    primary: {
      main: '#881337',      // Burgundy (Rose-900)
      light: '#be123c',     // Rose-700
      dark: '#4c0519',      // Rose-950
      contrast: '#fffbeb',  // Cream-50
    },

    // Secondary palette
    secondary: {
      main: '#eab308',      // Mustard (Yellow-500)
      light: '#fde047',     // Yellow-300
      dark: '#a16207',      // Yellow-700
      contrast: '#881337',  // Burgundy
    },

    // Accent palette
    accent: {
      main: '#f43f5e',      // Dusty Rose (Rose-500)
      light: '#fb7185',     // Rose-400
      dark: '#e11d48',      // Rose-600
      contrast: '#fffbeb',  // Cream-50
    },

    // Neutral palette
    background: '#fffbeb',  // Warm cream
    surface: '#fef3c7',     // Cream-100
    border: '#fde68a',      // Cream-200
    text: {
      primary: '#3f3f46',   // Zinc-700 (warm dark)
      secondary: '#71717a', // Zinc-500
      disabled: '#a1a1aa',  // Zinc-400
    },

    // Status colors
    success: '#15803d',     // Green-700
    error: '#dc2626',       // Red-600
    warning: '#d97706',     // Amber-600
    info: '#2563eb',        // Blue-600
  },

  typography: {
    // Font families
    fonts: {
      heading: '"Playfair Display", Georgia, serif',
      body: '"Lora", Georgia, serif',
      sans: '"Inter", system-ui, sans-serif',
    },

    // Font sizes (in rem)
    sizes: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
    },

    // Font weights
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },

    // Line heights
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },

  spacing: {
    // Spacing scale (in rem)
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
  },

  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    full: '9999px',
  },

  shadows: {
    vintage: '0 2px 8px rgba(136, 19, 55, 0.15)',
    vintageLg: '0 4px 16px rgba(136, 19, 55, 0.2)',
    vintageXl: '0 8px 24px rgba(136, 19, 55, 0.25)',
  },

  effects: {
    // Vintage-specific effects
    sepia: 'sepia(0.3) contrast(1.1) brightness(1.05)',
    warmFilter: 'sepia(0.1) saturate(1.1)',
    vintageTexture: `url('data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.05" /%3E%3C/svg%3E')`,
  },

  breakpoints: {
    // Responsive breakpoints
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  zIndex: {
    // Z-index scale
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

export type VintageTheme = typeof vintageTheme;

// Type-safe color getter
export function getColor(path: string): string {
  const keys = path.split('.');
  let value: any = vintageTheme.colors;

  for (const key of keys) {
    value = value?.[key];
  }

  return typeof value === 'string' ? value : '';
}

// Example usage:
// getColor('primary.main') => '#881337'
// getColor('text.primary') => '#3f3f46'
