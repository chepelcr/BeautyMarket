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
        // Artisan Crafts theme - Earth tones and natural colors
        primary: {
          DEFAULT: '#ea580c', // Terracotta (Orange-600)
          foreground: '#ffffff',
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c', // Primary
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        secondary: {
          DEFAULT: '#15803d', // Forest Green (Green-700)
          foreground: '#ffffff',
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d', // Secondary
          800: '#166534',
          900: '#14532d',
        },
        accent: {
          DEFAULT: '#ca8a04', // Golden Yellow (Yellow-600)
          foreground: '#ffffff',
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04', // Accent
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        background: '#fffbeb', // Natural canvas (Amber-50)
        foreground: '#292524', // Warm black (Stone-800)
        card: {
          DEFAULT: '#ffffff',
          foreground: '#292524',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#292524',
        },
        muted: {
          DEFAULT: '#fef3c7', // Amber-100
          foreground: '#57534e', // Stone-600
        },
        destructive: {
          DEFAULT: '#dc2626', // Red-600
          foreground: '#ffffff',
        },
        border: '#e7e5e4', // Stone-200
        input: '#e7e5e4',
        ring: '#ea580c', // Terracotta
      },
      borderRadius: {
        lg: '1rem',      // Rounded corners for organic feel
        md: '0.75rem',
        sm: '0.5rem',
        xl: '1.5rem',
        '2xl': '2rem',
      },
      fontFamily: {
        sans: ['Josefin Sans', 'sans-serif'],  // Headings - handcrafted feel
        serif: ['Merriweather', 'serif'],       // Body - elegant, readable
      },
      boxShadow: {
        'artisan': '0 4px 6px -1px rgba(234, 88, 12, 0.1), 0 2px 4px -1px rgba(234, 88, 12, 0.06)',
        'artisan-lg': '0 10px 15px -3px rgba(234, 88, 12, 0.1), 0 4px 6px -2px rgba(234, 88, 12, 0.05)',
      },
      backgroundImage: {
        'texture-paper': "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence baseFrequency=\"0.9\" numOctaves=\"3\" /%3E%3C/filter%3E%3Crect width=\"100\" height=\"100\" filter=\"url(%23noise)\" opacity=\"0.05\" /%3E%3C/svg%3E')",
        'gradient-artisan': 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fffbeb 100%)',
      },
    },
  },
  plugins: [],
}
