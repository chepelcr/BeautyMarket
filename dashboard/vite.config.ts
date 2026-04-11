import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "@radix-ui/react-context": path.resolve(__dirname, "node_modules/@radix-ui/react-context"),
      "@radix-ui/react-tooltip": path.resolve(__dirname, "node_modules/@radix-ui/react-tooltip"),
      "@radix-ui/react-popover": path.resolve(__dirname, "node_modules/@radix-ui/react-popover"),
      "@radix-ui/react-alert-dialog": path.resolve(__dirname, "node_modules/@radix-ui/react-alert-dialog"),
    },
    dedupe: ['react', 'react-dom', '@radix-ui/react-context', '@radix-ui/react-popover', '@radix-ui/react-alert-dialog'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-hook-form',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-toast',
      '@radix-ui/react-label',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
      '@radix-ui/react-accordion',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-avatar',
      '@radix-ui/react-separator',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-popover',
      '@radix-ui/react-switch',
      '@radix-ui/react-radio-group',
    ],
  },
  build: {
    outDir: path.resolve(__dirname, "../dist/dashboard"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['wouter'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
        },
      },
    },
    copyPublicDir: true,
  },
  server: {
    port: 3002,
    strictPort: true,
  },
});
