import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

const JWT_SECRET = process.env.JWT_SECRET || 'strawberry-essentials-secret-key';
const JWT_EXPIRES_IN = '24h';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export interface TokenPayload {
  id: string;
  username: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Generate JWT token
export function generateToken(user: { id: string; username: string; email: string; role: string }): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Middleware to authenticate requests
export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'Invalid or expired token' 
      });
    }

    // Verify user still exists and is active
    const user = await storage.getUser(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'User not found' 
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email || '',
      role: user.role,
    };

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
export function requireRole(allowedRoles: string[]) {
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
export const requireAdmin = requireRole(['admin']);

// Middleware for API key protection (for public endpoints)
export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  const validApiKey = process.env.API_KEY || 'strawberry-public-api-key';

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ 
      error: 'API key required', 
      message: 'Valid API key required to access this endpoint' 
    });
  }

  next();
}

// Rate limiting middleware
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
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

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')?.substring(0, 100),
    };
    
    // Log to console (in production, you might want to use a proper logging service)
    if (res.statusCode >= 400) {
      console.error('HTTP Error:', JSON.stringify(logData));
    } else {
      console.log('HTTP Request:', JSON.stringify(logData));
    }
  });
  
  next();
}