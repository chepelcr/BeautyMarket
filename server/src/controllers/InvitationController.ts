import { Router, Request, Response } from 'express';
import type { IInvitationService } from '../services/InvitationService';

export class InvitationController {
  constructor(
    private invitationService: IInvitationService
  ) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    // Organization-scoped invitation routes
    // (mounted at /api/user/:userId/organization/:orgId/invitations)
    router.get('/', this.getOrganizationInvitations.bind(this));
    router.get('/pending/:email', this.getPendingByEmail.bind(this));
    router.get('/:id', this.getById.bind(this));
    router.post('/', this.create.bind(this));
    router.post('/:id/resend', this.resend.bind(this));
    router.delete('/:id', this.cancel.bind(this));
    router.post('/expire-old', this.expireOld.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/invitations/organization/{organizationId}:
   *   get:
   *     summary: Get all invitations for an organization
   *     tags: [Invitations]
   *     parameters:
   *       - in: path
   *         name: organizationId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of invitations
   */
  async getOrganizationInvitations(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;
      const invitations = await this.invitationService.getOrganizationInvitations(organizationId);
      res.json(invitations);
    } catch (error) {
      console.error('Error fetching organization invitations:', error);
      res.status(500).json({ error: 'Failed to fetch invitations' });
    }
  }

  /**
   * @swagger
   * /api/invitations/pending/{email}:
   *   get:
   *     summary: Get pending invitations for an email
   *     tags: [Invitations]
   *     parameters:
   *       - in: path
   *         name: email
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of pending invitations
   */
  async getPendingByEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;
      const invitations = await this.invitationService.getPendingByEmail(email);
      res.json(invitations);
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
      res.status(500).json({ error: 'Failed to fetch invitations' });
    }
  }

  /**
   * @swagger
   * /api/invitations/token/{token}:
   *   get:
   *     summary: Get invitation by token
   *     tags: [Invitations]
   *     parameters:
   *       - in: path
   *         name: token
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Invitation data
   *       404:
   *         description: Invitation not found
   */
  async getByToken(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const invitation = await this.invitationService.getByToken(token);

      if (!invitation) {
        return res.status(404).json({ error: 'Invitation not found' });
      }

      res.json(invitation);
    } catch (error) {
      console.error('Error fetching invitation by token:', error);
      res.status(500).json({ error: 'Failed to fetch invitation' });
    }
  }

  /**
   * @swagger
   * /api/invitations/{id}:
   *   get:
   *     summary: Get invitation by ID
   *     tags: [Invitations]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Invitation data
   *       404:
   *         description: Invitation not found
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const invitation = await this.invitationService.getById(id);

      if (!invitation) {
        return res.status(404).json({ error: 'Invitation not found' });
      }

      res.json(invitation);
    } catch (error) {
      console.error('Error fetching invitation:', error);
      res.status(500).json({ error: 'Failed to fetch invitation' });
    }
  }

  /**
   * @swagger
   * /api/invitations:
   *   post:
   *     summary: Create a new invitation
   *     tags: [Invitations]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - organizationId
   *               - email
   *               - roleId
   *               - invitedBy
   *             properties:
   *               organizationId:
   *                 type: string
   *               email:
   *                 type: string
   *               roleId:
   *                 type: string
   *               invitedBy:
   *                 type: string
   *     responses:
   *       201:
   *         description: Invitation created
   *       400:
   *         description: Validation error
   */
  async create(req: Request, res: Response) {
    try {
      const { organizationId, email, roleId, invitedBy } = req.body;

      if (!organizationId || !email || !roleId || !invitedBy) {
        return res.status(400).json({
          error: 'organizationId, email, roleId, and invitedBy are required'
        });
      }

      const invitation = await this.invitationService.create({
        organizationId,
        email,
        roleId,
        invitedBy,
      });

      res.status(201).json(invitation);
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      res.status(400).json({ error: error.message || 'Failed to create invitation' });
    }
  }

  /**
   * @swagger
   * /api/invitations/accept/{token}:
   *   post:
   *     summary: Accept an invitation
   *     tags: [Invitations]
   *     parameters:
   *       - in: path
   *         name: token
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *             properties:
   *               userId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Invitation accepted
   *       400:
   *         description: Cannot accept invitation
   *       404:
   *         description: Invitation not found
   */
  async accept(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const accepted = await this.invitationService.accept(token, userId);

      if (!accepted) {
        return res.status(400).json({ error: 'Failed to accept invitation' });
      }

      res.json({ message: 'Invitation accepted successfully' });
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      res.status(400).json({ error: error.message || 'Failed to accept invitation' });
    }
  }

  /**
   * @swagger
   * /api/invitations/{id}/resend:
   *   post:
   *     summary: Resend an invitation
   *     tags: [Invitations]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Invitation resent
   *       400:
   *         description: Cannot resend invitation
   *       404:
   *         description: Invitation not found
   */
  async resend(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const invitation = await this.invitationService.resend(id);

      if (!invitation) {
        return res.status(404).json({ error: 'Invitation not found' });
      }

      res.json({ message: 'Invitation resent successfully', invitation });
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      res.status(400).json({ error: error.message || 'Failed to resend invitation' });
    }
  }

  /**
   * @swagger
   * /api/invitations/{id}:
   *   delete:
   *     summary: Cancel an invitation
   *     tags: [Invitations]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Invitation cancelled
   *       400:
   *         description: Cannot cancel invitation
   *       404:
   *         description: Invitation not found
   */
  async cancel(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const cancelled = await this.invitationService.cancel(id);

      if (!cancelled) {
        return res.status(404).json({ error: 'Invitation not found' });
      }

      res.json({ message: 'Invitation cancelled successfully' });
    } catch (error: any) {
      console.error('Error cancelling invitation:', error);
      res.status(400).json({ error: error.message || 'Failed to cancel invitation' });
    }
  }

  /**
   * @swagger
   * /api/invitations/expire-old:
   *   post:
   *     summary: Expire old invitations
   *     tags: [Invitations]
   *     responses:
   *       200:
   *         description: Number of expired invitations
   */
  async expireOld(req: Request, res: Response) {
    try {
      const count = await this.invitationService.expireOld();
      res.json({ message: `Expired ${count} invitations`, count });
    } catch (error) {
      console.error('Error expiring old invitations:', error);
      res.status(500).json({ error: 'Failed to expire old invitations' });
    }
  }
}
