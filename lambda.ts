import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { registerRoutes } from './server/routes';

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'Accept'
  ]
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for Lambda
app.set('trust proxy', true);

// Register routes
let routesInitialized = false;

async function initializeRoutes() {
  if (!routesInitialized) {
    await registerRoutes(app);
    routesInitialized = true;
  }
}

// Lambda handler
export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // Initialize routes if not already done
  await initializeRoutes();

  // Handle preflight OPTIONS requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, Accept',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }

  return new Promise((resolve, reject) => {
    // Create mock request and response objects
    const req: any = {
      method: event.httpMethod,
      url: event.path + (event.queryStringParameters ? '?' + new URLSearchParams(event.queryStringParameters).toString() : ''),
      headers: {
        ...event.headers,
        'x-forwarded-for': event.requestContext?.identity?.sourceIp || '',
        'user-agent': event.headers?.['User-Agent'] || event.headers?.['user-agent'] || ''
      },
      body: event.body || '',
      ip: event.requestContext?.identity?.sourceIp || '',
      connection: {
        remoteAddress: event.requestContext?.identity?.sourceIp || ''
      },
      get: function(headerName: string) {
        return this.headers[headerName.toLowerCase()];
      }
    };

    // Parse JSON body if content-type is application/json
    if (event.body && event.headers?.['content-type']?.includes('application/json')) {
      try {
        req.body = JSON.parse(event.body);
      } catch (e) {
        req.body = event.body;
      }
    }

    const res: any = {
      statusCode: 200,
      headers: {},
      body: '',
      ended: false,
      status: function(code: number) {
        this.statusCode = code;
        return this;
      },
      json: function(data: any) {
        this.headers['Content-Type'] = 'application/json';
        this.body = JSON.stringify(data);
        this.end();
        return this;
      },
      send: function(data: any) {
        if (typeof data === 'object') {
          this.headers['Content-Type'] = 'application/json';
          this.body = JSON.stringify(data);
        } else {
          this.body = data;
        }
        this.end();
        return this;
      },
      set: function(name: string, value: string) {
        this.headers[name] = value;
        return this;
      },
      setHeader: function(name: string, value: string) {
        this.headers[name] = value;
        return this;
      },
      getHeader: function(name: string) {
        return this.headers[name];
      },
      cookie: function(name: string, value: string, options: any = {}) {
        const cookieValue = `${name}=${value}${options.httpOnly ? '; HttpOnly' : ''}${options.secure ? '; Secure' : ''}${options.sameSite ? `; SameSite=${options.sameSite}` : ''}${options.maxAge ? `; Max-Age=${options.maxAge / 1000}` : ''}`;
        this.headers['Set-Cookie'] = cookieValue;
        return this;
      },
      end: function() {
        if (!this.ended) {
          this.ended = true;
          
          // Add CORS headers
          this.headers['Access-Control-Allow-Origin'] = '*';
          this.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
          this.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-API-Key, Accept';
          
          resolve({
            statusCode: this.statusCode,
            headers: this.headers,
            body: this.body
          });
        }
        return this;
      },
      sendStatus: function(code: number) {
        this.statusCode = code;
        this.body = '';
        this.end();
        return this;
      }
    };

    // Add query and params
    req.query = event.queryStringParameters || {};
    req.params = event.pathParameters || {};

    // Handle the request
    try {
      // Find matching route and execute
      const router = (app as any)._router;
      if (router && router.handle) {
        router.handle(req, res, (err: any) => {
          if (err) {
            res.status(500).json({ error: 'Internal server error', message: err.message });
          } else {
            // If no route matched, return 404
            if (!res.ended) {
              res.status(404).json({ error: 'Not found' });
            }
          }
        });
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    } catch (error: any) {
      console.error('Lambda handler error:', error);
      if (!res.ended) {
        res.status(500).json({ 
          error: 'Internal server error', 
          message: error.message 
        });
      }
    }

    // Timeout handling
    setTimeout(() => {
      if (!res.ended) {
        res.status(408).json({ error: 'Request timeout' });
      }
    }, 25000); // 25 second timeout (5 seconds before Lambda timeout)
  });
};