import { Express } from "express";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { emailService } from "./email";
import { authenticateServerless } from "./middleware/serverless-auth";

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
  return require("crypto").timingSafeEqual(hashedBuf, suppliedBuf);
}

function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

export function setupUserManagement(app: Express) {
  // Update user profile
  app.patch("/api/user/profile", authenticateServerless, async (req, res) => {
    try {
      const { firstName, lastName, email } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }

      const updatedUser = await storage.updateUserProfile(userId, {
        firstName,
        lastName,
        email,
      });

      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Change password
  app.post("/api/user/change-password", authenticateServerless, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get current user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password and update
      const hashedNewPassword = await hashPassword(newPassword);
      await storage.changeUserPassword(userId, hashedNewPassword);

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Forgot password - send reset email
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ message: "If an account with that email exists, a reset link has been sent" });
      }

      // Clean up expired tokens
      await storage.cleanupExpiredPasswordResetTokens();

      // Generate secure token
      const token = generateSecureToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Store token in database
      await storage.createPasswordResetToken({
        userId: user.id,
        token,
        expiresAt,
        used: false,
      });

      // Send reset email
      const emailTemplate = emailService.generatePasswordResetEmail(
        email,
        token,
        user.firstName || user.username
      );
      
      const emailSent = await emailService.sendEmail(emailTemplate);
      
      if (emailSent) {
        res.json({ message: "If an account with that email exists, a reset link has been sent" });
      } else {
        res.status(500).json({ message: "Failed to send reset email" });
      }
    } catch (error) {
      console.error("Error in forgot password:", error);
      res.status(500).json({ message: "Failed to process forgot password request" });
    }
  });

  // Verify reset token
  app.post("/api/auth/verify-reset-token", async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }

      const resetToken = await storage.getPasswordResetToken(token);
      
      if (!resetToken || resetToken.used || new Date() > resetToken.expiresAt) {
        return res.json({ valid: false });
      }

      res.json({ valid: true });
    } catch (error) {
      console.error("Error verifying reset token:", error);
      res.json({ valid: false });
    }
  });

  // Reset password with token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      const resetToken = await storage.getPasswordResetToken(token);
      
      if (!resetToken || resetToken.used || new Date() > resetToken.expiresAt) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);
      
      // Update user password
      await storage.changeUserPassword(resetToken.userId, hashedNewPassword);
      
      // Mark token as used
      await storage.markPasswordResetTokenUsed(resetToken.id);

      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Email verification - send verification email
  app.post("/api/auth/send-verification", authenticateServerless, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.email) {
        return res.status(400).json({ message: "User or email not found" });
      }

      // Clean up expired tokens
      await storage.cleanupExpiredEmailVerificationTokens();

      // Generate secure token
      const token = generateSecureToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      // Store token in database
      await storage.createEmailVerificationToken({
        userId: user.id,
        token,
        expiresAt,
        used: false,
      });

      // Send verification email
      const emailTemplate = emailService.generateEmailVerificationEmail(
        user.email,
        token,
        user.firstName || user.username
      );
      
      const emailSent = await emailService.sendEmail(emailTemplate);
      
      if (emailSent) {
        res.json({ message: "Verification email sent" });
      } else {
        res.status(500).json({ message: "Failed to send verification email" });
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });

  // Verify email with token
  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }

      const verificationToken = await storage.getEmailVerificationToken(token);
      
      if (!verificationToken || verificationToken.used || new Date() > verificationToken.expiresAt) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      // Mark user as verified (you might want to add an emailVerified field to users table)
      // await storage.updateUser(verificationToken.userId, { emailVerified: true });
      
      // Mark token as used
      await storage.markEmailVerificationTokenUsed(verificationToken.id);

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });
}