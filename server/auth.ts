import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { Express } from "express";
import { createUserSession } from "./middleware/serverless-auth";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";



const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  app.set("trust proxy", 1);

  // Register endpoint - create default admin user
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, email, firstName, lastName } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        email,
        firstName,
        lastName,
        role: "admin",
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({ id: user.id, username: user.username, email: user.email, role: user.role });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Authenticate user
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Create database session and JWT token
      const { token, sessionId } = await createUserSession(
        {
          id: user.id,
          username: user.username,
          email: user.email || '',
          role: user.role,
        },
        req.get('User-Agent'),
        req.ip || req.connection.remoteAddress
      );

      // Update user's last login
      await storage.updateUser(user.id, { lastLogin: new Date() });

      // Set secure HTTP-only cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        token, // Also return token for Bearer auth
        sessionId
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    // Clear the JWT token cookie
    res.clearCookie('auth_token');
    res.json({ message: "Logged out successfully" });
  });

  // Get current user endpoint - using serverless auth
  app.get("/api/user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : req.cookies?.auth_token;

      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { verifyUserSession } = await import("./middleware/serverless-auth");
      const sessionData = await verifyUserSession(token);
      if (!sessionData) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      res.json({
        id: sessionData.user.id,
        username: sessionData.user.username,
        email: sessionData.user.email,
        role: sessionData.user.role
      });
    } catch (error) {
      console.error('User endpoint error:', error);
      res.status(401).json({ message: "Unauthorized" });
    }
  });
}

// Export hashPassword for use in other modules
export { hashPassword, comparePasswords };