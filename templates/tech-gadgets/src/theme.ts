/**
 * Tech Gadgets Template Theme Configuration
 *
 * Visual Identity:
 * - Primary: Dark Blue #1e3a8a (trust, innovation, technology)
 * - Secondary: Cyan #06b6d4 (modern, cutting-edge, digital)
 * - Accent: Electric Blue #3b82f6 (vibrant, tech-forward)
 * - Background: Dark mode by default (Slate-900 #0f172a)
 * - Font: Roboto (geometric, tech-friendly)
 * - Style: Sleek, futuristic, high-contrast, minimal
 */

export const techGadgetsTheme = {
  name: 'tech-gadgets',
  displayName: 'Tech Gadgets',

  // Color palette
  colors: {
    // Primary colors
    primary: '#1e3a8a',        // Blue-900 - Deep tech blue
    primaryLight: '#3b82f6',   // Blue-500 - Electric blue
    primaryDark: '#1e40af',    // Blue-800 - Darker blue

    // Secondary colors
    secondary: '#06b6d4',      // Cyan-500 - Modern cyan
    secondaryLight: '#22d3ee', // Cyan-400 - Bright cyan
    secondaryDark: '#0891b2',  // Cyan-600 - Deep cyan

    // Accent colors
    accent: '#3b82f6',         // Blue-500 - Electric blue
    accentLight: '#60a5fa',    // Blue-400 - Bright blue
    accentDark: '#2563eb',     // Blue-600 - Deep electric

    // Dark mode backgrounds (default)
    background: '#0f172a',     // Slate-900 - Main background
    surface: '#1e293b',        // Slate-800 - Raised surfaces
    card: '#334155',           // Slate-700 - Card backgrounds

    // Text colors
    textPrimary: '#f1f5f9',    // Slate-100 - Primary text (light)
    textSecondary: '#cbd5e1',  // Slate-300 - Secondary text
    textMuted: '#94a3b8',      // Slate-400 - Muted text
    textDark: '#0f172a',       // Slate-900 - Dark text (for light backgrounds)

    // Borders and dividers
    border: '#475569',         // Slate-600 - Borders
    borderLight: '#64748b',    // Slate-500 - Lighter borders

    // Status colors
    success: '#10b981',        // Green-500
    warning: '#f59e0b',        // Amber-500
    error: '#ef4444',          // Red-500
    info: '#06b6d4',           // Cyan-500
  },

  // Typography
  typography: {
    fontFamily: {
      primary: 'Roboto, system-ui, sans-serif',
      mono: 'Roboto Mono, monospace',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 700,
      black: 900,
    },
  },

  // Spacing & Layout
  layout: {
    borderRadius: {
      sm: '0.125rem',  // Sharp, minimal
      md: '0.25rem',
      lg: '0.5rem',
      xl: '0.75rem',
    },
    container: {
      maxWidth: '1280px',
      padding: '1rem',
    },
  },

  // Effects
  effects: {
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.4)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.6)',
      glow: '0 0 20px rgba(6, 182, 212, 0.4)', // Cyan glow effect
    },
    transition: {
      fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
      normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
      slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Component-specific styles
  components: {
    button: {
      primary: {
        bg: '#1e3a8a',
        hover: '#1e40af',
        text: '#f1f5f9',
      },
      secondary: {
        bg: '#06b6d4',
        hover: '#0891b2',
        text: '#0f172a',
      },
      accent: {
        bg: '#3b82f6',
        hover: '#2563eb',
        text: '#f1f5f9',
      },
    },
    card: {
      bg: '#334155',
      border: '#475569',
      hover: '#475569',
    },
    navbar: {
      bg: '#1e293b',
      border: '#334155',
    },
  },

  // Dark mode settings
  darkMode: {
    enabled: true,
    default: true, // Tech template defaults to dark mode
  },

  // Template metadata
  meta: {
    category: 'technology',
    description: 'Modern tech aesthetic with dark mode, blue/cyan accents, and sleek design',
    features: [
      'Dark mode by default',
      'Sharp, minimal borders',
      'Tech-inspired iconography',
      'High contrast for readability',
      'Futuristic animations',
      'Product spec displays',
    ],
  },
} as const;

export type TechGadgetsTheme = typeof techGadgetsTheme;

export default techGadgetsTheme;
