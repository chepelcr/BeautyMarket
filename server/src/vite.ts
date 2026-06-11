import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { nanoid } from "nanoid";

// The SPA dev middleware below only exists for the monorepo (it serves the
// legacy dashboard/store apps). In the standalone tsuru-platform-api checkout
// the monorepo-root vite.config does not exist, so both setupVite and
// serveStatic degrade to API-only mode instead of crashing.
const MONOREPO_VITE_CONFIG = "../../vite.config";

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
  let createViteServer: typeof import("vite").createServer;
  let createLogger: typeof import("vite").createLogger;
  let viteConfig: Record<string, unknown>;
  try {
    ({ createServer: createViteServer, createLogger } = await import("vite"));
    viteConfig = (await import(/* @vite-ignore */ MONOREPO_VITE_CONFIG)).default;
  } catch {
    log("vite / monorepo vite.config not available — running in API-only mode");
    return;
  }
  const viteLogger = createLogger();

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

    // Skip API routes
    if (url.startsWith('/api') || url.startsWith('/health')) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "..",
        "dashboard",
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
const BASE_DOMAIN = process.env.BASE_DOMAIN || 'j-markets.jcampos.dev';

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
    log(
      `store build directory not found (${storeDistPath}) — running in API-only mode`,
    );
    return;
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
