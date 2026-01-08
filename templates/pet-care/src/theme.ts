/**
 * Pet Care Template Theme Configuration
 *
 * Visual Identity:
 * - Primary: Friendly Blue #2563eb (Blue-600)
 * - Secondary: Playful Orange #f97316 (Orange-500)
 * - Accent: Grass Green #16a34a (Green-600)
 * - Background: Soft sky (Blue-50 #f0f9ff)
 * - Font: Nunito (rounded, friendly)
 * - Style: Playful, friendly, caring, fun
 * - Aesthetic: Playful, approachable, rounded, paw-themed graphics
 */

export const petCareTheme = {
  name: 'pet-care',
  displayName: 'Pet Care',
  description: 'Playful and friendly theme for pet products and services',

  colors: {
    primary: {
      main: '#2563eb',      // Friendly Blue
      light: '#3b82f6',
      dark: '#1e40af',
      contrast: '#ffffff',
    },
    secondary: {
      main: '#f97316',      // Playful Orange
      light: '#fb923c',
      dark: '#ea580c',
      contrast: '#ffffff',
    },
    accent: {
      main: '#16a34a',      // Grass Green
      light: '#22c55e',
      dark: '#15803d',
      contrast: '#ffffff',
    },
    background: {
      default: '#f0f9ff',   // Soft sky (Blue-50)
      paper: '#ffffff',
      elevated: '#e0f2fe',  // Blue-100
    },
    text: {
      primary: '#1e293b',   // Slate-800 (friendly dark)
      secondary: '#475569', // Slate-600
      disabled: '#94a3b8',  // Slate-400
    },
    border: {
      light: '#cbd5e1',     // Slate-300
      medium: '#94a3b8',    // Slate-400
      dark: '#64748b',      // Slate-500
    },
  },

  typography: {
    fontFamily: {
      primary: '"Nunito", sans-serif',
      display: '"Nunito", sans-serif',
      mono: '"Courier New", monospace',
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
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },

  spacing: {
    borderRadius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
      full: '9999px',
    },
    padding: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
  },

  effects: {
    shadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      playful: '0 8px 16px -4px rgba(37, 99, 235, 0.2)', // Blue shadow
    },
    transition: {
      fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
      base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
      slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: '500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  components: {
    button: {
      borderRadius: '1rem',
      padding: {
        sm: '0.5rem 1rem',
        md: '0.75rem 1.5rem',
        lg: '1rem 2rem',
      },
    },
    card: {
      borderRadius: '1.5rem',
      padding: '1.5rem',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    input: {
      borderRadius: '0.75rem',
      padding: '0.75rem 1rem',
    },
  },

  patterns: {
    pawPrint: {
      size: {
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
      },
      color: 'rgba(37, 99, 235, 0.1)', // Light blue
    },
  },
};

export type PetCareTheme = typeof petCareTheme;

// CSS Variables for the theme
export const cssVariables = `
  :root {
    /* Primary Colors - Friendly Blue */
    --primary: 221 83% 53%;
    --primary-foreground: 0 0% 100%;

    /* Secondary Colors - Playful Orange */
    --secondary: 20 91% 54%;
    --secondary-foreground: 0 0% 100%;

    /* Accent Colors - Grass Green */
    --accent: 142 71% 45%;
    --accent-foreground: 0 0% 100%;

    /* Background Colors - Soft Sky */
    --background: 204 100% 97%;
    --foreground: 215 25% 27%;

    /* Card Colors */
    --card: 0 0% 100%;
    --card-foreground: 215 25% 27%;

    /* Popover Colors */
    --popover: 0 0% 100%;
    --popover-foreground: 215 25% 27%;

    /* Muted Colors */
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;

    /* Destructive Colors */
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    /* Border & Input */
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 221 83% 53%;

    /* Border Radius */
    --radius: 1rem;
  }

  .dark {
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
    --card: 222 47% 15%;
    --card-foreground: 210 40% 98%;
    --popover: 222 47% 15%;
    --popover-foreground: 210 40% 98%;
    --primary: 217 91% 60%;
    --primary-foreground: 222 47% 11%;
    --secondary: 24 100% 60%;
    --secondary-foreground: 222 47% 11%;
    --accent: 142 76% 36%;
    --accent-foreground: 210 40% 98%;
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    --destructive: 0 63% 31%;
    --destructive-foreground: 210 40% 98%;
    --border: 217 33% 17%;
    --input: 217 33% 17%;
    --ring: 217 91% 60%;
  }
`;
