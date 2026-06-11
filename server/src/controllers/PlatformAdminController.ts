import { Router, Request, Response } from 'express';
import type { AuthRequest } from '../types/auth.types';
import type { IPlatformRBACService } from '../services/PlatformRBACService';
import { statusOf } from '../utils/HttpError';

/**
 * Platform-admin endpoints (Tsuru admin / landing admin consumes).
 * Mounted at /api/admin — attachUserId + requirePlatformAdmin are applied at
 * the router mount in routes.ts (users.role === 'platform_admin').
 */
export class PlatformAdminController {
  constructor(
    private platformRBACService: IPlatformRBACService
  ) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    // Org assignment + org search (P1–P5)
    router.get('/organizations', this.searchOrganizations.bind(this));
    router.get('/organizations/:orgId/modules', this.getOrganizationModules.bind(this));
    router.put('/organizations/:orgId/modules/:moduleId', this.setOrganizationModule.bind(this));
    router.put('/organizations/:orgId/submodules/:submoduleId', this.setOrganizationSubmodule.bind(this));
    router.post('/organizations/:orgId/modules/apply-defaults', this.applyDefaultModules.bind(this));

    // Catalog CRUD (P6–P18)
    router.get('/rbac/modules', this.getModuleCatalog.bind(this));
    router.post('/rbac/modules', this.createModule.bind(this));
    router.put('/rbac/modules/:moduleId', this.updateModule.bind(this));
    router.delete('/rbac/modules/:moduleId', this.deleteModule.bind(this));
    router.post('/rbac/modules/:moduleId/submodules', this.createSubmodule.bind(this));
    router.put('/rbac/submodules/:submoduleId', this.updateSubmodule.bind(this));
    router.delete('/rbac/submodules/:submoduleId', this.deleteSubmodule.bind(this));
    router.get('/rbac/actions', this.getActions.bind(this));
    router.post('/rbac/actions', this.createAction.bind(this));
    router.put('/rbac/actions/:actionId', this.updateAction.bind(this));
    router.delete('/rbac/actions/:actionId', this.deleteAction.bind(this));
    router.get('/rbac/submodules/:submoduleId/actions', this.getSubmoduleActions.bind(this));
    router.put('/rbac/submodules/:submoduleId/actions', this.setSubmoduleActions.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/admin/organizations:
   *   get:
   *     summary: Search/list organizations for the platform admin UI
   *     tags: [PlatformAdmin]
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *       - in: query
   *         name: isActive
   *         schema:
   *           type: boolean
   *     responses:
   *       200:
   *         description: Paged organization list with module counts
   */
  async searchOrganizations(req: Request, res: Response) {
    try {
      const { search, page, pageSize, isActive } = req.query;

      const result = await this.platformRBACService.searchOrganizations({
        search: typeof search === 'string' && search.length > 0 ? search : undefined,
        page: typeof page === 'string' ? parseInt(page, 10) || 1 : 1,
        pageSize: typeof pageSize === 'string' ? parseInt(pageSize, 10) || 20 : 20,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      });

      res.json(result);
    } catch (error: any) {
      console.error('Error searching organizations:', error);
      res.status(500).json({ error: 'Failed to search organizations' });
    }
  }

  /**
   * @swagger
   * /api/admin/organizations/{orgId}/modules:
   *   get:
   *     summary: Get the full-catalog module assignment state for an organization
   *     tags: [PlatformAdmin]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Assignment state per module (incl. unassigned/inactive)
   *       404:
   *         description: Organization not found
   */
  async getOrganizationModules(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const state = await this.platformRBACService.getOrganizationModules(orgId);
      res.json(state);
    } catch (error: any) {
      console.error('Error fetching organization modules:', error);
      res.status(statusOf(error, 500)).json({ error: error.message || 'Failed to fetch organization modules' });
    }
  }

  /**
   * @swagger
   * /api/admin/organizations/{orgId}/modules/{moduleId}:
   *   put:
   *     summary: Assign / unassign / enable / disable a module for an organization
   *     tags: [PlatformAdmin]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - assigned
   *             properties:
   *               assigned:
   *                 type: boolean
   *               isEnabled:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Updated assignment state for the module
   *       404:
   *         description: Organization or module not found
   */
  async setOrganizationModule(req: AuthRequest, res: Response) {
    try {
      const { orgId, moduleId } = req.params;
      const { assigned, isEnabled } = req.body;

      if (typeof assigned !== 'boolean') {
        return res.status(400).json({ error: 'assigned (boolean) is required' });
      }
      if (isEnabled !== undefined && typeof isEnabled !== 'boolean') {
        return res.status(400).json({ error: 'isEnabled must be a boolean' });
      }
      if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const state = await this.platformRBACService.setOrganizationModule(
        orgId,
        moduleId,
        assigned,
        isEnabled,
        req.userId
      );

      res.json(state);
    } catch (error: any) {
      console.error('Error setting organization module:', error);
      res.status(statusOf(error)).json({ error: error.message || 'Failed to set organization module' });
    }
  }

  /**
   * @swagger
   * /api/admin/organizations/{orgId}/submodules/{submoduleId}:
   *   put:
   *     summary: Set a per-org submodule override (null isEnabled deletes the override = inherit)
   *     tags: [PlatformAdmin]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               isEnabled:
   *                 type: boolean
   *                 nullable: true
   *     responses:
   *       200:
   *         description: Updated submodule state
   *       400:
   *         description: Parent module not assigned to the organization
   *       404:
   *         description: Submodule not found
   */
  async setOrganizationSubmodule(req: Request, res: Response) {
    try {
      const { orgId, submoduleId } = req.params;
      const { isEnabled } = req.body;

      if (isEnabled !== null && typeof isEnabled !== 'boolean') {
        return res.status(400).json({ error: 'isEnabled must be a boolean or null' });
      }

      const state = await this.platformRBACService.setOrganizationSubmodule(orgId, submoduleId, isEnabled);
      res.json(state);
    } catch (error: any) {
      console.error('Error setting organization submodule:', error);
      res.status(statusOf(error)).json({ error: error.message || 'Failed to set organization submodule' });
    }
  }

  /**
   * @swagger
   * /api/admin/organizations/{orgId}/modules/apply-defaults:
   *   post:
   *     summary: Apply the default module set to an organization (idempotent)
   *     tags: [PlatformAdmin]
   *     responses:
   *       200:
   *         description: Names of the modules that were added
   *       404:
   *         description: Organization not found
   */
  async applyDefaultModules(req: Request, res: Response) {
    try {
      const { orgId } = req.params;
      const added = await this.platformRBACService.applyDefaultModules(orgId);
      res.json({ added });
    } catch (error: any) {
      console.error('Error applying default modules:', error);
      res.status(statusOf(error)).json({ error: error.message || 'Failed to apply default modules' });
    }
  }

  // =====================================================================
  // Catalog CRUD (P6–P18)
  // =====================================================================

  /**
   * @swagger
   * /api/admin/rbac/modules:
   *   get:
   *     summary: Get the module catalog with submodules and each submodule's available actions
   *     tags: [PlatformAdmin]
   *     parameters:
   *       - in: query
   *         name: includeInactive
   *         schema:
   *           type: boolean
   *     responses:
   *       200:
   *         description: Module catalog
   */
  async getModuleCatalog(req: Request, res: Response) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const catalog = await this.platformRBACService.getModuleCatalog(includeInactive);
      res.json(catalog);
    } catch (error) {
      console.error('Error fetching module catalog:', error);
      res.status(500).json({ error: 'Failed to fetch module catalog' });
    }
  }

  /**
   * @swagger
   * /api/admin/rbac/modules:
   *   post:
   *     summary: Create a module
   *     tags: [PlatformAdmin]
   *     responses:
   *       201:
   *         description: Module created
   *       400:
   *         description: Validation error / duplicate name
   */
  async createModule(req: Request, res: Response) {
    try {
      const { name, displayName, description, icon, isActive, sortOrder } = req.body;

      if (!name || !displayName) {
        return res.status(400).json({ error: 'name and displayName are required' });
      }

      const module = await this.platformRBACService.createModule({
        name,
        displayName,
        description,
        icon,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      });

      res.status(201).json(module);
    } catch (error: any) {
      console.error('Error creating module:', error);
      res.status(statusOf(error)).json({ error: error.message || 'Failed to create module' });
    }
  }

  /**
   * @swagger
   * /api/admin/rbac/modules/{moduleId}:
   *   put:
   *     summary: Update a module (isActive soft-disable preferred over delete)
   *     tags: [PlatformAdmin]
   *     responses:
   *       200:
   *         description: Module updated
   *       404:
   *         description: Module not found
   */
  async updateModule(req: Request, res: Response) {
    try {
      const { moduleId } = req.params;
      const { name, displayName, description, icon, isActive, sortOrder } = req.body;

      const module = await this.platformRBACService.updateModule(moduleId, {
        name,
        displayName,
        description,
        icon,
        isActive,
        sortOrder,
      });

      if (!module) {
        return res.status(404).json({ error: 'Module not found' });
      }

      res.json(module);
    } catch (error: any) {
      console.error('Error updating module:', error);
      res.status(statusOf(error)).json({ error: error.message || 'Failed to update module' });
    }
  }

  /**
   * @swagger
   * /api/admin/rbac/modules/{moduleId}:
   *   delete:
   *     summary: Delete a module (409 when referenced by role_permissions or organization_modules)
   *     tags: [PlatformAdmin]
   *     responses:
   *       200:
   *         description: Module deleted
   *       404:
   *         description: Module not found
   *       409:
   *         description: Module is referenced
   */
  async deleteModule(req: Request, res: Response) {
    try {
      const { moduleId } = req.params;
      const deleted = await this.platformRBACService.deleteModule(moduleId);

      if (!deleted) {
        return res.status(404).json({ error: 'Module not found' });
      }

      res.json({ message: 'Module deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting module:', error);
      res.status(statusOf(error)).json({ error: error.message || 'Failed to delete module' });
    }
  }

  /**
   * @swagger
   * /api/admin/rbac/modules/{moduleId}/submodules:
   *   post:
   *     summary: Create a submodule
   *     tags: [PlatformAdmin]
   *     responses:
   *       201:
   *         description: Submodule created
   *       400:
   *         description: Duplicate name within module
   *       404:
   *         description: Module not found
   */
  async createSubmodule(req: Request, res: Response) {
    try {
      const { moduleId } = req.params;
      const { name, displayName, description, isActive, sortOrder } = req.body;

      if (!name || !displayName) {
        return res.status(400).json({ error: 'name and displayName are required' });
      }

      const submodule = await this.platformRBACService.createSubmodule(moduleId, {
        name,
        displayName,
        description,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      });

      res.status(201).json(submodule);
    } catch (error: any) {
      console.error('Error creating submodule:', error);
      res.status(statusOf(error)).json({ error: error.message || 'Failed to create submodule' });
    }
  }

  /**
   * @swagger
   * /api/admin/rbac/submodules/{submoduleId}:
   *   put:
   *     summary: Update a submodule
   *     tags: [PlatformAdmin]
   *     responses:
   *       200:
   *         description: Submodule updated
   *       404:
   *         description: Submodule not found
   */
  async updateSubmodule(req: Request, res: Response) {
    try {
      const { submoduleId } = req.params;
      const { name, displayName, description, isActive, sortOrder } = req.body;

      const submodule = await this.platformRBACService.updateSubmodule(submoduleId, {
        name,
        displayName,
        description,
        isActive,
        sortOrder,
      });

      if (!submodule) {
        return res.status(404).json({ error: 'Submodule not found' });
      }

      res.json(submodule);
    } catch (error: any) {
      console.error('Error updating submodule:', error);
      res.status(statusOf(error)).json({ error: error.message || 'Failed to update submodule' });
    }
  }

  /**
   * @swagger
   * /api/admin/rbac/submodules/{submoduleId}:
   *   delete:
   *     summary: Delete a submodule (409 when referenced)
   *     tags: [PlatformAdmin]
   *     responses:
   *       200:
   *         description: Submodule deleted
   *       404:
   *         description: Submodule not found
   *       409:
   *         description: Submodule is referenced
   */
  async deleteSubmodule(req: Request, res: Response) {
    try {
      const { submoduleId } = req.params;
      const deleted = await this.platformRBACService.deleteSubmodule(submoduleId);

      if (!deleted) {
        return res.status(404).json({ error: 'Submodule not found' });
      }

      res.json({ message: 'Submodule deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting submodule:', error);
      res.status(statusOf(error)).json({ error: error.message || 'Failed to delete submodule' });
    }
  }

  /**
   * @swagger
   * /api/admin/rbac/actions:
   *   get:
   *     summary: Get the action catalog
   *     tags: [PlatformAdmin]
   *     responses:
   *       200:
   *         description: List of actions
   */
  async getActions(req: Request, res: Response) {
    try {
      const actions = await this.platformRBACService.getAllActions();
      res.json(actions);
    } catch (error) {
      console.error('Error fetching actions:', error);
      res.status(500).json({ error: 'Failed to fetch actions' });
    }
  }

  /**
   * @swagger
   * /api/admin/rbac/actions:
   *   post:
   *     summary: Create an action
   *     tags: [PlatformAdmin]
   *     responses:
   *       201:
   *         description: Action created
   *       400:
   *         description: Validation error / duplicate name
   */
  async createAction(req: Request, res: Response) {
    try {
      const { name, displayName, description } = req.body;

      if (!name || !displayName) {
        return res.status(400).json({ error: 'name and displayName are required' });
      }

      const action = await this.platformRBACService.createAction({ name, displayName, description });
      res.status(201).json(action);
    } catch (error: any) {
      console.error('Error creating action:', error);
      res.status(statusOf(error)).json({ error: error.message || 'Failed to create action' });
    }
  }

  /**
   * @swagger
   * /api/admin/rbac/actions/{actionId}:
   *   put:
   *     summary: Update an action
   *     tags: [PlatformAdmin]
   *     responses:
   *       200:
   *         description: Action updated
   *       404:
   *         description: Action not found
   */
  async updateAction(req: Request, res: Response) {
    try {
      const { actionId } = req.params;
      const { name, displayName, description } = req.body;

      const action = await this.platformRBACService.updateAction(actionId, { name, displayName, description });

      if (!action) {
        return res.status(404).json({ error: 'Action not found' });
      }

      res.json(action);
    } catch (error: any) {
      console.error('Error updating action:', error);
      res.status(statusOf(error)).json({ error: error.message || 'Failed to update action' });
    }
  }

  /**
   * @swagger
   * /api/admin/rbac/actions/{actionId}:
   *   delete:
   *     summary: Delete an action (409 when referenced by role_permissions or submodule_actions)
   *     tags: [PlatformAdmin]
   *     responses:
   *       200:
   *         description: Action deleted
   *       404:
   *         description: Action not found
   *       409:
   *         description: Action is referenced
   */
  async deleteAction(req: Request, res: Response) {
    try {
      const { actionId } = req.params;
      const deleted = await this.platformRBACService.deleteAction(actionId);

      if (!deleted) {
        return res.status(404).json({ error: 'Action not found' });
      }

      res.json({ message: 'Action deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting action:', error);
      res.status(statusOf(error)).json({ error: error.message || 'Failed to delete action' });
    }
  }

  /**
   * @swagger
   * /api/admin/rbac/submodules/{submoduleId}/actions:
   *   get:
   *     summary: Get a submodule's available actions
   *     tags: [PlatformAdmin]
   *     responses:
   *       200:
   *         description: List of actions
   *       404:
   *         description: Submodule not found
   */
  async getSubmoduleActions(req: Request, res: Response) {
    try {
      const { submoduleId } = req.params;
      const actions = await this.platformRBACService.getSubmoduleActions(submoduleId);
      res.json(actions);
    } catch (error: any) {
      console.error('Error fetching submodule actions:', error);
      res.status(statusOf(error, 500)).json({ error: error.message || 'Failed to fetch submodule actions' });
    }
  }

  /**
   * @swagger
   * /api/admin/rbac/submodules/{submoduleId}/actions:
   *   put:
   *     summary: Bulk replace a submodule's available-action set
   *     tags: [PlatformAdmin]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - actionIds
   *             properties:
   *               actionIds:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       200:
   *         description: Submodule actions replaced
   *       400:
   *         description: Unknown actionId
   *       404:
   *         description: Submodule not found
   */
  async setSubmoduleActions(req: Request, res: Response) {
    try {
      const { submoduleId } = req.params;
      const { actionIds } = req.body;

      if (!Array.isArray(actionIds) || actionIds.some((id) => typeof id !== 'string')) {
        return res.status(400).json({ error: 'actionIds must be an array of strings' });
      }

      const { count, orphanedGrants } = await this.platformRBACService.setSubmoduleActions(submoduleId, actionIds);

      const message = orphanedGrants > 0
        ? `Submodule actions updated. ${orphanedGrants} existing role grants reference removed actions — they are now non-grantable and inert at runtime.`
        : 'Submodule actions updated successfully';

      res.json({ message, count });
    } catch (error: any) {
      console.error('Error setting submodule actions:', error);
      res.status(statusOf(error)).json({ error: error.message || 'Failed to set submodule actions' });
    }
  }
}
