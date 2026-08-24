import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

const CONFIG_PATH = path.resolve(__dirname, 'public', 'config.json');

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'pos-landing-config-api',
      configureServer(server) {
        server.middlewares.use('/api/config', (req, res, next) => {
          if (req.method === 'GET') {
            try {
              const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(raw);
            } catch {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Could not read config.json' }));
            }
            return;
          }
          if (req.method === 'POST') {
            const host = req.headers['host'] ?? '';
            const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.endsWith('.local');
            if (!isLocal) {
              res.statusCode = 403;
              res.end(JSON.stringify({ error: 'Forbidden' }));
              return;
            }
            let body = '';
            req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                fs.writeFileSync(CONFIG_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: true }));
              } catch {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
              }
            });
            return;
          }
          if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.statusCode = 204;
            res.end();
            return;
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../../dist/pos-landing'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':  ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-icons':  ['lucide-react'],
          'vendor-ui':     ['clsx', 'tailwind-merge'],
        },
      },
    },
  },
  server: {
    port: 5180,
  },
});
