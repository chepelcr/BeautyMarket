import { Router, Request, Response } from 'express';
import type { IOrganizationService } from '../services/OrganizationService';
import type { IRBACService } from '../services/RBACService';
import type { IOrganizationInfrastructureService } from '../services/OrganizationInfrastructureService';

export class OrganizationController {
  constructor(
    private organizationService: IOrganizationService,
    private rbacService: IRBACService,
    private infrastructureService: IOrganizationInfrastructureService
  ) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    // User-scoped organization routes (mounted at /api/user/:userId/organizations)
    router.get('/', this.getAll.bind(this));
    router.get('/:id', this.getById.bind(this));
    router.post('/', this.create.bind(this));
    router.put('/:id', this.update.bind(this));
    router.put('/:id/settings', this.updateSettings.bind(this));
    router.delete('/:id', this.delete.bind(this));

    // Infrastructure endpoints
    router.post('/:id/provision', this.provisionInfrastructure.bind(this));
    router.delete('/:id/deprovision', this.deprovisionInfrastructure.bind(this));
    router.post('/:id/custom-domain', this.requestCustomDomain.bind(this));
    router.get('/:id/domain-status', this.getDomainStatus.bind(this));
    router.post('/:id/attach-custom-domain', this.attachCustomDomain.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/organizations:
   *   get:
   *     summary: Get all organizations
   *     tags: [Organizations]
   *     responses:
   *       200:
   *         description: List of organizations
   */
  async getAll(req: Request, res: Response) {
    try {
      const organizations = await this.organizationService.getAll();
      res.json(organizations);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      res.status(500).json({ error: 'Failed to fetch organizations' });
    }
  }

  /**
   * @swagger
   * /api/organizations/{id}:
   *   get:
   *     summary: Get organization by ID
   *     tags: [Organizations]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Organization data
   *       404:
   *         description: Organization not found
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const organization = await this.organizationService.getById(id);

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      res.json(organization);
    } catch (error) {
      console.error('Error fetching organization:', error);
      res.status(500).json({ error: 'Failed to fetch organization' });
    }
  }

  /**
   * @swagger
   * /api/organizations/by-slug/{slug}:
   *   get:
   *     summary: Get organization by slug
   *     tags: [Organizations]
   *     parameters:
   *       - in: path
   *         name: slug
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Organization data
   *       404:
   *         description: Organization not found
   */
  async getBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const organization = await this.organizationService.getBySlug(slug);

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      res.json(organization);
    } catch (error) {
      console.error('Error fetching organization by slug:', error);
      res.status(500).json({ error: 'Failed to fetch organization' });
    }
  }

  /**
   * @swagger
   * /api/organizations/by-subdomain/{subdomain}:
   *   get:
   *     summary: Get organization by subdomain
   *     tags: [Organizations]
   *     parameters:
   *       - in: path
   *         name: subdomain
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Organization data
   *       404:
   *         description: Organization not found
   */
  async getBySubdomain(req: Request, res: Response) {
    try {
      const { subdomain } = req.params;
      const organization = await this.organizationService.getBySubdomain(subdomain);

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      res.json(organization);
    } catch (error) {
      console.error('Error fetching organization by subdomain:', error);
      res.status(500).json({ error: 'Failed to fetch organization' });
    }
  }

  /**
   * @swagger
   * /api/organizations/check-slug/{slug}:
   *   get:
   *     summary: Check if slug is available
   *     tags: [Organizations]
   *     parameters:
   *       - in: path
   *         name: slug
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Availability status
   */
  async checkSlugAvailable(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const available = await this.organizationService.checkSlugAvailable(slug);
      res.json({ available });
    } catch (error) {
      console.error('Error checking slug availability:', error);
      res.status(500).json({ error: 'Failed to check slug availability' });
    }
  }

  /**
   * @swagger
   * /api/organizations/check-subdomain/{subdomain}:
   *   get:
   *     summary: Check if subdomain is available
   *     tags: [Organizations]
   *     parameters:
   *       - in: path
   *         name: subdomain
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Availability status
   */
  async checkSubdomainAvailable(req: Request, res: Response) {
    try {
      const { subdomain } = req.params;
      const available = await this.organizationService.checkSubdomainAvailable(subdomain);
      res.json({ available });
    } catch (error) {
      console.error('Error checking subdomain availability:', error);
      res.status(500).json({ error: 'Failed to check subdomain availability' });
    }
  }

  /**
   * @swagger
   * /api/organizations:
   *   post:
   *     summary: Create a new organization
   *     tags: [Organizations]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - slug
   *               - ownerId
   *             properties:
   *               name:
   *                 type: string
   *               slug:
   *                 type: string
   *               subdomain:
   *                 type: string
   *               ownerId:
   *                 type: string
   *     responses:
   *       201:
   *         description: Organization created
   *       400:
   *         description: Validation error
   */
  async create(req: Request, res: Response) {
    try {
      const { ownerId, ...data } = req.body;

      if (!ownerId) {
        return res.status(400).json({ error: 'Owner ID is required' });
      }

      if (!data.name || !data.slug) {
        return res.status(400).json({ error: 'Name and slug are required' });
      }

      const organization = await this.organizationService.create(data, ownerId);
      res.status(201).json(organization);
    } catch (error: any) {
      console.error('Error creating organization:', error);
      res.status(400).json({ error: error.message || 'Failed to create organization' });
    }
  }

  /**
   * @swagger
   * /api/organizations/{id}:
   *   put:
   *     summary: Update an organization
   *     tags: [Organizations]
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
   *               slug:
   *                 type: string
   *               subdomain:
   *                 type: string
   *     responses:
   *       200:
   *         description: Organization updated
   *       404:
   *         description: Organization not found
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const organization = await this.organizationService.update(id, data);

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      res.json(organization);
    } catch (error: any) {
      console.error('Error updating organization:', error);
      res.status(400).json({ error: error.message || 'Failed to update organization' });
    }
  }

  /**
   * @swagger
   * /api/organizations/{id}/settings:
   *   put:
   *     summary: Update organization settings
   *     tags: [Organizations]
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
   *     responses:
   *       200:
   *         description: Settings updated
   *       404:
   *         description: Organization not found
   */
  async updateSettings(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const settings = req.body;

      const organization = await this.organizationService.updateSettings(id, settings);

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      res.json(organization);
    } catch (error: any) {
      console.error('Error updating organization settings:', error);
      res.status(400).json({ error: error.message || 'Failed to update settings' });
    }
  }

  /**
   * @swagger
   * /api/organizations/{id}:
   *   delete:
   *     summary: Delete an organization
   *     tags: [Organizations]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Organization deleted
   *       400:
   *         description: Cannot delete organization
   *       404:
   *         description: Organization not found
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const deleted = await this.organizationService.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      res.json({ message: 'Organization deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting organization:', error);
      res.status(400).json({ error: error.message || 'Failed to delete organization' });
    }
  }

  /**
   * @swagger
   * /api/organizations/{id}/provision:
   *   post:
   *     summary: Provision AWS infrastructure for organization
   *     tags: [Organizations]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Infrastructure provisioned
   *       404:
   *         description: Organization not found
   *       500:
   *         description: Provisioning failed
   */
  async provisionInfrastructure(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const organization = await this.organizationService.getById(id);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      const result = await this.infrastructureService.provisionInfrastructure(organization);

      if (!result.success) {
        return res.status(500).json({ error: result.error || 'Provisioning failed' });
      }

      res.json({
        message: 'Infrastructure provisioned successfully',
        ...result,
      });
    } catch (error: any) {
      console.error('Error provisioning infrastructure:', error);
      res.status(500).json({ error: error.message || 'Failed to provision infrastructure' });
    }
  }

  /**
   * @swagger
   * /api/organizations/{id}/deprovision:
   *   delete:
   *     summary: Deprovision AWS infrastructure for organization
   *     tags: [Organizations]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Infrastructure deprovisioned
   *       404:
   *         description: Organization not found
   *       500:
   *         description: Deprovisioning failed
   */
  async deprovisionInfrastructure(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const organization = await this.organizationService.getById(id);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      const success = await this.infrastructureService.deprovisionInfrastructure(organization);

      if (!success) {
        return res.status(500).json({ error: 'Deprovisioning failed' });
      }

      res.json({ message: 'Infrastructure deprovisioned successfully' });
    } catch (error: any) {
      console.error('Error deprovisioning infrastructure:', error);
      res.status(500).json({ error: error.message || 'Failed to deprovision infrastructure' });
    }
  }

  /**
   * @swagger
   * /api/organizations/{id}/custom-domain:
   *   post:
   *     summary: Request SSL certificate for custom domain
   *     tags: [Organizations]
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
   *             required:
   *               - customDomain
   *             properties:
   *               customDomain:
   *                 type: string
   *     responses:
   *       200:
   *         description: Certificate requested with validation records
   *       400:
   *         description: Invalid domain
   *       404:
   *         description: Organization not found
   */
  async requestCustomDomain(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { customDomain } = req.body;

      if (!customDomain) {
        return res.status(400).json({ error: 'Custom domain is required' });
      }

      const organization = await this.organizationService.getById(id);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      const result = await this.infrastructureService.requestCustomDomainCertificate(id, customDomain);

      if (!result.success) {
        return res.status(400).json({ error: result.error || 'Failed to request certificate' });
      }

      res.json({
        message: 'Certificate requested. Add the following DNS records to validate:',
        certificateArn: result.certificateArn,
        validationRecords: result.validationRecords,
      });
    } catch (error: any) {
      console.error('Error requesting custom domain certificate:', error);
      res.status(500).json({ error: error.message || 'Failed to request certificate' });
    }
  }

  /**
   * @swagger
   * /api/organizations/{id}/domain-status:
   *   get:
   *     summary: Get domain/certificate status
   *     tags: [Organizations]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Domain status
   *       404:
   *         description: Organization not found
   */
  async getDomainStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const organization = await this.organizationService.getById(id);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      let certificateStatus = null;
      if (organization.acmCertificateArn) {
        certificateStatus = await this.infrastructureService.checkCertificateStatus(
          organization.acmCertificateArn
        );
      }

      res.json({
        subdomain: organization.subdomain,
        customDomain: organization.customDomain,
        domainVerified: organization.domainVerified,
        infrastructureStatus: organization.infrastructureStatus,
        cloudfrontDomain: organization.cloudfrontDomain,
        certificateStatus,
        validationRecords: organization.acmValidationRecords,
      });
    } catch (error: any) {
      console.error('Error fetching domain status:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch domain status' });
    }
  }

  /**
   * @swagger
   * /api/organizations/{id}/attach-custom-domain:
   *   post:
   *     summary: Attach verified custom domain to CloudFront
   *     tags: [Organizations]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Custom domain attached
   *       400:
   *         description: Certificate not ready
   *       404:
   *         description: Organization not found
   */
  async attachCustomDomain(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const organization = await this.organizationService.getById(id);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      if (!organization.customDomain || !organization.acmCertificateArn) {
        return res.status(400).json({ error: 'No custom domain certificate requested' });
      }

      const success = await this.infrastructureService.attachCustomDomainToDistribution(id);

      if (!success) {
        return res.status(400).json({ error: 'Failed to attach custom domain' });
      }

      res.json({
        message: 'Custom domain attached successfully. Point your domain CNAME to:',
        cloudfrontDomain: organization.cloudfrontDomain,
      });
    } catch (error: any) {
      console.error('Error attaching custom domain:', error);
      res.status(400).json({ error: error.message || 'Failed to attach custom domain' });
    }
  }
}
