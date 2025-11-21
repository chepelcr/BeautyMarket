import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

// Subdomain detection for multi-app serving
const BASE_DOMAIN = process.env.BASE_DOMAIN || 'jmarkets.jcampos.dev';

function getSubdomain(hostname: string): string | null {
  // Handle localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }

  // Handle .localhost development (e.g., mi-tienda.localhost)
  if (hostname.endsWith('.localhost')) {
    const subdomain = hostname.replace('.localhost', '');
    return subdomain || null;
  }

  // Handle production domains
  const baseDomainParts = BASE_DOMAIN.split('.');
  const hostnameParts = hostname.split('.');

  // If hostname has more parts than base domain, extract subdomain
  if (hostnameParts.length > baseDomainParts.length) {
    const subdomainParts = hostnameParts.slice(0, hostnameParts.length - baseDomainParts.length);
    const subdomain = subdomainParts.join('.');

    // Verify the rest matches base domain
    const remainingParts = hostnameParts.slice(hostnameParts.length - baseDomainParts.length);
    if (remainingParts.join('.') === BASE_DOMAIN) {
      return subdomain;
    }
  }

  return null;
}

// Port for store app in development (localhost:STORE_PORT -> store app)
const STORE_PORT = process.env.STORE_PORT || '9000';

export function serveStatic(app: Express) {
  const storeDistPath = path.resolve(import.meta.dirname, "public");
  const landingDistPath = path.resolve(import.meta.dirname, "landing");

  if (!fs.existsSync(storeDistPath)) {
    throw new Error(
      `Could not find the store build directory: ${storeDistPath}, make sure to build the client first`,
    );
  }

  const hasLandingApp = fs.existsSync(landingDistPath);

  // Determine if request should go to store app
  function shouldServeStore(req: express.Request): boolean {
    const hostname = req.hostname || req.headers.host?.split(':')[0] || 'localhost';
    const port = req.headers.host?.split(':')[1] || '';

    // Port-based routing for local development (e.g., localhost:9000 -> store)
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && port === STORE_PORT) {
      return true;
    }

    // Subdomain-based routing for production
    const subdomain = getSubdomain(hostname);
    return !!subdomain;
  }

  // Middleware to serve static files based on subdomain/port
  app.use((req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }

    // Determine which static directory to use
    const distPath = shouldServeStore(req) ? storeDistPath : (hasLandingApp ? landingDistPath : storeDistPath);

    // Check if file exists in the appropriate directory
    const filePath = path.join(distPath, req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return res.sendFile(filePath);
    }

    next();
  });

  // Fallback to index.html for SPA routing
  app.use("*", (req, res) => {
    // Skip API routes
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/health')) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (shouldServeStore(req)) {
      // Serve store app
      res.sendFile(path.resolve(storeDistPath, "index.html"));
    } else {
      // Serve landing app if available, otherwise store app
      if (hasLandingApp) {
        res.sendFile(path.resolve(landingDistPath, "index.html"));
      } else {
        res.sendFile(path.resolve(storeDistPath, "index.html"));
      }
    }
  });
}
