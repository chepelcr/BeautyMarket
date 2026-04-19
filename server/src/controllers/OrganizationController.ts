import { Router, Request, Response } from 'express';
import type { IOrganizationService } from '../services/OrganizationService';
import type { IRBACService } from '../services/RBACService';
import type { TemplateCloneService } from '../services/TemplateCloneService';
import type { OrganizationMemberRepository } from '../repositories/OrganizationMemberRepository';

export class OrganizationController {
  constructor(
    private organizationService: IOrganizationService,
    private rbacService: IRBACService,
    private templateCloneService: TemplateCloneService,
    private memberRepo: OrganizationMemberRepository
  ) {}

  getRouter(): Router {
    const router = Router({ mergeParams: true });

    // Public lookup endpoints (must be before /:id to avoid route conflicts)
    router.get('/by-slug/:slug', this.getBySlug.bind(this));
    router.get('/by-subdomain/:subdomain', this.getBySubdomain.bind(this));
    router.get('/check-slug/:slug', this.checkSlugAvailable.bind(this));
    router.get('/check-subdomain/:subdomain', this.checkSubdomainAvailable.bind(this));

    // Organization CRUD
    router.get('/', this.getAll.bind(this));
    router.get('/:id', this.getById.bind(this));
    router.post('/', this.create.bind(this));
    router.put('/:id', this.update.bind(this));
    router.put('/:id/settings', this.updateSettings.bind(this));
    router.delete('/:id', this.delete.bind(this));

    // Onboarding flow endpoints
    router.post('/:id/onboarding/step2', this.completeOnboardingStep2.bind(this));
    router.post('/:id/onboarding/step3', this.completeOnboardingStep3.bind(this));

    return router;
  }

  /**
   * @swagger
   * /api/users/{userId}/organizations:
   *   get:
   *     summary: Get all organizations for a specific user
   *     tags: [Organizations]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of user's organizations
   */
  async getAll(req: Request, res: Response) {
    try {
      // Check if this is a user-scoped request (has userId in params)
      const { userId } = req.params;
      
      if (userId) {
        // Get organizations for specific user via memberships
        const memberships = await this.memberRepo.findByUserId(userId);
        const orgIds = memberships.map(m => m.organizationId);
        
        if (orgIds.length === 0) {
          return res.json([]);
        }
        
        const organizations = await Promise.all(
          orgIds.map(id => this.organizationService.getById(id))
        );
        
        return res.json(organizations.filter(org => org !== null));
      }
      
      // Otherwise return all organizations (admin endpoint)
      const organizations = await this.organizationService.getAll();
      res.json(organizations);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      res.status(500).json({ error: 'Failed to fetch organizations' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organizations/{id}:
   *   get:
   *     summary: Get organization by ID
   *     tags: [Organizations]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
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
   * /api/users/{userId}/organizations:
   *   post:
   *     summary: Create a new organization (Step 1 of onboarding)
   *     tags: [Organizations]
   *     description: Creates organization draft with basic info. Sets onboardingStep = 1.
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: The authenticated user's ID (owner of the new organization)
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - slug
   *             properties:
   *               name:
   *                 type: string
   *               slug:
   *                 type: string
   *               subdomain:
   *                 type: string
   *     responses:
   *       201:
   *         description: Organization draft created (onboardingStep = 1)
   *       400:
   *         description: Validation error
   */
  async create(req: Request, res: Response) {
    try {
      // Get ownerId from URL params (the authenticated user's ID)
      const ownerId = req.params.userId;
      const data = req.body;

      if (!ownerId) {
        return res.status(400).json({ error: 'User ID is required in URL path' });
      }

      if (!data.name || !data.slug) {
        return res.status(400).json({ error: 'Name and slug are required' });
      }

      // Create organization draft (onboardingStep = 1)
      // No template cloning here - that happens in step 3
      const organization = await this.organizationService.create(data, ownerId);

      res.status(201).json({
        ...organization,
        message: 'Organization draft created successfully'
      });
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
   * /api/users/{userId}/organizations/{id}/onboarding/step2:
   *   post:
   *     summary: Complete onboarding step 2 (contact information)
   *     tags: [Organizations]
   *     description: Updates contact settings and advances onboardingStep to 2
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
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
   *               email:
   *                 type: string
   *               phone:
   *                 type: string
   *               address:
   *                 type: string
   *               city:
   *                 type: string
   *               state:
   *                 type: string
   *               postalCode:
   *                 type: string
   *               country:
   *                 type: string
   *     responses:
   *       200:
   *         description: Contact info saved, onboardingStep = 2
   *       404:
   *         description: Organization not found
   */
  async completeOnboardingStep2(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const contactSettings = req.body;

      const organization = await this.organizationService.completeOnboardingStep2(id, contactSettings);

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      res.json({
        ...organization,
        message: 'Contact information saved successfully'
      });
    } catch (error: any) {
      console.error('Error completing onboarding step 2:', error);
      res.status(400).json({ error: error.message || 'Failed to save contact information' });
    }
  }

  /**
   * @swagger
   * /api/users/{userId}/organizations/{id}/onboarding/step3:
   *   post:
   *     summary: Complete onboarding step 3 (apply template and finalize)
   *     tags: [Organizations]
   *     description: Applies selected template to organization and sets onboardingStep = 3
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
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
   *               - templateId
   *             properties:
   *               templateId:
   *                 type: string
   *                 description: The organization ID of the template to clone
   *               includeCategories:
   *                 type: boolean
   *                 description: Whether to clone categories from template
   *                 default: true
   *     responses:
   *       200:
   *         description: Template applied, organization ready to use (onboardingStep = 3)
   *       404:
   *         description: Organization not found
   */
  async completeOnboardingStep3(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { templateId, includeCategories } = req.body;

      if (!templateId) {
        return res.status(400).json({ error: 'Template ID is required' });
      }

      const organization = await this.organizationService.getById(id);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      console.log(`📋 [OrganizationController] Applying template ${templateId} to organization ${id}`);

      try {
        // Apply template and mark onboarding as complete
        await this.organizationService.completeOnboardingStep3(id, templateId, includeCategories !== false);

        const updatedOrg = await this.organizationService.getById(id);

        console.log(`✅ [OrganizationController] Template applied successfully. Organization ${id} is ready to use.`);

        res.json({
          ...updatedOrg,
          message: 'Template applied successfully. Organization is ready to use!'
        });
      } catch (cloneError: any) {
        console.error('❌ [OrganizationController] Error applying template:', cloneError);
        return res.status(400).json({
          error: cloneError.message || 'Failed to apply template'
        });
      }
    } catch (error: any) {
      console.error('Error completing onboarding step 3:', error);
      res.status(400).json({ error: error.message || 'Failed to complete onboarding' });
    }
  }
}
