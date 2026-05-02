import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: '../../dist/templates/pollo-porteno',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['wouter'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-amplify': ['aws-amplify'],
        },
      },
    },
  },
  server: {
    port: 3009,
  },
});
