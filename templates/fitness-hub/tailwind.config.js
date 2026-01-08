/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Fitness Hub Theme: Energetic Red & Bold Orange
        // Based on TEMPLATE_COLOR_RESEARCH.md

        // Semantic color tokens referenced from CSS variables
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        // Brand color scales for explicit control
        // Energetic Red (Primary)
        red: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626', // Primary
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Bold Orange (Secondary)
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c', // Secondary
          700: '#c2410c',
          800: '#9a3412',
        },
        // Deep Black (Accent)
        gray: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e5e5e5',
          800: '#1f2937',
          900: '#0a0a0a', // Near black accent
        },
      },
      borderRadius: {
        lg: 'calc(var(--radius) + 0.5rem)',
        md: 'calc(var(--radius) + 0.25rem)',
        sm: 'calc(var(--radius) - 0.125rem)',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'], // Bold, athletic
        display: ['Montserrat', 'sans-serif'],
      },
      fontWeight: {
        'extra-bold': '800',
        'black': '900',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
}
