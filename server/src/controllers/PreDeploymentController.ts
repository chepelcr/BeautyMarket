import { Router, Request, Response } from 'express';
import { PreDeploymentRepository } from '../repositories';

export class PreDeploymentController {
  constructor(private preDeploymentRepository: PreDeploymentRepository) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    router.get('/', this.getPreDeployments.bind(this));
    router.get('/active', this.getActivePreDeployment.bind(this));
    router.delete('/:id', this.deletePreDeployment.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/pre-deployments:
   *   get:
   *     summary: Get all pre-deployments
   *     tags: [Pre-Deployment]
   *     responses:
   *       200:
   *         description: List of pre-deployments
   */
  async getPreDeployments(req: Request, res: Response) {
    try {
      const preDeployments = await this.preDeploymentRepository.getPreDeployments();
      res.json(preDeployments);
    } catch (error) {
      console.error("Error getting pre-deployments:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * @swagger
   * /api/pre-deployments/active:
   *   get:
   *     summary: Get active pre-deployment
   *     tags: [Pre-Deployment]
   *     responses:
   *       200:
   *         description: Active pre-deployment or null
   */
  async getActivePreDeployment(req: Request, res: Response) {
    try {
      const activePreDeployment = await this.preDeploymentRepository.getActivePreDeployment();
      res.json(activePreDeployment || null);
    } catch (error) {
      console.error("Error getting active pre-deployment:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * @swagger
   * /api/pre-deployments/{id}:
   *   delete:
   *     summary: Delete a pre-deployment
   *     tags: [Pre-Deployment]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Pre-deployment deleted successfully
   */
  async deletePreDeployment(req: Request, res: Response) {
    try {
      const success = await this.preDeploymentRepository.deletePreDeployment(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Pre-deployment no encontrado" });
      }
      res.json({ success: true, message: "Pre-deployment eliminado" });
    } catch (error) {
      console.error("Error deleting pre-deployment:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}
