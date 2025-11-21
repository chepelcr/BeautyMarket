import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { setupRoutes } from '../routes';
import { setupSwagger } from './swagger';
import { APP_CONFIG } from './app';

export class ExpressAppConfig {
  private app: Express;
  private isLambda: boolean;

  constructor() {
    this.isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
    this.app = this._createApp();
    this._configureMiddleware();
    this._configureRoutes();
    this._configureErrorHandler();
  }

  private _createApp(): Express {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    return app;
  }

  private _configureMiddleware(): void {
    // CORS configuration
    this.app.use(cors({
      origin: (origin: string | undefined, callback: (arg0: Error | null, arg1: boolean | undefined) => void) => {
        const allowedOrigins = this._getAllowedOrigins();

        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // Allow Capacitor origins (starts with capacitor:// or ionic://)
        if (origin.startsWith('capacitor://') || origin.startsWith('ionic://')) {
          return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'), undefined);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
      exposedHeaders: ['X-Page-Number', 'X-Page-Size', 'X-Total-Elements', 'X-Total-Pages'],
      maxAge: 600
    }));

    // Request logging middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      const path = req.path;
      let capturedJsonResponse: Record<string, any> | undefined = undefined;

      const originalResJson = res.json;
      res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
      };

      res.on('finish', () => {
        const duration = Date.now() - start;
        if (path.startsWith('/api')) {
          let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
          if (capturedJsonResponse) {
            logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          }

          if (logLine.length > 80) {
            logLine = logLine.slice(0, 79) + '…';
          }

          console.log(logLine);
        }
      });

      next();
    });
  }

  private _configureRoutes(): void {
    // Setup Swagger documentation
    setupSwagger(this.app);

    // Setup API routes
    setupRoutes(this.app);
  }

  private _configureErrorHandler(): void {
    this.app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || 'Internal Server Error';

      console.error(`❌ ${req.method} ${req.path} - ${status} ${message}`);
      console.error(err.stack || err);

      res.status(status).json({ message });
    });
  }

  private _getAllowedOrigins(): string[] {
    const defaultOrigins = [...APP_CONFIG.ALLOWED_ORIGINS];

    /*const cloudfrontUrl = APP_CONFIG.VITE_CLOUDFRONT_URL;
    if (cloudfrontUrl) {
      defaultOrigins.push(cloudfrontUrl);
    }*/

    return defaultOrigins;
  }


  public getApp(): Express {
    return this.app;
  }

  public isRunningInLambda(): boolean {
    return this.isLambda;
  }
}
