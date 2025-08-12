import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { db } from '../db';
import { users, userSessions, apiKeys } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'strawberry-essentials-secret-key-2024';
const JWT_EXPIRES_IN = '24h';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  session?: {
    id: string;
    lastUsed: Date;
  };
}

export interface TokenPayload {
  id: string;
  username: string;
  email: string;
  role: string;
  sessionId: string;
  iat: number;
  exp: number;
}

// Generate JWT token and store session in database
export async function createUserSession(
  user: { id: string; username: string; email: string; role: string },
  userAgent?: string,
  ipAddress?: string
): Promise<{ token: string; sessionId: string }> {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      sessionId,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const tokenHash = createHash('sha256').update(token).digest('hex');

  // Store session in database
  await db.insert(userSessions).values({
    id: sessionId,
    userId: user.id,
    tokenHash,
    expiresAt,
    userAgent,
    ipAddress,
  });

  return { token, sessionId };
}

// Verify JWT token and validate against database session
export async function verifyUserSession(token: string): Promise<{
  user: { id: string; username: string; email: string; role: string };
  session: { id: string; lastUsed: Date };
} | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    const tokenHash = createHash('sha256').update(token).digest('hex');

    // Check if session exists and is active
    const [sessionRecord] = await db
      .select({
        session: userSessions,
        user: users,
      })
      .from(userSessions)
      .innerJoin(users, eq(users.id, userSessions.userId))
      .where(
        and(
          eq(userSessions.id, decoded.sessionId),
          eq(userSessions.tokenHash, tokenHash),
          eq(userSessions.isActive, true),
          eq(users.isActive, true),
          gt(userSessions.expiresAt, new Date())
        )
      );

    if (!sessionRecord) {
      return null;
    }

    // Update last used timestamp
    await db
      .update(userSessions)
      .set({ lastUsed: new Date() })
      .where(eq(userSessions.id, decoded.sessionId));

    return {
      user: {
        id: sessionRecord.user.id,
        username: sessionRecord.user.username,
        email: sessionRecord.user.email || '',
        role: sessionRecord.user.role,
      },
      session: {
        id: sessionRecord.session.id,
        lastUsed: new Date(),
      },
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Invalidate user session
export async function invalidateUserSession(sessionId: string): Promise<boolean> {
  try {
    const result = await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.id, sessionId));
    
    return true;
  } catch (error) {
    console.error('Session invalidation error:', error);
    return false;
  }
}

// Clean up expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(
        and(
          eq(userSessions.isActive, true),
          gt(new Date(), userSessions.expiresAt)
        )
      );
  } catch (error) {
    console.error('Session cleanup error:', error);
  }
}

// Middleware to authenticate requests with database session validation
export async function authenticateServerless(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.cookies?.auth_token;

    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'No authentication token provided' 
      });
    }

    const sessionData = await verifyUserSession(token);
    if (!sessionData) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Invalid or expired token' 
      });
    }

    req.user = sessionData.user;
    req.session = sessionData.session;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: 'Authentication error', 
      message: 'Internal server error during authentication' 
    });
  }
}

// Middleware to check if user has required role
export function requireRoleServerless(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Authentication required' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }

    next();
  };
}

// Middleware specifically for admin access
export const requireAdminServerless = requireRoleServerless(['admin']);

// Hash function for API keys
function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

// Create API key and store in database
export async function createApiKey(
  keyName: string,
  permissions: string[] = [],
  rateLimitPerHour: number = 1000,
  expiresAt?: Date
): Promise<{ apiKey: string; id: string }> {
  const apiKey = `sk-${crypto.randomUUID().replace(/-/g, '')}`;
  const keyHash = hashApiKey(apiKey);

  const [result] = await db.insert(apiKeys).values({
    keyName,
    keyHash,
    permissions,
    rateLimitPerHour,
    expiresAt,
  }).returning();

  return { apiKey, id: result.id };
}

// Middleware for API key protection (for public endpoints)
export async function requireApiKeyServerless(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKey = req.headers['x-api-key'] as string || req.query.api_key as string;

    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API key required', 
        message: 'Valid API key required to access this endpoint' 
      });
    }

    const keyHash = hashApiKey(apiKey);
    
    // Check if API key exists and is active
    const [keyRecord] = await db
      .select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.keyHash, keyHash),
          eq(apiKeys.isActive, true),
          // Check expiration if set
          apiKeys.expiresAt ? gt(apiKeys.expiresAt, new Date()) : sql`true`
        )
      );

    if (!keyRecord) {
      return res.status(401).json({ 
        error: 'Invalid API key', 
        message: 'API key not found or inactive' 
      });
    }

    // Update last used timestamp
    await db
      .update(apiKeys)
      .set({ lastUsed: new Date() })
      .where(eq(apiKeys.id, keyRecord.id));

    next();
  } catch (error) {
    console.error('API key verification error:', error);
    return res.status(500).json({ 
      error: 'Authentication error', 
      message: 'Internal server error during API key verification' 
    });
  }
}

// Rate limiting with database tracking
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimitServerless(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    const clientData = requestCounts.get(clientId);
    
    if (!clientData || now > clientData.resetTime) {
      requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
      next();
    } else if (clientData.count < maxRequests) {
      clientData.count++;
      next();
    } else {
      res.status(429).json({ 
        error: 'Too many requests', 
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }
  };
}

// Initialize default API key if none exists
export async function initializeDefaultApiKey(): Promise<void> {
  try {
    const [existingKey] = await db.select().from(apiKeys).limit(1);
    
    if (!existingKey) {
      const { apiKey } = await createApiKey('Default Public API Key', ['read'], 10000);
      console.log(`✓ Default API key created: ${apiKey}`);
      console.log('  Use this key in the X-API-Key header or ?api_key= query parameter');
    }
  } catch (error) {
    console.error('Failed to initialize default API key:', error);
  }
}