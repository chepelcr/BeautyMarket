// Repositories
import {
  UserRepository,
  HomePageContentRepository,
  DeploymentRepository,
  PreDeploymentRepository,
  OrganizationRepository,
  OrganizationMemberRepository,
  OrganizationInvitationRepository,
  OrganizationSettingsRepository,
  RBACRepository,
  ThemeSettingsRepository,
  ContactSettingsRepository,
  PaymentSettingsRepository,
  ShippingSettingsRepository,
  TemplateRepository,
  ComponentRepository,
  PageRepository,
  PageSectionRepository,
  SectionContentRepository
} from './repositories';

// AWS DAOs
import { S3Dao } from './aws-daos';

// Services
import {
  DeploymentService,
  PreDeploymentService,
  S3UploadService,
  CognitoService,
  UserService,
  OrganizationService,
  OrganizationEventPublisher,
  MembershipService,
  InvitationService,
  RBACService,
  EmailService,
  ThemeSettingsService,
  ContactSettingsService,
  PaymentSettingsService,
  ShippingSettingsService,
  TemplateService,
  PageService,
  PageSectionService,
  SectionContentService,
  ComponentService
} from './services';
import { TemplateCloneService } from './services/TemplateCloneService';
import { TemplateContentService } from './services/TemplateContentService';
import { PublicOrgService } from './services/PublicOrgService';

// Controllers
import {
  DeploymentController,
  PreDeploymentController,
  S3UploadController,
  UserController,
  OrganizationController,
  MembershipController,
  InvitationController,
  RBACController,
  ThemeSettingsController,
  ContactSettingsController,
  PaymentSettingsController,
  ShippingSettingsController,
  TemplateController,
  PageController,
  SectionController,
  SectionContentController,
  ComponentController
} from './controllers';
import { PublicOrgController } from './controllers/PublicOrgController';

// Create repositories
export const userRepository = new UserRepository();
export const homePageContentRepository = new HomePageContentRepository();
export const deploymentRepository = new DeploymentRepository();
export const preDeploymentRepository = new PreDeploymentRepository();

// Organization and Multi-tenancy repositories
export const organizationRepository = new OrganizationRepository();
export const organizationMemberRepository = new OrganizationMemberRepository();
export const organizationInvitationRepository = new OrganizationInvitationRepository();
export const organizationSettingsRepository = new OrganizationSettingsRepository();
export const rbacRepository = new RBACRepository();

// Settings repositories
export const themeSettingsRepository = new ThemeSettingsRepository();
export const contactSettingsRepository = new ContactSettingsRepository();
export const paymentSettingsRepository = new PaymentSettingsRepository();
export const shippingSettingsRepository = new ShippingSettingsRepository();

// Template and Page repositories
export const templateRepository = new TemplateRepository();
export const componentRepository = new ComponentRepository();
export const pageRepository = new PageRepository();
export const pageSectionRepository = new PageSectionRepository();
export const sectionContentRepository = new SectionContentRepository();

// Create centralized AWS DAOs (shared across all services)
export const s3Dao = new S3Dao();

// Create services

// Event publisher (SNS)
export const organizationEventPublisher = new OrganizationEventPublisher();

export const preDeploymentService = new PreDeploymentService(
  preDeploymentRepository,
  organizationRepository,
  organizationSettingsRepository,
  organizationEventPublisher
);

export const deploymentService = new DeploymentService(
  preDeploymentRepository,
  deploymentRepository,
  organizationRepository,
  organizationSettingsRepository,
  organizationEventPublisher,
  s3Dao
);
export const s3UploadService = new S3UploadService(s3Dao);
export const cognitoService = new CognitoService();
export const emailService = new EmailService();
export const userService = new UserService(userRepository, cognitoService, emailService);

// Organization and Multi-tenancy services
export const templateCloneService = new TemplateCloneService();
export const organizationService = new OrganizationService(
  organizationRepository,
  organizationMemberRepository,
  rbacRepository,
  contactSettingsRepository,
  templateCloneService,
  organizationEventPublisher
);
export const membershipService = new MembershipService(
  organizationMemberRepository,
  organizationRepository,
  rbacRepository
);
export const invitationService = new InvitationService(
  organizationInvitationRepository,
  organizationMemberRepository,
  userRepository,
  rbacRepository,
  emailService,
  organizationRepository
);
export const rbacService = new RBACService(
  rbacRepository,
  organizationMemberRepository
);

// Settings services
export const themeSettingsService = new ThemeSettingsService(themeSettingsRepository);
export const contactSettingsService = new ContactSettingsService(contactSettingsRepository);
export const paymentSettingsService = new PaymentSettingsService(paymentSettingsRepository);
export const shippingSettingsService = new ShippingSettingsService(shippingSettingsRepository);

// Template and Page services
export const templateService = new TemplateService(templateRepository);
export const templateContentService = new TemplateContentService();
import { db } from './config/database';
export const publicOrgService = new PublicOrgService(
  organizationRepository,
  themeSettingsRepository,
  contactSettingsRepository,
  pageRepository,
  pageSectionRepository,
  sectionContentRepository
);
export const pageSectionService = new PageSectionService(pageSectionRepository);
export const sectionContentService = new SectionContentService(sectionContentRepository);
export const pageService = new PageService(pageRepository, pageSectionService, sectionContentService);
export const componentService = new ComponentService(componentRepository);

// Create controllers
export const deploymentController = new DeploymentController(deploymentService);
export const preDeploymentController = new PreDeploymentController(preDeploymentRepository, deploymentService);
export const s3UploadController = new S3UploadController(s3UploadService);
export const userController = new UserController(userService);

// Organization and Multi-tenancy controllers
export const organizationController = new OrganizationController(
  organizationService,
  rbacService,
  templateCloneService,
  organizationMemberRepository
);
export const membershipController = new MembershipController(membershipService, rbacService);
export const invitationController = new InvitationController(invitationService);
export const rbacController = new RBACController(rbacService);

// Settings controllers
export const themeSettingsController = new ThemeSettingsController(themeSettingsService);
export const contactSettingsController = new ContactSettingsController(contactSettingsService);
export const paymentSettingsController = new PaymentSettingsController(paymentSettingsService);
export const shippingSettingsController = new ShippingSettingsController(shippingSettingsService);

// Template and Page controllers
export const templateController = new TemplateController(templateRepository, templateContentService);
export const publicOrgController = new PublicOrgController(publicOrgService);
export const pageController = new PageController(pageService);
export const sectionController = new SectionController(pageSectionService, pageService);
export const sectionContentController = new SectionContentController(sectionContentService, pageSectionService, preDeploymentService);
export const componentController = new ComponentController(componentService);

// Middleware factories
import {
  createPermissionMiddleware,
  requireAuth
} from './middleware/permissions';

export const permissionMiddleware = createPermissionMiddleware(rbacService);

// Re-export middleware utilities
export {
  requireAuth
};
