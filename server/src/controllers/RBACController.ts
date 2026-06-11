import { Router, Request, Response } from 'express';
import type { IRBACService, PermissionGrantDto } from '../services/RBACService';
import type { IMembershipService } from '../services/MembershipService';
import type { createPermissionMiddleware } from '../middleware/permissions';
import { statusOf } from '../utils/HttpError';

type PermissionMiddleware = ReturnType<typeof createPermissionMiddleware>;

export class RBACController {
  constructor(
    private rbacService: IRBACService,
    private membershipService: IMembershipService,
    private guards: PermissionMiddleware
  ) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    const readRoles = this.guards.requirePermission('admin', 'read', 'roles');
    const membership = this.guards.requireMembership();

    // Organization-scoped RBAC routes
    // (mounted at /api/users/:userId/organization/:orgId/rbac)

    // Effective permissions / availability (O1, O2)
    router.get('/my-permissions', membership, this.getMyPermissions.bind(this));
    router.get('/available-matrix', readRoles, this.getAvailableMatrix.bind(this));

    // Roles (O3–O8)
    router.get('/roles', readRoles, this.getSystemRoles.bind(this));
    router.get('/roles/organization', readRoles, this.getOrganizationRoles.bind(this));
    router.get('/roles/:id', readRoles, this.getRoleById.bind(this));
    router.post('/roles', this.guards.requirePermission('admin', 'create', 'roles'), this.createRole.bind(this));
    router.put('/roles/:id', this.guards.requirePermission('admin', 'update', 'roles'), this.updateRole.bind(this));
    router.delete('/roles/:id', this.guards.requirePermission('admin', 'delete', 'roles'), this.deleteRole.bind(this));

    // Modules and Actions (O12, O13 — global catalogs, back-compat; POS uses O2)
    router.get('/modules', readRoles, this.getAllModules.bind(this));
    router.get('/actions', readRoles, this.getAllActions.bind(this));

    // Permissions (O9, O10)
    router.get('/roles/:id/permissions', readRoles, this.getRolePermissions.bind(this));
    router.put('/roles/:id/permissions', this.guards.requirePermission('admin', 'update', 'roles'), this.setRolePermissions.bind(this));

    // Member role assignment (O11)
    router.put('/members/:memberId/role', this.guards.requirePermission('admin', 'update', 'members'), this.assignMemberRole.bind(this));

    // Permission checks (O14, O15 — membership-only self checks)
    router.post('/check-permission', membership, this.checkPermission.bind(this));
    router.get('/user-role', membership, this.getUserRole.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/users/{userId}/organization/{orgId}/rbac/my-permissions:
   *   get:
   *     summary: Get the caller's effective permissions in this organization (nav/action gating)
   *     tags: [RBAC]
   *     responses:
   *       200:
   *         description: Effective role, modules, and flattened permissions
   *       403:
   *         description: Not a member of this organization
   */
  async getMyPermissions(req: Request, res: Response) {
    try {
      const { userId, orgId } = req.params;
      const result = await this.rbacService.getMyPermissions(userId, orgId);

      if (!result) {
        return res.status(403).json({ error: 'You are not a member of this organization' });
      }

      res.json(result);
    } catch (error) {
      console.error('Error fetching my permissions:', error);
      res.status(500).json({ error: 'Failed to fetch permissions' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organization/{orgId}/rbac/available-matrix:
   *   get:
   *     summary: Get the org-filtered modules → submodules → grantable actions matrix
   *     tags: [RBAC]
   *     responses:
   *       200:
   *         description: Available matrix for the role-permission UI
   */
  async getAvailableMatrix(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const matrix = await this.rbacService.getAvailableMatrix(orgId);
      res.json(matrix);
    } catch (error) {
      console.error('Error fetching available matrix:', error);
      res.status(500).json({ error: 'Failed to fetch available matrix' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organization/{orgId}/rbac/roles:
   *   get:
   *     summary: Get all system role templates (platform_admin excluded)
   *     tags: [RBAC]
   *     responses:
   *       200:
   *         description: List of system roles
   */
  async getSystemRoles(req: Request, res: Response) {
    try {
      const roles = await this.rbacService.getSystemRoles();
      res.json(roles);
    } catch (error) {
      console.error('Error fetching system roles:', error);
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organization/{orgId}/rbac/roles/organization:
   *   get:
   *     summary: Get roles for an organization (includes system roles)
   *     tags: [RBAC]
   *     responses:
   *       200:
   *         description: List of roles
   */
  async getOrganizationRoles(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const roles = await this.rbacService.getRolesByOrganization(orgId);
      res.json(roles);
    } catch (error) {
      console.error('Error fetching organization roles:', error);
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organization/{orgId}/rbac/roles/{id}:
   *   get:
   *     summary: Get role by ID (404 unless owned by the org or a system template)
   *     tags: [RBAC]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Role data
   *       404:
   *         description: Role not found
   */
  async getRoleById(req: Request, res: Response) {
    try {
      const { id, orgId } = req.params;
      const role = await this.rbacService.getRoleForOrg(id, orgId);

      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      res.json(role);
    } catch (error) {
      console.error('Error fetching role:', error);
      res.status(500).json({ error: 'Failed to fetch role' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organization/{orgId}/rbac/roles:
   *   post:
   *     summary: Create a new organization role (organizationId forced from the path)
   *     tags: [RBAC]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *               displayName:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Role created
   *       400:
   *         description: Validation error
   */
  async createRole(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const { name, displayName, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      // organizationId FORCED from the :orgId path param (org-spoof hole fix)
      const role = await this.rbacService.createOrgRole(orgId, { name, displayName, description });

      res.status(201).json(role);
    } catch (error: any) {
      console.error('Error creating role:', error);
      res.status(statusOf(error)).json({ error: error.message || 'Failed to create role' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organization/{orgId}/rbac/roles/{id}:
   *   put:
   *     summary: Update an organization role
   *     tags: [RBAC]
   *     parameters:
   *       - in: path
   *         name: id
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
   *               name:
   *                 type: string
   *               displayName:
   *                 type: string
   *               description:
   *                 type: string
   *               isActive:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Role updated
   *       400:
   *         description: Cannot update system role
   *       404:
   *         description: Role not found
   */
  async updateRole(req: Request, res: Response) {
    try {
      const { id, orgId } = req.params;
      const { name, displayName, description, isActive } = req.body;

      const role = await this.rbacService.updateOrgRole(id, orgId, { name, displayName, description, isActive });

      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      res.json(role);
    } catch (error: any) {
      console.error('Error updating role:', error);
      res.status(statusOf(error)).json({ error: error.message || 'Failed to update role' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organization/{orgId}/rbac/roles/{id}:
   *   delete:
   *     summary: Delete an organization role
   *     tags: [RBAC]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Role deleted
   *       400:
   *         description: Cannot delete system role
   *       404:
   *         description: Role not found
   *       409:
   *         description: Role is assigned to organization members
   */
  async deleteRole(req: Request, res: Response) {
    try {
      const { id, orgId } = req.params;

      const deleted = await this.rbacService.deleteOrgRole(id, orgId);

      if (!deleted) {
        return res.status(404).json({ error: 'Role not found' });
      }

      res.json({ message: 'Role deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting role:', error);
      res.status(statusOf(error)).json({ error: error.message || 'Failed to delete role' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organization/{orgId}/rbac/modules:
   *   get:
   *     summary: Get all modules with submodules (global catalog — use available-matrix for the role UI)
   *     tags: [RBAC]
   *     responses:
   *       200:
   *         description: List of modules
   */
  async getAllModules(req: Request, res: Response) {
    try {
      const modules = await this.rbacService.getAllModules();
      res.json(modules);
    } catch (error) {
      console.error('Error fetching modules:', error);
      res.status(500).json({ error: 'Failed to fetch modules' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organization/{orgId}/rbac/actions:
   *   get:
   *     summary: Get all available actions
   *     tags: [RBAC]
   *     responses:
   *       200:
   *         description: List of actions
   */
  async getAllActions(req: Request, res: Response) {
    try {
      const actions = await this.rbacService.getAllActions();
      res.json(actions);
    } catch (error) {
      console.error('Error fetching actions:', error);
      res.status(500).json({ error: 'Failed to fetch actions' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organization/{orgId}/rbac/roles/{id}/permissions:
   *   get:
   *     summary: Get permissions for a role
   *     tags: [RBAC]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of permission grant rows
   *       404:
   *         description: Role not found
   */
  async getRolePermissions(req: Request, res: Response) {
    try {
      const { id: roleId, orgId } = req.params;
      const permissions = await this.rbacService.getRolePermissionsForOrg(roleId, orgId);

      if (!permissions) {
        return res.status(404).json({ error: 'Role not found' });
      }

      res.json(permissions);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      res.status(500).json({ error: 'Failed to fetch permissions' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organization/{orgId}/rbac/roles/{id}/permissions:
   *   put:
   *     summary: Bulk replace permissions for an org role (subset-validated against the org's available matrix)
   *     tags: [RBAC]
   *     parameters:
   *       - in: path
   *         name: id
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
   *               permissions:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     moduleId:
   *                       type: string
   *                     submoduleId:
   *                       type: string
   *                       nullable: true
   *                     actionId:
   *                       type: string
   *     responses:
   *       200:
   *         description: Permissions updated
   *       400:
   *         description: Validation error (offending tuples listed) or system role
   *       404:
   *         description: Role not found
   */
  async setRolePermissions(req: Request, res: Response) {
    try {
      const { id: roleId, orgId } = req.params;

      // Envelope { permissions: [...] }; legacy bare array accepted for back-compat
      const permissions: PermissionGrantDto[] | undefined = Array.isArray(req.body)
        ? req.body
        : req.body?.permissions;

      if (!Array.isArray(permissions)) {
        return res.status(400).json({ error: 'Permissions must be an array' });
      }

      const count = await this.rbacService.setRolePermissionsForOrg(roleId, orgId, permissions);

      res.json({ message: 'Permissions updated successfully', count });
    } catch (error: any) {
      console.error('Error setting role permissions:', error);
      res.status(statusOf(error)).json({ error: error.message || 'Failed to set permissions' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organization/{orgId}/rbac/members/{memberId}/role:
   *   put:
   *     summary: Assign a role to an organization member (same-org or system roles only)
   *     tags: [RBAC]
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
   *             properties:
   *               roleId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Member role updated
   *       400:
   *         description: Role not assignable (cross-org, inactive, platform_admin, or last owner)
   *       404:
   *         description: Member not found in this organization
   */
  async assignMemberRole(req: Request, res: Response) {
    try {
      const { memberId, orgId, userId } = req.params;
      const { roleId } = req.body;

      if (!roleId) {
        return res.status(400).json({ error: 'roleId is required' });
      }

      const member = await this.membershipService.updateMemberRoleScoped(memberId, roleId, orgId, userId);

      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }

      res.json(member);
    } catch (error: any) {
      console.error('Error assigning member role:', error);
      res.status(statusOf(error)).json({ error: error.message || 'Failed to update role' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organization/{orgId}/rbac/check-permission:
   *   post:
   *     summary: Check if the caller has a permission (userId/orgId taken from the path)
   *     tags: [RBAC]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - module
   *               - action
   *             properties:
   *               module:
   *                 type: string
   *               action:
   *                 type: string
   *               submodule:
   *                 type: string
   *     responses:
   *       200:
   *         description: Permission check result
   */
  async checkPermission(req: Request, res: Response) {
    try {
      // userId/organizationId FORCED from path params (body-driven probe hole fix)
      const { userId, orgId } = req.params;
      const { module, action, submodule } = req.body;

      if (!module || !action) {
        return res.status(400).json({
          error: 'module and action are required'
        });
      }

      const hasPermission = await this.rbacService.hasPermission(
        userId,
        orgId,
        { module, action, submodule }
      );

      res.json({ hasPermission });
    } catch (error) {
      console.error('Error checking permission:', error);
      res.status(500).json({ error: 'Failed to check permission' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organization/{orgId}/rbac/user-role:
   *   get:
   *     summary: Get the caller's role in this organization
   *     tags: [RBAC]
   *     responses:
   *       200:
   *         description: User's role
   *       404:
   *         description: User not a member of organization
   */
  async getUserRole(req: Request, res: Response) {
    try {
      const { userId, orgId } = req.params;

      const role = await this.rbacService.getUserRole(userId, orgId);

      if (!role) {
        return res.status(404).json({ error: 'User is not a member of this organization' });
      }

      res.json(role);
    } catch (error) {
      console.error('Error fetching user role:', error);
      res.status(500).json({ error: 'Failed to fetch user role' });
    }
  }
}
