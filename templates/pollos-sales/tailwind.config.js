/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E8620A",
          dark: "#C4500A",
          foreground: "#ffffff",
        },
        surface: {
          DEFAULT: "#1C1C1C",
          high: "#242424",
          border: "#2E2E2E",
        },
        background: "#111111",
        foreground: "#FFFFFF",
        muted: {
          DEFAULT: "#888888",
          foreground: "#444444",
        },
        success: { DEFAULT: "#2ECC71", dim: "#2ECC7115" },
        warning: { DEFAULT: "#F1C40F", dim: "#F1C40F15" },
        destructive: { DEFAULT: "#E74C3C", dim: "#E74C3C15" },
        border: "#2E2E2E",
        input: "#242424",
        ring: "#E8620A",
        card: { DEFAULT: "#1C1C1C", foreground: "#FFFFFF" },
      },
      fontFamily: {
        sans: ["'Barlow Condensed'", "'Arial Narrow'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
};
