# Express.js Backend Implementation Guide - Hello World Edition

## Architecture Overview

This guide demonstrates how to implement a production-ready Express.js backend with AWS Lambda support, using a simple Hello World application that includes user management as a practical example.

## Tech Stack

- **Express.js + TypeScript** - Web framework with type safety
- **Drizzle ORM + PostgreSQL** - Type-safe database layer
- **AWS Cognito** - Authentication service
- **AWS Lambda** - Serverless deployment
- **Swagger/OpenAPI** - API documentation
- **Zod** - Runtime validation
- **Nodemailer + AWS SES** - Email service

## Project Structure

```
server/
├── src/
│   ├── config/                 # Configuration classes
│   │   ├── ExpressAppConfig.ts # Main app configuration
│   │   ├── database.ts         # Database connection
│   │   ├── swagger.ts          # API documentation setup
│   │   └── app.ts             # Environment variables
│   ├── controllers/           # HTTP request handlers
│   │   ├── HelloController.ts  # Hello World endpoints
│   │   └── UserController.ts   # User management
│   ├── services/              # Business logic layer
│   │   ├── HelloService.ts     # Hello World business logic
│   │   ├── UserService.ts      # User management logic
│   │   ├── CognitoService.ts   # AWS Cognito integration
│   │   ├── EmailService.ts     # Email notifications
│   │   └── AWSSecretsService.ts # Secure config management
│   ├── repositories/          # Data access layer
│   │   └── UserRepository.ts   # User data access
│   ├── entities/              # Database schemas (Drizzle)
│   │   ├── User.ts            # User table schema
│   │   └── index.ts           # Entity exports
│   ├── models/                # DTOs and domain models
│   │   ├── Hello.ts           # Hello World models
│   │   ├── User.ts            # User domain models
│   │   └── index.ts           # Model exports
│   ├── mappers/               # Entity-Model transformations
│   │   └── UserMapper.ts      # User data transformations
│   ├── templates/             # Email templates
│   │   └── welcome-email.html # Welcome email template
│   ├── types/                 # TypeScript type definitions
│   │   ├── api.ts            # API response types
│   │   └── repositories.ts    # Repository interfaces
│   ├── utils/                 # Utility functions
│   │   └── encryption.ts      # Encryption utilities
│   ├── dependency_injection.ts # DI container
│   ├── routes.ts              # Route configuration
│   ├── index.ts               # Local development entry
│   ├── index.exports.ts       # Export definitions
│   └── vite.ts               # Development server setup
├── lambda.cts                 # Lambda entry point
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── vite.config.ts
```

## Core Configuration Classes

### 1. ExpressAppConfig.ts
Main application configuration class that handles:
- Express app creation and middleware setup
- CORS configuration with dynamic origins
- Request logging middleware
- Error handling middleware
- Lambda vs local environment detection

```typescript
import express, {Express, Request, Response, NextFunction} from 'express';
import cors from 'cors';
import {setupRoutes} from '../routes';
import {setupSwagger} from './swagger';
import {userService} from '../dependency_injection';

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
        app.use(express.urlencoded({extended: false}));
        return app;
    }

    private _configureMiddleware(): void {
        // CORS configuration
        this.app.use(cors({
            origin: (origin, callback) => {
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
                
                callback(new Error('Not allowed by CORS'));
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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

            res.status(status).json({message});
        });
    }

    private _getAllowedOrigins(): string[] {
        const defaultOrigins = [
            'http://localhost:3000',
            'http://localhost:5000',
            'https://yourdomain.com',
            // Android app origins
            'https://com.yourapp.domain',
            'capacitor://com.yourapp.domain',
            'ionic://com.yourapp.domain'
        ];

        const cloudfrontUrl = process.env.VITE_CLOUDFRONT_URL;
        if (cloudfrontUrl) {
            defaultOrigins.push(cloudfrontUrl);
        }

        return defaultOrigins;
    }

    public async initializeDefaultUser(): Promise<void> {
        try {
            const adminEmail = 'admin@yourdomain.com';
            const existingUser = await userService.getUserByEmail(adminEmail);

            if (!existingUser) {
                console.log('Default admin user setup required - will be handled by first API call');
            } else {
                console.log(`Default admin user exists: ${existingUser.id}`);
            }
        } catch (error) {
            console.error('Error checking default admin user:', error);
        }
    }

    public getApp(): Express {
        return this.app;
    }

    public isRunningInLambda(): boolean {
        return this.isLambda;
    }
}
```

### 2. Database Configuration
Drizzle ORM setup with Neon PostgreSQL:

```typescript
// config/database.ts
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../entities";

neonConfig.webSocketConstructor = ws;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

### 3. Dependency Injection Container
Centralized service instantiation:

```typescript
// dependency_injection.ts
import { UserRepository } from './repositories/UserRepository';

import { HelloService } from './services/HelloService';
import { UserService } from './services/UserService';
import { createCognitoService } from './services/CognitoService';
import { EmailService } from './services/EmailService';
import { AWSSecretsService } from './services/AWSSecretsService';

import { HelloController } from './controllers/HelloController';
import { UserController } from './controllers/UserController';

// Create repositories
export const userRepository = new UserRepository();

// Create services
export const awsSecretsService = new AWSSecretsService();
export const cognitoService = createCognitoService();
export const helloService = new HelloService();
export const userService = new UserService();
export const emailService = new EmailService(awsSecretsService);

// Create controllers
export const helloController = new HelloController();
export const userController = new UserController();
```

## Architecture Patterns

### 1. Clean Architecture Layers

**Controllers** → **Services** → **Repositories** → **Database**

- **Controllers**: Handle HTTP requests, validation, and responses
- **Services**: Implement business logic and orchestrate operations
- **Repositories**: Abstract data access with interfaces
- **Entities**: Database schema definitions (Drizzle)
- **Models**: Domain objects and DTOs
- **Mappers**: Transform between entities and models

### 2. Controller Pattern
Modern router-based controllers with embedded routing:

```typescript
// controllers/HelloController.ts
export class HelloController {
  getRouter(): Router {
    const router = Router();
    router.get('/', this.getHello.bind(this));
    router.get('/user/:name', this.getHelloUser.bind(this));
    router.post('/message', this.postMessage.bind(this));
    return router;
  }

  /**
   * @swagger
   * /hello:
   *   get:
   *     summary: Get hello world message
   *     tags: [Hello]
   */
  async getHello(req: Request, res: Response) {
    const message = await helloService.getHelloMessage();
    res.json({ message, timestamp: new Date().toISOString() });
  }

  /**
   * @swagger
   * /hello/user/{name}:
   *   get:
   *     summary: Get personalized hello message
   *     tags: [Hello]
   */
  async getHelloUser(req: Request, res: Response) {
    const { name } = req.params;
    const message = await helloService.getPersonalizedHello(name);
    res.json({ message, user: name, timestamp: new Date().toISOString() });
  }

  async postMessage(req: Request, res: Response) {
    const { message } = req.body;
    const response = await helloService.processMessage(message);
    res.json({ response, timestamp: new Date().toISOString() });
  }
}

// controllers/UserController.ts
export class UserController {
  getRouter(): Router {
    const router = Router();
    router.get('/:id/profile', this.getUserProfile.bind(this));
    router.put('/:id/profile', this.updateUser.bind(this));
    router.post('/:userId/verify-email-complete', this.verifyEmailComplete.bind(this));
    return router;
  }

  /**
   * @swagger
   * /users/{id}/profile:
   *   get:
   *     summary: Get user profile
   *     tags: [Users]
   */
  async getUserProfile(req: Request, res: Response) {
    try {
      const user = await userService.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
```

### 3. Service Layer Pattern
Business logic with dependency injection:

```typescript
// services/HelloService.ts
export class HelloService {
  async getHelloMessage(): Promise<string> {
    return "Hello, World! Welcome to our Express.js + Lambda application.";
  }

  async getPersonalizedHello(name: string): Promise<string> {
    if (!name || name.trim() === '') {
      return "Hello, Anonymous! Welcome to our application.";
    }
    return `Hello, ${name}! Welcome to our Express.js + Lambda application.`;
  }

  async processMessage(message: string): Promise<string> {
    if (!message) {
      return "I received an empty message. Please send something!";
    }
    
    const wordCount = message.split(' ').length;
    return `I received your message: "${message}". It contains ${wordCount} word(s). Thank you!`;
  }
}

// services/UserService.ts
export class UserService {
  private userRepo = userRepository;
  private cognitoService = cognitoService;

  async getUser(id: string): Promise<User | undefined> {
    // Check database first
    const entity = await this.userRepo.getUser(id);
    if (entity) {
      return UserMapper.entityToModel(entity);
    }

    // If user not found in DB, check Cognito and sync
    const cognitoUser = await this.cognitoService.getUser(id);
    if (cognitoUser) {
      const newUser = await this.createUser({
        id: cognitoUser.sub,
        email: cognitoUser.email,
        userName: cognitoUser.username,
        firstName: cognitoUser.firstName,
        lastName: cognitoUser.lastName,
        company: cognitoUser.company,
      });
      return newUser;
    }

    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const entity = await this.userRepo.createUser(UserMapper.modelToEntity(user));
    return UserMapper.entityToModel(entity);
  }

  async updateUser(id: string, user: UpdateUser): Promise<User | undefined> {
    const updateData: Partial<UserEntity> = {
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company,
      configStep: user.configStep?.toString(),
      isActive: user.isActive,
    };
    
    const entity = await this.userRepo.updateUser(id, updateData);
    if (!entity) return undefined;
    
    // Update in Cognito if needed
    const cognitoAttributes: { [key: string]: string } = {};
    if (user.firstName) cognitoAttributes['given_name'] = user.firstName;
    if (user.lastName) cognitoAttributes['family_name'] = user.lastName;
    if (user.company) cognitoAttributes['custom:company_name'] = user.company;
    
    if (Object.keys(cognitoAttributes).length > 0) {
      await this.cognitoService.updateUserAttributes(id, cognitoAttributes);
    }
    
    return UserMapper.entityToModel(entity);
  }

  async verifyEmailComplete(userId: string, language: string = 'en'): Promise<{ user: User; message: string }> {
    let user = await this.getUser(userId);

    if (!user) {
      const cognitoUserData = await this.cognitoService.getUser(userId);
      if (!cognitoUserData) {
        throw new Error('User not found in Cognito');
      }

      user = await this.createUser({
        id: cognitoUserData.sub,
        email: cognitoUserData.email,
        userName: cognitoUserData.username,
        firstName: cognitoUserData.firstName,
        lastName: cognitoUserData.lastName,
        company: cognitoUserData.company,
      });
    }

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.firstName, user.lastName, language);

    return {
      user,
      message: 'Welcome materials processed successfully'
    };
  }
}
```

### 4. Repository Pattern
Data access abstraction with interfaces:

```typescript
export interface IUserRepository {
  getUser(id: string): Promise<UserEntity | undefined>;
  createUser(user: InsertUserEntity): Promise<UserEntity>;
}

export class UserRepository implements IUserRepository {
  async getUser(id: string): Promise<UserEntity | undefined> {
    const [entity] = await db.select().from(users).where(eq(users.id, id));
    return entity || undefined;
  }
}
```

## Lambda Integration

### 1. Lambda Entry Point (lambda.cts)
Handles multiple AWS event types:

```typescript
const serverless = require('serverless-http');
const { ExpressAppConfig } = require('./src/config/ExpressAppConfig');

const appConfig = new ExpressAppConfig();
const app = appConfig.getApp();
const expressHandler = serverless(app);

exports.handler = async (event: any, context: any, callback: any) => {
  // Handle SQS events
  if (event.Records && event.Records[0].eventSource === 'aws:sqs') {
    // SQS processing logic
    return;
  }
  
  // Handle API Gateway events
  return expressHandler(event, context, callback);
};
```

### 2. Local Development Entry Point (index.ts)
Main entry point for local development:

```typescript
import 'dotenv/config';
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";
import { ExpressAppConfig } from './config/ExpressAppConfig';

const appConfig = new ExpressAppConfig();
const app = appConfig.getApp();

(async () => {
  const server = createServer(app);
  
  if (!appConfig.isRunningInLambda()) {
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
  }

  if (!appConfig.isRunningInLambda()) {
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen(port, "localhost", async () => {
      log(`serving on port ${port}`);
      await appConfig.initializeDefaultUser();
    });
  } else {
    await appConfig.initializeDefaultUser();
  }
})();
```

## Database Schema (Drizzle)

### 1. Entity Definitions
Type-safe schema definitions:

```typescript
// entities/User.ts
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  userName: text('user_name').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type UserEntity = typeof users.$inferSelect;
export type InsertUserEntity = typeof users.$inferInsert;
```

### 2. Simple Entity Example
User entity with basic fields:

```typescript
// entities/User.ts
import { pgTable, text, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  userName: text('user_name').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  company: text('company'),
  configStep: text('config_step').notNull().default('0'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type UserEntity = typeof users.$inferSelect;
export type InsertUserEntity = typeof users.$inferInsert;

// entities/index.ts
export * from './User';
```

## Validation & Models

### 1. Simple Model Examples
Runtime validation with TypeScript inference:

```typescript
// models/Hello.ts
import { z } from 'zod';

export interface HelloMessage {
  message: string;
  timestamp: string;
  user?: string;
}

export interface MessageRequest {
  message: string;
}

export const messageRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

// models/User.ts
import { z } from 'zod';

export interface User {
  id: string;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  company?: string | null;
  configStep: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertUser {
  id: string;
  email: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  company?: string | null;
  configStep?: number;
}

export interface UpdateUser {
  userName?: string;
  firstName?: string;
  lastName?: string;
  company?: string | null;
  configStep?: number;
  isActive?: boolean;
}

export const insertUserSchema = z.object({
  email: z.string().email(),
  userName: z.string().min(1),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  configStep: z.number().optional(),
});

export const updateUserSchema = z.object({
  userName: z.string().min(1).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  configStep: z.number().optional(),
  isActive: z.boolean().optional(),
});

// models/index.ts
export * from './Hello';
export * from './User';
```

### 2. Simple Mapper Implementation
Entity-Model transformations:

```typescript
// mappers/UserMapper.ts
import type { UserEntity, InsertUserEntity } from '../entities';
import type { User, InsertUser } from '../models';

export class UserMapper {
  static entityToModel(entity: UserEntity): User {
    return {
      id: entity.id,
      email: entity.email,
      userName: entity.userName,
      firstName: entity.firstName,
      lastName: entity.lastName,
      company: entity.company,
      configStep: parseInt(entity.configStep),
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static modelToEntity(model: InsertUser): InsertUserEntity {
    return {
      id: model.id,
      email: model.email,
      userName: model.userName,
      firstName: model.firstName,
      lastName: model.lastName,
      company: model.company,
      configStep: model.configStep?.toString() || '0'
    } as InsertUserEntity;
  }
}

// mappers/index.ts
export * from './UserMapper';
```

## AWS Services Integration

### 1. Complete Cognito Service Implementation
User authentication and management:

```typescript
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';

export interface CognitoConfig {
  region: string;
  userPoolId: string;
  clientId: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface CognitoUser {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  sub: string;
  emailVerified?: boolean;
}

export class CognitoService {
  private client: CognitoIdentityProviderClient;
  
  constructor(private config: CognitoConfig) {
    this.client = new CognitoIdentityProviderClient({
      region: config.region,
      ...(process.env.AWS_LAMBDA_FUNCTION_NAME ? {} : { profile: "YOUR_PROFILE" })
    });
  }

  async createUser(userData: {
    email: string;
    userName: string;
    firstName?: string;
    lastName?: string;
  }): Promise<{ id: string; email: string; userName: string }> {
    const temporaryPassword = this.generateTemporaryPassword();
    const fullUser = await this.createUserDetailed(
      userData.userName,
      userData.email,
      temporaryPassword,
      userData.firstName,
      userData.lastName
    );
    return {
      id: fullUser.sub,
      email: fullUser.email,
      userName: fullUser.username,
    };
  }

  async createUserDetailed(
    username: string,
    email: string,
    temporaryPassword: string,
    firstName?: string,
    lastName?: string,
    company?: string
  ): Promise<CognitoUser> {
    const userAttributes = [
      { Name: 'email', Value: email },
      { Name: 'email_verified', Value: 'true' },
    ];

    if (firstName) userAttributes.push({ Name: 'given_name', Value: firstName });
    if (lastName) userAttributes.push({ Name: 'family_name', Value: lastName });
    if (company) userAttributes.push({ Name: 'custom:company_name', Value: company });

    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: this.config.userPoolId,
      Username: username,
      UserAttributes: userAttributes,
      TemporaryPassword: temporaryPassword,
      MessageAction: 'SUPPRESS',
    });

    const createResult = await this.client.send(createUserCommand);
    
    const setPasswordCommand = new AdminSetUserPasswordCommand({
      UserPoolId: this.config.userPoolId,
      Username: username,
      Password: temporaryPassword,
      Permanent: true,
    });

    await this.client.send(setPasswordCommand);

    return {
      username,
      email,
      firstName,
      lastName,
      company,
      sub: createResult.User?.Attributes?.find(attr => attr.Name === 'sub')?.Value || `cognito-${username}`,
    };
  }

  async getUser(userId: string): Promise<CognitoUser | null> {
    try {
      const command = new AdminGetUserCommand({
        UserPoolId: this.config.userPoolId,
        Username: userId,
      });

      const result = await this.client.send(command);
      
      if (!result.UserAttributes) return null;

      const getAttribute = (name: string) => 
        result.UserAttributes?.find(attr => attr.Name === name)?.Value;

      return {
        username: getAttribute('preferred_username') || getAttribute('email')?.split('@')[0] || '',
        email: getAttribute('email') || '',
        firstName: getAttribute('given_name'),
        lastName: getAttribute('family_name'),
        company: getAttribute('custom:company_name'),
        sub: getAttribute('sub') || userId,
        emailVerified: getAttribute('email_verified') === 'true',
      };
    } catch (error) {
      return null;
    }
  }

  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

export function createCognitoService(): CognitoService {
  const config: CognitoConfig = {
    region: process.env.AWS_REGION || 'us-east-1',
    userPoolId: process.env.AWS_COGNITO_USER_POOL_ID!,
    clientId: process.env.AWS_COGNITO_CLIENT_ID!,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  };

  return new CognitoService(config);
}
```

### 2. AWS Secrets Manager
Secure credential management:

```typescript
export class AWSSecretsService {
  async getDatabaseCredentials(): Promise<DatabaseCredentials> {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const result = await this.secretsManager.send(command);
    return JSON.parse(result.SecretString!);
  }
}
```

### 3. Complete Email Service Implementation
Template-based email system with AWS SES:

```typescript
import nodemailer from 'nodemailer';
import type { AWSSecretsService } from './AWSSecretsService';
import { TemplateService } from './TemplateService';

export class EmailService {
  private transporter: nodemailer.Transporter;
  private templateService: TemplateService;

  constructor(private awsSecretsService: AWSSecretsService) {
    this.templateService = new TemplateService();
    this.transporter = nodemailer.createTransporter({
      host: 'email-smtp.us-east-1.amazonaws.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.AWS_SES_SMTP_USERNAME,
        pass: process.env.AWS_SES_SMTP_PASSWORD,
      },
    });
  }

  private async getTransporter(): Promise<nodemailer.Transporter> {
    try {
      const smtpCredentials = await this.awsSecretsService.getSMTPCredentials();
      return nodemailer.createTransporter({
        host: smtpCredentials.host,
        port: parseInt(smtpCredentials.port),
        secure: false,
        auth: {
          user: smtpCredentials.user,
          pass: smtpCredentials.password,
        },
      });
    } catch (error) {
      return this.transporter;
    }
  }

  async sendWelcomeEmail(
    to: string, 
    firstName: string, 
    lastName?: string,
    language: string = 'en'
  ): Promise<boolean> {
    try {
      const transporter = await this.getTransporter();
      const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName || 'User';
      const emailContent = this.templateService.getWelcomeEmailContent(fullName, language);
      
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
        to,
        subject: emailContent.subject,
        html: emailContent.html,
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  async sendCompanyInviteEmail(
    to: string, 
    fullName: string, 
    companyName: string, 
    userRoles: string[],
    acceptUrl: string,
    language: string = 'en'
  ): Promise<boolean> {
    try {
      const transporter = await this.getTransporter();
      const emailContent = this.templateService.getCompanyInviteEmailContent(
        fullName, 
        companyName, 
        userRoles, 
        acceptUrl, 
        language
      );
      
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
        to,
        subject: emailContent.subject,
        html: emailContent.html,
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Failed to send company invite email:', error);
      return false;
    }
  }
}

// services/TemplateService.ts
export class TemplateService {
  getWelcomeEmailContent(fullName: string, language: string = 'en'): { subject: string; html: string } {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    if (language === 'es') {
      return {
        subject: '¡Bienvenido a tu aplicación!',
        html: `
          <h1>¡Hola ${fullName}!</h1>
          <p>Bienvenido a nuestra plataforma.</p>
          <a href="${frontendUrl}/setup">Completar configuración</a>
        `
      };
    }

    return {
      subject: 'Welcome to your application!',
      html: `
        <h1>Hello ${fullName}!</h1>
        <p>Welcome to our platform.</p>
        <a href="${frontendUrl}/setup">Complete Setup</a>
      `
    };
  }

  getCompanyInviteEmailContent(
    fullName: string, 
    companyName: string, 
    userRoles: string[],
    acceptUrl: string,
    language: string
  ): { subject: string; html: string } {
    const rolesText = userRoles.join(', ');
    
    if (language === 'es') {
      return {
        subject: `Invitación para unirte a ${companyName}`,
        html: `
          <h1>¡Hola ${fullName}!</h1>
          <p>Has sido invitado a unirte a ${companyName}.</p>
          <p>Roles: ${rolesText}</p>
          <a href="${acceptUrl}">Aceptar Invitación</a>
        `
      };
    }

    return {
      subject: `Invitation to join ${companyName}`,
      html: `
        <h1>Hello ${fullName}!</h1>
        <p>You have been invited to join ${companyName}.</p>
        <p>Roles: ${rolesText}</p>
        <a href="${acceptUrl}">Accept Invitation</a>
      `
    };
  }
}
```

## API Documentation (Swagger)

### 1. Swagger Setup
Automatic API documentation generation:

```typescript
// config/swagger.ts
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
    },
  },
  apis: [path.join(controllersPath, '*.ts')],
};

export function setupSwagger(app: Express) {
  const specs = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}
```

### 2. Controller Documentation
JSDoc comments for automatic documentation:

```typescript
/**
 * @swagger
 * /users/{id}/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile
 */
```

## Missing Critical Components

### 1. Simple Routes Configuration
```typescript
// routes.ts
import type { Express } from 'express';
import { setupSwagger } from './config/swagger';
import { helloController, userController } from './dependency_injection';

export function setupRoutes(app: Express) {
  // Setup Swagger documentation
  setupSwagger(app);
  
  // Hello World routes
  app.use('/hello', helloController.getRouter());
  
  // User management routes
  app.use('/users', userController.getRouter());
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
}
```

### 2. Vite Development Server Setup
```typescript
// vite.ts
import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import { type Server } from "http";

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
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: { server } },
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const template = await fs.promises.readFile(
        path.resolve("../client/index.html"),
        "utf-8"
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve("public");
  if (!fs.existsSync(distPath)) {
    throw new Error(`Build directory not found: ${distPath}`);
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
```

### 3. Simple Repository Interface
```typescript
// types/repositories.ts
import type { UserEntity, InsertUserEntity } from '../entities/User';

export interface IUserRepository {
  getUser(id: string): Promise<UserEntity | undefined>;
  getUserByEmail(email: string): Promise<UserEntity | undefined>;
  createUser(user: InsertUserEntity): Promise<UserEntity>;
  updateUser(id: string, user: Partial<UserEntity>): Promise<UserEntity | undefined>;
  updateUserByEmail(email: string, userData: Partial<UserEntity>): Promise<UserEntity | undefined>;
}

// types/api.ts
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  timestamp: string;
}

export interface HelloWorldConfig {
  appName: string;
  version: string;
  environment: string;
}

// types/index.ts
export * from './repositories';
export * from './api';
```

## Development Setup

### 1. Package.json Scripts
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc && tsc-alias",
    "build:lambda": "npm run build && zip -r lambda.zip .",
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "drizzle-orm": "^0.29.0",
    "@neondatabase/serverless": "^0.7.2",
    "@aws-sdk/client-cognito-identity-provider": "^3.0.0",
    "@aws-sdk/client-secrets-manager": "^3.0.0",
    "nodemailer": "^6.9.0",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0",
    "zod": "^3.22.0",
    "serverless-http": "^3.2.0",
    "ws": "^8.14.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/nodemailer": "^6.4.14",
    "@types/swagger-jsdoc": "^6.0.4",
    "@types/swagger-ui-express": "^4.1.6",
    "@types/ws": "^8.5.10",
    "typescript": "^5.0.0",
    "tsx": "^4.0.0",
    "drizzle-kit": "^0.20.0",
    "vite": "^5.0.0"
  }
}
```

### 2. Hello World Environment Variables
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@host:5432/helloworld_db

# AWS Configuration (for Cognito and SES)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Email Configuration (optional for welcome emails)
FROM_EMAIL=noreply@yourdomain.com
AWS_SES_SMTP_USERNAME=your_ses_username
AWS_SES_SMTP_PASSWORD=your_ses_password

# Frontend Configuration (if serving frontend)
FRONTEND_URL=http://localhost:3000

# Security (for user data encryption)
ENCRYPTION_KEY=your-encryption-key-change-in-production
JWT_SECRET=your-jwt-secret-for-development
```

### 3. TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. Drizzle Configuration
```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/entities/*',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

## Error Handling

### 1. Global Error Middleware
```typescript
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  console.error(`❌ ${req.method} ${req.path} - ${status} ${message}`);
  res.status(status).json({ message });
});
```

### 2. Validation Error Handling
```typescript
try {
  const userData = insertUserSchema.parse(req.body);
  const user = await userService.createUser(userData);
  res.status(201).json(user);
} catch (error) {
  res.status(400).json({ error: "Invalid user data" });
}
```

## Security Best Practices

### 1. CORS Configuration
Dynamic origin validation:

```typescript
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = this._getAllowedOrigins();
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
```

### 2. Input Sanitization
Zod schema validation for all inputs:

```typescript
const userData = insertUserSchema.parse(req.body);
```

### 3. Simple Encryption Utilities
Basic encryption for sensitive data:

```typescript
// utils/encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'hello-world-encryption-key-change-in-production';
const ALGORITHM = 'aes-256-cbc';

function getKey(): Buffer {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, getKey());
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipher(ALGORITHM, getKey());
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export function encode(text: string): string {
  return Buffer.from(text).toString('base64');
}

export function decode(encodedText: string): string {
  return Buffer.from(encodedText, 'base64').toString('utf8');
}

// Simple hash function for passwords (use bcrypt in production)
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
```

## Deployment Considerations

### 1. Lambda Optimization
- Use `serverless-http` for Express compatibility
- Implement connection pooling for database
- Handle cold starts gracefully
- Environment-specific initialization

### 2. Database Migrations
```typescript
// Use Drizzle Kit for schema management
npm run db:generate  # Generate migration files
npm run db:push      # Apply migrations
```

### 3. Monitoring & Logging
```typescript
// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
  });
  next();
});
```

## Hello World Implementation Notes

### 1. Simple Entity Structure
The Hello World implementation includes:
- **Users** table with basic profile information
- **Cognito integration** for authentication
- **Email service** for welcome notifications

### 2. API Endpoints
Simple REST API structure:
- `GET /hello` - Basic hello world message
- `GET /hello/user/:name` - Personalized greeting
- `POST /hello/message` - Process user messages
- `GET /users/:id/profile` - Get user profile
- `PUT /users/:id/profile` - Update user profile
- `GET /health` - Health check endpoint

### 3. AWS Services Integration
- **CognitoService** for user authentication and management
- **EmailService** with AWS SES for welcome emails
- **AWSSecretsService** for secure credential management

### 4. Production-Ready Features
- Dual-mode operation (Lambda + local development)
- Comprehensive error handling and logging
- CORS configuration for frontend integration
- Swagger API documentation
- TypeScript type safety throughout
- Clean architecture with separation of concerns

### 5. Extensibility
This Hello World foundation can be easily extended with:
- Additional entities and relationships
- More complex business logic
- External API integrations
- Advanced authentication and authorization
- Real-time features

This architecture provides a solid foundation for building scalable Express.js applications that work seamlessly in both local development and AWS Lambda environments while following clean architecture principles.