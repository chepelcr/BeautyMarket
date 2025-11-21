import type { Express } from "express";
import { Router } from "express";
import {
  productController,
  categoryController,
  orderController,
  homePageContentController,
  deploymentController,
  preDeploymentController,
  s3UploadController,
  userController,
  organizationController,
  membershipController,
  invitationController,
  rbacController,
  organizationContextMiddleware,
  userContextMiddleware,
  requireAuth,
  requireOrganization
} from './dependency_injection';

export function setupRoutes(app: Express): void {
  // ============================================
  // Domain-based routes: /api/user/:userId/organization/:orgId/...
  // ============================================
  const orgScopedRouter = Router({ mergeParams: true });

  // Apply middleware to organization-scoped routes
  orgScopedRouter.use(requireAuth);
  orgScopedRouter.use(organizationContextMiddleware);
  orgScopedRouter.use(requireOrganization());

  // Mount organization-scoped controllers
  orgScopedRouter.use('/products', productController.getRouter());
  orgScopedRouter.use('/categories', categoryController.getRouter());
  orgScopedRouter.use('/orders', orderController.getRouter());
  orgScopedRouter.use('/home-content', homePageContentController.getRouter());
  orgScopedRouter.use('/deployments', deploymentController.getRouter());
  orgScopedRouter.use('/pre-deployments', preDeploymentController.getRouter());
  orgScopedRouter.use('/upload', s3UploadController.getRouter());
  orgScopedRouter.use('/objects', s3UploadController.getRouter());
  orgScopedRouter.use('/invitations', invitationController.getRouter());
  orgScopedRouter.use('/rbac', rbacController.getRouter());

  // Mount organization-scoped router
  app.use('/api/user/:userId/organization/:orgId', orgScopedRouter);

  // ============================================
  // User-scoped routes: /api/user/:userId/...
  // ============================================
  const userScopedRouter = Router({ mergeParams: true });

  // Apply middleware to user-scoped routes
  userScopedRouter.use(requireAuth);
  userScopedRouter.use(userContextMiddleware);

  // User profile routes
  userScopedRouter.use('/profile', userController.getRouter());

  // User's organizations
  userScopedRouter.use('/organizations', organizationController.getRouter());

  // User's memberships
  userScopedRouter.use('/memberships', membershipController.getRouter());

  // Mount user-scoped router
  app.use('/api/user/:userId', userScopedRouter);

  // ============================================
  // Public/flat routes (no auth required)
  // ============================================

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Public invitation endpoints (for accepting invitations without auth)
  app.get('/api/invitations/token/:token', (req, res, next) => {
    // Forward to invitation controller's getByToken
    invitationController.getByToken(req, res);
  });
  app.post('/api/invitations/accept/:token', (req, res, next) => {
    // Forward to invitation controller's accept
    invitationController.accept(req, res);
  });

  // Public organization lookup endpoints (for availability checks)
  app.get('/api/organizations/check-slug/:slug', (req, res) => {
    organizationController.checkSlugAvailable(req, res);
  });
  app.get('/api/organizations/check-subdomain/:subdomain', (req, res) => {
    organizationController.checkSubdomainAvailable(req, res);
  });
  app.get('/api/organizations/by-slug/:slug', (req, res) => {
    organizationController.getBySlug(req, res);
  });
  app.get('/api/organizations/by-subdomain/:subdomain', (req, res) => {
    organizationController.getBySubdomain(req, res);
  });
}
