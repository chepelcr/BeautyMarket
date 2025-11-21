import { Router, Response } from 'express';
import { DeploymentService } from '../services';
import type { AuthRequest } from '../types/auth.types';

export class DeploymentController {
  constructor(private deploymentService: DeploymentService) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    router.post('/', this.triggerDeployment.bind(this));
    router.get('/status', this.getStatus.bind(this));
    router.get('/history', this.getHistory.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/deployments:
   *   post:
   *     summary: Trigger auto-deployment for organization
   *     tags: [Deployment]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Deployment triggered successfully
   *       400:
   *         description: Organization context required
   *       401:
   *         description: Unauthorized
   */
  async triggerDeployment(req: AuthRequest, res: Response) {
    try {
      const organization = req.organization;

      if (!organization) {
        return res.status(400).json({
          success: false,
          message: "Organization context required. Please select an organization."
        });
      }

      const result = await this.deploymentService.triggerAutoDeployment(organization);
      res.json(result);
    } catch (error) {
      console.error("Auto-deployment error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to start deployment"
      });
    }
  }

  /**
   * @swagger
   * /api/deployments/status:
   *   get:
   *     summary: Get deployment status for organization
   *     tags: [Deployment]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Current deployment status
   *       400:
   *         description: Organization context required
   */
  async getStatus(req: AuthRequest, res: Response) {
    try {
      const organization = req.organization;

      if (!organization) {
        return res.status(400).json({
          error: "Organization context required"
        });
      }

      const status = await this.deploymentService.getDeploymentStatus(organization.id);
      res.json(status);
    } catch (error) {
      console.error("Deployment status error:", error);
      res.status(500).json({ error: "Failed to get deployment status" });
    }
  }

  /**
   * @swagger
   * /api/deployments/history:
   *   get:
   *     summary: Get deployment history for organization
   *     tags: [Deployment]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of deployments
   *       400:
   *         description: Organization context required
   */
  async getHistory(req: AuthRequest, res: Response) {
    try {
      const organization = req.organization;

      if (!organization) {
        return res.status(400).json({
          error: "Organization context required"
        });
      }

      const deployments = await this.deploymentService.getDeploymentHistory(organization.id);
      res.json(deployments);
    } catch (error) {
      console.error("Error fetching deployment history:", error);
      res.status(500).json({ error: "Failed to fetch deployment history" });
    }
  }
}
