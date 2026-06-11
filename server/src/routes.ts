import type { Express } from "express";
import { Router } from "express";
import {
  deploymentController,
  preDeploymentController,
  s3UploadController,
  userController,
  organizationController,
  membershipController,
  invitationController,
  rbacController,
  themeSettingsController,
  contactSettingsController,
  paymentSettingsController,
  shippingSettingsController,
  templateController,
  pageController,
  sectionController,
  sectionContentController,
  componentController,
  publicOrgController,
  platformAdminController,
  requirePlatformAdmin,
  attachUserId
} from './dependency_injection';

export function setupRoutes(app: Express): void {
  // ============================================
  // Domain-based routes: /api/users/:userId/organization/:orgId/...
  // Security: API Gateway validates JWT + userId matches path, queries enforce user-scoping
  // ============================================
  const orgScopedRouter = Router({ mergeParams: true });

  // Populate req.userId from the :userId path param (API-Gateway-validated),
  // with bearer-payload-sub fallback for local dev — required by the RBAC
  // permission middleware (requirePermission / requireMembership)
  orgScopedRouter.use(attachUserId());

  // Mount organization-scoped controllers
  orgScopedRouter.use('/deployments', deploymentController.getRouter());
  orgScopedRouter.use('/pre-deployments', preDeploymentController.getRouter());
  orgScopedRouter.use('/upload', s3UploadController.getRouter());
  orgScopedRouter.use('/objects', s3UploadController.getRouter());
  orgScopedRouter.use('/invitations', invitationController.getRouter());
  orgScopedRouter.use('/rbac', rbacController.getRouter());

  // Settings routes
  orgScopedRouter.use('/settings/theme', themeSettingsController.getRouter());
  orgScopedRouter.use('/settings/contact', contactSettingsController.getRouter());
  orgScopedRouter.use('/settings/payment', paymentSettingsController.getRouter());
  orgScopedRouter.use('/settings/shipping', shippingSettingsController.getRouter());

  // Page management routes with nested section routes
  const pageRouter = Router({ mergeParams: true });
  pageRouter.use('/', pageController.getRouter());

  // Nested section routes: /pages/:pageId/sections
  const sectionRouter = Router({ mergeParams: true });
  sectionRouter.use('/', sectionController.getRouter());

  // Nested content routes: /pages/:pageId/sections/:sectionId/content
  sectionRouter.use('/:sectionId/content', sectionContentController.getRouter());

  pageRouter.use('/:pageId/sections', sectionRouter);

  orgScopedRouter.use('/pages', pageRouter);

  // Content bulk operations at org level
  orgScopedRouter.use('/content', sectionContentController.getRouter());

  // Mount organization-scoped router
  app.use('/api/users/:userId/organization/:orgId', orgScopedRouter);

  // ============================================
  // User routes: /api/users/...
  // Security: API Gateway validates JWT + userId matches path, queries enforce user-scoping
  // ============================================
  const userRouter = Router({ mergeParams: true });

  // Mount user controller (handles profile and verification routes)
  app.use('/api/users', userRouter, userController.getRouter());

  // ============================================
  // User-scoped routes: /api/users/:userId/...
  // Security: API Gateway validates JWT + userId matches path, queries enforce user-scoping
  // ============================================
  const userScopedRouter = Router({ mergeParams: true });

  // User's organizations
  userScopedRouter.use('/organizations', organizationController.getRouter());

  // User's memberships
  userScopedRouter.use('/memberships', membershipController.getRouter());

  // User's pending invitations (no orgId needed)
  userScopedRouter.get('/invitations/pending', (req, res) => invitationController.getMyPendingInvitations(req, res));

  // Mount user-scoped router
  app.use('/api/users/:userId', userScopedRouter);

  // ============================================
  // Platform-admin routes: /api/admin/...
  // Security: JWT signature validated at API Gateway; req.userId resolved from
  // the bearer payload (no :userId path here); requirePlatformAdmin enforces
  // users.role === 'platform_admin' server-side (the real gate)
  // ============================================
  const adminRouter = Router({ mergeParams: true });
  adminRouter.use(attachUserId(), requirePlatformAdmin);
  adminRouter.use('/', platformAdminController.getRouter());
  app.use('/api/admin', adminRouter);

  // ============================================
  // Global routes (auth required, not org-scoped)
  // ============================================

  // Component routes (global, not organization-specific)
  app.use('/api/components', componentController.getRouter());

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

  // Template routes (public for Examples page)
  app.use('/api/templates', templateController.getRouter());

  // Public organization routes (for storefront access)
  app.use('/api/public/organizations', publicOrgController.getRouter());

  // Public invitation endpoints (for accepting invitations without auth)
  app.get('/api/invitations/token/:token', (req, res, next) => {
    // Forward to invitation controller's getByToken
    invitationController.getByToken(req, res);
  });
  app.post('/api/invitations/accept/:token', (req, res, next) => {
    // Forward to invitation controller's accept
    invitationController.accept(req, res);
  });

  // Organization routes (matches swagger: /api/organizations/...)
  app.use('/api/organizations', organizationController.getRouter());
}
