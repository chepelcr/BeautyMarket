import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

// Swagger JSDoc configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Strawberry Essentials API',
      version: '1.0.0',
      description: 'Beauty products marketplace API with CMS, authentication, and auto-deployment',
      contact: {
        name: 'Strawberry Essentials Support',
        url: 'https://strawberry-essentials.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.strawberry-essentials.com' 
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
            lastLogin: { type: 'string', format: 'date-time', nullable: true },
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
            category: { type: 'string' },
            imageUrl: { type: 'string', format: 'url', nullable: true },
            image2Url: { type: 'string', format: 'url', nullable: true },
            image3Url: { type: 'string', format: 'url', nullable: true },
            inStock: { type: 'boolean', default: true },
            featured: { type: 'boolean', default: false },
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
            description: { type: 'string', nullable: true },
            image1Url: { type: 'string', format: 'url', nullable: true },
            image2Url: { type: 'string', format: 'url', nullable: true },
            sortOrder: { type: 'number', default: 0 },
            isActive: { type: 'boolean', default: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            customerName: { type: 'string' },
            customerEmail: { type: 'string', format: 'email' },
            customerPhone: { type: 'string' },
            shippingAddress: { 
              type: 'object',
              properties: {
                province: { type: 'string' },
                canton: { type: 'string' },
                district: { type: 'string' },
                exactAddress: { type: 'string' }
              }
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string', format: 'uuid' },
                  productName: { type: 'string' },
                  quantity: { type: 'number', minimum: 1 },
                  price: { type: 'number', minimum: 0 }
                }
              }
            },
            total: { type: 'number', minimum: 0 },
            status: { 
              type: 'string', 
              enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
              default: 'pending'
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        HomePageContent: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            section: { type: 'string' },
            key: { type: 'string' },
            value: { type: 'string' },
            type: { 
              type: 'string', 
              enum: ['text', 'image', 'background', 'color']
            },
            displayName: { type: 'string' },
            sortOrder: { type: 'number', default: 0 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            details: { type: 'object', nullable: true }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string' },
            password: { type: 'string' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string' },
            token: { type: 'string' },
            sessionId: { type: 'string' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and session management'
      },
      {
        name: 'Products',
        description: 'Beauty product catalog management'
      },
      {
        name: 'Categories',
        description: 'Product category management'
      },
      {
        name: 'Orders',
        description: 'Customer order processing'
      },
      {
        name: 'CMS',
        description: 'Content management system for home page'
      },
      {
        name: 'Upload',
        description: 'File upload and AWS S3 integration'
      },
      {
        name: 'Deployment',
        description: 'Auto-deployment to AWS S3'
      },
      {
        name: 'Locations',
        description: 'Costa Rica geographic data'
      }
    ]
  },
  apis: [
    './server/routes.ts',
    './server/auth.ts',
    './server/swagger-routes.ts'
  ]
};

export class SwaggerAutoConfig {
  private swaggerSpec: any;

  constructor() {
    this.swaggerSpec = swaggerJSDoc(swaggerOptions);
  }

  public setupSwaggerEndpoints(app: Express): void {
    // Serve OpenAPI JSON spec
    app.get('/api/docs/openapi.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(this.swaggerSpec);
    });

    // Serve Swagger UI
    app.use('/docs', swaggerUi.serve);
    app.get('/docs', swaggerUi.setup(this.swaggerSpec, {
      explorer: true,
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 20px 0; }
        .swagger-ui .info .title { color: #e91e63; }
      `,
      customSiteTitle: 'Strawberry Essentials API Documentation',
      swaggerOptions: {
        persistAuthorization: true
      }
    }));

    console.log('📋 API Documentation available at: /docs');
    console.log('📋 OpenAPI Spec available at: /api/docs/openapi.json');
  }

  public getSpec(): any {
    return this.swaggerSpec;
  }
}