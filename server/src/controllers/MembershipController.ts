import { Router, Request, Response } from 'express';
import type { IMembershipService } from '../services/MembershipService';
import type { IRBACService } from '../services/RBACService';

export class MembershipController {
  constructor(
    private membershipService: IMembershipService,
    private rbacService: IRBACService
  ) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    // User-scoped membership routes (mounted at /api/user/:userId/memberships)
    // userId comes from parent route params
    router.get('/organizations', this.getUserOrganizations.bind(this));
    router.get('/default', this.getDefaultOrganization.bind(this));
    router.put('/default/:organizationId', this.setDefaultOrganization.bind(this));
    router.get('/organization/:organizationId/members', this.getOrganizationMembers.bind(this));
    router.get('/organization/:organizationId/count', this.getMemberCount.bind(this));
    router.get('/:memberId', this.getMemberById.bind(this));
    router.post('/', this.addMember.bind(this));
    router.put('/:memberId/role', this.updateMemberRole.bind(this));
    router.delete('/organization/:organizationId', this.removeMember.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/memberships/user/{userId}/organizations:
   *   get:
   *     summary: Get all organizations a user belongs to
   *     tags: [Memberships]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of organizations
   */
  async getUserOrganizations(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const organizations = await this.membershipService.getUserOrganizations(userId);
      res.json(organizations);
    } catch (error) {
      console.error('Error fetching user organizations:', error);
      res.status(500).json({ error: 'Failed to fetch organizations' });
    }
  }

  /**
   * @swagger
   * /api/memberships/user/{userId}/default:
   *   get:
   *     summary: Get user's default organization
   *     tags: [Memberships]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Default organization
   *       404:
   *         description: No organization found
   */
  async getDefaultOrganization(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const organization = await this.membershipService.getDefaultOrganization(userId);

      if (!organization) {
        return res.status(404).json({ error: 'No organization found' });
      }

      res.json(organization);
    } catch (error) {
      console.error('Error fetching default organization:', error);
      res.status(500).json({ error: 'Failed to fetch default organization' });
    }
  }

  /**
   * @swagger
   * /api/memberships/user/{userId}/default/{organizationId}:
   *   put:
   *     summary: Set user's default organization
   *     tags: [Memberships]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: organizationId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Default organization updated
   *       400:
   *         description: Not a member of organization
   */
  async setDefaultOrganization(req: Request, res: Response) {
    try {
      const { userId, organizationId } = req.params;

      const membership = await this.membershipService.setDefaultOrganization(userId, organizationId);

      if (!membership) {
        return res.status(400).json({ error: 'Failed to set default organization' });
      }

      res.json(membership);
    } catch (error: any) {
      console.error('Error setting default organization:', error);
      res.status(400).json({ error: error.message || 'Failed to set default organization' });
    }
  }

  /**
   * @swagger
   * /api/memberships/organization/{organizationId}/members:
   *   get:
   *     summary: Get all members of an organization
   *     tags: [Memberships]
   *     parameters:
   *       - in: path
   *         name: organizationId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of members
   */
  async getOrganizationMembers(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;
      const members = await this.membershipService.getOrganizationMembers(organizationId);
      res.json(members);
    } catch (error) {
      console.error('Error fetching organization members:', error);
      res.status(500).json({ error: 'Failed to fetch members' });
    }
  }

  /**
   * @swagger
   * /api/memberships/organization/{organizationId}/count:
   *   get:
   *     summary: Get member count for an organization
   *     tags: [Memberships]
   *     parameters:
   *       - in: path
   *         name: organizationId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Member count
   */
  async getMemberCount(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;
      const count = await this.membershipService.getMemberCount(organizationId);
      res.json({ count });
    } catch (error) {
      console.error('Error fetching member count:', error);
      res.status(500).json({ error: 'Failed to fetch member count' });
    }
  }

  /**
   * @swagger
   * /api/memberships/{memberId}:
   *   get:
   *     summary: Get member by ID
   *     tags: [Memberships]
   *     parameters:
   *       - in: path
   *         name: memberId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Member data
   *       404:
   *         description: Member not found
   */
  async getMemberById(req: Request, res: Response) {
    try {
      const { memberId } = req.params;
      const member = await this.membershipService.getMemberById(memberId);

      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }

      res.json(member);
    } catch (error) {
      console.error('Error fetching member:', error);
      res.status(500).json({ error: 'Failed to fetch member' });
    }
  }

  /**
   * @swagger
   * /api/memberships:
   *   post:
   *     summary: Add a member to an organization
   *     tags: [Memberships]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - organizationId
   *               - userId
   *               - roleId
   *             properties:
   *               organizationId:
   *                 type: string
   *               userId:
   *                 type: string
   *               roleId:
   *                 type: string
   *               invitedBy:
   *                 type: string
   *     responses:
   *       201:
   *         description: Member added
   *       400:
   *         description: Validation error
   */
  async addMember(req: Request, res: Response) {
    try {
      const { organizationId, userId, roleId, invitedBy } = req.body;

      if (!organizationId || !userId || !roleId) {
        return res.status(400).json({ error: 'organizationId, userId, and roleId are required' });
      }

      const member = await this.membershipService.addMember({
        organizationId,
        userId,
        roleId,
        invitedBy,
        isDefault: false,
      });

      res.status(201).json(member);
    } catch (error: any) {
      console.error('Error adding member:', error);
      res.status(400).json({ error: error.message || 'Failed to add member' });
    }
  }

  /**
   * @swagger
   * /api/memberships/{memberId}/role:
   *   put:
   *     summary: Update member's role
   *     tags: [Memberships]
   *     parameters:
   *       - in: path
   *         name: memberId
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
   *               - roleId
   *               - updatedBy
   *             properties:
   *               roleId:
   *                 type: string
   *               updatedBy:
   *                 type: string
   *     responses:
   *       200:
   *         description: Role updated
   *       400:
   *         description: Cannot update role
   *       404:
   *         description: Member not found
   */
  async updateMemberRole(req: Request, res: Response) {
    try {
      const { memberId } = req.params;
      const { roleId, updatedBy } = req.body;

      if (!roleId || !updatedBy) {
        return res.status(400).json({ error: 'roleId and updatedBy are required' });
      }

      const member = await this.membershipService.updateMemberRole(memberId, roleId, updatedBy);

      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }

      res.json(member);
    } catch (error: any) {
      console.error('Error updating member role:', error);
      res.status(400).json({ error: error.message || 'Failed to update role' });
    }
  }

  /**
   * @swagger
   * /api/memberships/user/{userId}/organization/{organizationId}:
   *   delete:
   *     summary: Remove a member from an organization
   *     tags: [Memberships]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: organizationId
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
   *               - removedBy
   *             properties:
   *               removedBy:
   *                 type: string
   *     responses:
   *       200:
   *         description: Member removed
   *       400:
   *         description: Cannot remove member
   *       404:
   *         description: Member not found
   */
  async removeMember(req: Request, res: Response) {
    try {
      const { userId, organizationId } = req.params;
      const { removedBy } = req.body;

      if (!removedBy) {
        return res.status(400).json({ error: 'removedBy is required' });
      }

      const removed = await this.membershipService.removeMember(userId, organizationId, removedBy);

      if (!removed) {
        return res.status(404).json({ error: 'Member not found' });
      }

      res.json({ message: 'Member removed successfully' });
    } catch (error: any) {
      console.error('Error removing member:', error);
      res.status(400).json({ error: error.message || 'Failed to remove member' });
    }
  }
}
