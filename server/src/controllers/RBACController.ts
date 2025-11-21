import { Router, Request, Response } from 'express';
import type { IRBACService } from '../services/RBACService';

export class RBACController {
  constructor(
    private rbacService: IRBACService
  ) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    // Organization-scoped RBAC routes
    // (mounted at /api/user/:userId/organization/:orgId/rbac)

    // Roles
    router.get('/roles', this.getSystemRoles.bind(this));
    router.get('/roles/organization', this.getOrganizationRoles.bind(this));
    router.get('/roles/:id', this.getRoleById.bind(this));
    router.post('/roles', this.createRole.bind(this));
    router.put('/roles/:id', this.updateRole.bind(this));
    router.delete('/roles/:id', this.deleteRole.bind(this));

    // Modules and Actions
    router.get('/modules', this.getAllModules.bind(this));
    router.get('/actions', this.getAllActions.bind(this));

    // Permissions
    router.get('/roles/:roleId/permissions', this.getRolePermissions.bind(this));
    router.put('/roles/:roleId/permissions', this.setRolePermissions.bind(this));

    // Permission checks
    router.post('/check-permission', this.checkPermission.bind(this));
    router.get('/user-role', this.getUserRole.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/rbac/roles:
   *   get:
   *     summary: Get all system roles
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
   * /api/rbac/roles/organization/{organizationId}:
   *   get:
   *     summary: Get roles for an organization (includes system roles)
   *     tags: [RBAC]
   *     parameters:
   *       - in: path
   *         name: organizationId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of roles
   */
  async getOrganizationRoles(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;
      const roles = await this.rbacService.getRolesByOrganization(organizationId);
      res.json(roles);
    } catch (error) {
      console.error('Error fetching organization roles:', error);
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  }

  /**
   * @swagger
   * /api/rbac/roles/{id}:
   *   get:
   *     summary: Get role by ID
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
      const { id } = req.params;
      const role = await this.rbacService.getRoleById(id);

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
   * /api/rbac/roles:
   *   post:
   *     summary: Create a new role
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
   *               description:
   *                 type: string
   *               organizationId:
   *                 type: string
   *     responses:
   *       201:
   *         description: Role created
   *       400:
   *         description: Validation error
   */
  async createRole(req: Request, res: Response) {
    try {
      const { name, description, organizationId } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const role = await this.rbacService.createRole({
        name,
        description,
        organizationId,
        isSystem: false,
      });

      res.status(201).json(role);
    } catch (error: any) {
      console.error('Error creating role:', error);
      res.status(400).json({ error: error.message || 'Failed to create role' });
    }
  }

  /**
   * @swagger
   * /api/rbac/roles/{id}:
   *   put:
   *     summary: Update a role
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
   *               description:
   *                 type: string
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
      const { id } = req.params;
      const data = req.body;

      const role = await this.rbacService.updateRole(id, data);

      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      res.json(role);
    } catch (error: any) {
      console.error('Error updating role:', error);
      res.status(400).json({ error: error.message || 'Failed to update role' });
    }
  }

  /**
   * @swagger
   * /api/rbac/roles/{id}:
   *   delete:
   *     summary: Delete a role
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
   */
  async deleteRole(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const deleted = await this.rbacService.deleteRole(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Role not found' });
      }

      res.json({ message: 'Role deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting role:', error);
      res.status(400).json({ error: error.message || 'Failed to delete role' });
    }
  }

  /**
   * @swagger
   * /api/rbac/modules:
   *   get:
   *     summary: Get all modules with submodules
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
   * /api/rbac/actions:
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
   * /api/rbac/roles/{roleId}/permissions:
   *   get:
   *     summary: Get permissions for a role
   *     tags: [RBAC]
   *     parameters:
   *       - in: path
   *         name: roleId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of permissions
   */
  async getRolePermissions(req: Request, res: Response) {
    try {
      const { roleId } = req.params;
      const permissions = await this.rbacService.getRolePermissions(roleId);
      res.json(permissions);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      res.status(500).json({ error: 'Failed to fetch permissions' });
    }
  }

  /**
   * @swagger
   * /api/rbac/roles/{roleId}/permissions:
   *   put:
   *     summary: Set permissions for a role
   *     tags: [RBAC]
   *     parameters:
   *       - in: path
   *         name: roleId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               type: object
   *               properties:
   *                 moduleId:
   *                   type: string
   *                 actionId:
   *                   type: string
   *                 submoduleId:
   *                   type: string
   *     responses:
   *       200:
   *         description: Permissions updated
   *       400:
   *         description: Cannot modify system role permissions
   */
  async setRolePermissions(req: Request, res: Response) {
    try {
      const { roleId } = req.params;
      const permissions = req.body;

      if (!Array.isArray(permissions)) {
        return res.status(400).json({ error: 'Permissions must be an array' });
      }

      await this.rbacService.setRolePermissions(roleId, permissions);

      res.json({ message: 'Permissions updated successfully' });
    } catch (error: any) {
      console.error('Error setting role permissions:', error);
      res.status(400).json({ error: error.message || 'Failed to set permissions' });
    }
  }

  /**
   * @swagger
   * /api/rbac/check-permission:
   *   post:
   *     summary: Check if user has permission
   *     tags: [RBAC]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *               - organizationId
   *               - module
   *               - action
   *             properties:
   *               userId:
   *                 type: string
   *               organizationId:
   *                 type: string
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
      const { userId, organizationId, module, action, submodule } = req.body;

      if (!userId || !organizationId || !module || !action) {
        return res.status(400).json({
          error: 'userId, organizationId, module, and action are required'
        });
      }

      const hasPermission = await this.rbacService.hasPermission(
        userId,
        organizationId,
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
   * /api/rbac/user/{userId}/organization/{organizationId}/role:
   *   get:
   *     summary: Get user's role in an organization
   *     tags: [RBAC]
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
   *         description: User's role
   *       404:
   *         description: User not a member of organization
   */
  async getUserRole(req: Request, res: Response) {
    try {
      const { userId, organizationId } = req.params;

      const role = await this.rbacService.getUserRole(userId, organizationId);

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
