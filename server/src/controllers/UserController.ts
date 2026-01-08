import { Router, Request, Response } from 'express';
import { UserService } from '../services';
import type { AuthRequest, ProfileUpdateRequest } from '../types/auth.types';

export class UserController {
  constructor(private userService: UserService) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    // All routes are relative to /api/users
    // Profile routes
    router.get('/:userId/profile', this.getProfile.bind(this));
    router.put('/:userId/profile', this.updateProfile.bind(this));

    // Email verification route
    router.post('/:userId/verify-email-complete', this.verifyEmailComplete.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/users/{userId}/profile:
   *   get:
   *     summary: Get user profile
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: User profile data
   *       403:
   *         description: Email not verified
   *       404:
   *         description: User not found
   */
  async getProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const profile = await this.userService.getUserProfile(userId);

      if (!profile) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(profile);
    } catch (error: any) {
      // Handle email not verified error
      if (error.name === 'EMAIL_NOT_VERIFIED') {
        return res.status(403).json({
          error: 'Email not verified',
          needsVerification: true,
          email: error.email,
        });
      }

      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/profile:
   *   put:
   *     summary: Update user profile
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               username:
   *                 type: string
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *       404:
   *         description: User not found
   */
  async updateProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const updates: ProfileUpdateRequest = req.body;

      const updatedProfile = await this.userService.updateUserProfile(userId, updates);

      if (!updatedProfile) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(updatedProfile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Failed to update user profile' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/verify-email-complete:
   *   post:
   *     summary: Complete email verification process (fetches user data from Cognito by userId)
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: Cognito user ID (sub)
   *     responses:
   *       200:
   *         description: Email verification completed
   *       404:
   *         description: User not found in Cognito
   *       500:
   *         description: Server error
   */
  async verifyEmailComplete(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;

      // Backend trusts userId from route (API Gateway validates JWT)
      const result = await this.userService.completeEmailVerification({
        userId,
      });

      res.json(result);
    } catch (error) {
      console.error('Error completing email verification:', error);
      res.status(500).json({ error: 'Failed to complete email verification' });
    }
  }
}
