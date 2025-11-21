import 'dotenv/config';
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";
import { ExpressAppConfig } from './config/ExpressAppConfig';

const appConfig = new ExpressAppConfig();
const app = appConfig.getApp();

(async () => {
  const server = createServer(app);

  // Setup Vite or static serving based on environment
  if (!appConfig.isRunningInLambda()) {
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
  }

  // Start server (only if not running in Lambda)
  if (!appConfig.isRunningInLambda()) {
    const port = parseInt(process.env.PORT || '5000', 10);
    const storePort = parseInt(process.env.STORE_PORT || '9000', 10);

    // Main server (landing on localhost, store on subdomains)
    server.listen(port, "localhost", () => {
      log(`🚀 Server running on http://localhost:${port}`);
      log(`📚 API Documentation: http://localhost:${port}/api-docs`);
      log(`🏥 Health Check: http://localhost:${port}/health`);
    });

    // Additional port for store app in development
    if (process.env.NODE_ENV !== 'production') {
      const storeServer = createServer(app);
      storeServer.listen(storePort, "localhost", () => {
        log(`🏪 Store app running on http://localhost:${storePort}`);
      });
    }
  }
})();
