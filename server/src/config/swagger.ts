import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';
import path from 'path';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Beauty Market API Documentation',
      version: '1.0.0',
      description: 'Beauty products marketplace API with CMS, authentication, and auto-deployment',
      contact: {
        name: 'Beauty Market Support',
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
    path.join(import.meta.dirname, '../controllers/*.ts'),
    path.join(import.meta.dirname, '../controllers/*.js')
  ],
};

export function setupSwagger(app: Express) {
  const specs = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Beauty Market API Docs'
  }));
  console.log('📚 Swagger documentation available at /api-docs');
}
