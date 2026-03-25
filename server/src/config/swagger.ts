import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';
import path from 'path';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'JMarkets API Documentation',
      version: '1.0.0',
      description: 'Multi-tenant marketplace platform API with CMS, authentication, RBAC, and auto-deployment',
      contact: {
        name: 'JMarkets Support',
        url: 'https://j-markets.jcampos.dev'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://markets-api.jcampos.dev'
          : process.env.REPLIT_DOMAINS
            ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
            : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production API' : 'Development API'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string', nullable: true },
            lastName: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['admin', 'user'], default: 'admin' },
            isActive: { type: 'boolean', default: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number', minimum: 0 },
            categoryId: { type: 'string', format: 'uuid' },
            imageUrl: { type: 'string', nullable: true },
            isActive: { type: 'boolean', default: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            backgroundColor: { type: 'string' },
            buttonColor: { type: 'string' },
            image1Url: { type: 'string', nullable: true },
            image2Url: { type: 'string', nullable: true },
            isActive: { type: 'boolean', default: true },
            sortOrder: { type: 'number', default: 0 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            customerName: { type: 'string' },
            customerPhone: { type: 'string' },
            provincia: { type: 'string' },
            canton: { type: 'string' },
            distrito: { type: 'string' },
            address: { type: 'string' },
            deliveryMethod: { type: 'string', enum: ['correos', 'uber-flash', 'personal'] },
            items: { type: 'string' },
            total: { type: 'number', minimum: 0 },
            status: { type: 'string', default: 'pending' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  apis: [
    path.join(process.cwd(), 'server/src/controllers/*.ts'),
    path.join(process.cwd(), 'server/src/controllers/*.js')
  ],
};

export function setupSwagger(app: Express) {
  // In Lambda, use pre-generated spec; in dev, generate dynamically
  let specs: any;
  const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (isLambda) {
    // Load pre-generated spec from build time
    // In Lambda, files are in /var/task/
    try {
      const fs = require('fs');
      const specPath = path.join(process.cwd(), 'swagger-spec.json');
      const specData = fs.readFileSync(specPath, 'utf8');
      specs = JSON.parse(specData);
      console.log(`📚 Using pre-generated Swagger spec (${Object.keys(specs.paths || {}).length} paths)`);
    } catch (error) {
      console.error('❌ Failed to load swagger-spec.json:', error);
      specs = { openapi: '3.0.3', info: { title: 'JMarkets API', version: '1.0.0' }, paths: {} };
    }
  } else {
    // Generate spec dynamically from JSDoc comments
    specs = swaggerJsdoc(options);
    console.log('📚 Generated Swagger spec dynamically');
  }

  // Serve the OpenAPI spec as JSON
  app.get('/api-docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(specs);
  });

  // Custom Swagger UI that uses CDN for static assets (works in Lambda!)
  // Inspired by Python Lambda Powertools approach
  app.get('/api-docs/', (req, res) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JMarkets API Documentation</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; padding: 0; }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: '/api-docs/swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>
    `;
    res.send(html);
  });

  console.log('📚 Swagger documentation available at /api-docs/');
}
