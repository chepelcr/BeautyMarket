// Repositories
import {
  ProductRepository,
  CategoryRepository,
  CustomerRepository,
  OrderRepository,
  OrderStatusHistoryRepository,
  UserRepository,
  HomePageContentRepository,
  DeploymentRepository,
  PreDeploymentRepository,
  OrganizationRepository,
  OrganizationMemberRepository,
  OrganizationInvitationRepository,
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
import { S3Dao, CloudFrontDao } from './aws-daos';

// Services
import {
  ProductService,
  CategoryService,
  CustomerService,
  OrderService,
  DeploymentService,
  PreDeploymentService,
  S3UploadService,
  CognitoService,
  UserService,
  OrganizationService,
  MembershipService,
  InvitationService,
  RBACService,
  EmailService,
  OrganizationInfrastructureService,
  ThemeSettingsService,
  ContactSettingsService,
  PaymentSettingsService,
  ShippingSettingsService,
  TemplateService,
  PageService,
  ComponentService
} from './services';
import { TemplateCloneService } from './services/TemplateCloneService';
import { TemplateContentService } from './services/TemplateContentService';
import { PublicOrgService } from './services/PublicOrgService';

// Controllers
import {
  ProductController,
  CategoryController,
  CustomerController,
  OrderController,
  HomePageContentController,
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
export const productRepository = new ProductRepository();
export const categoryRepository = new CategoryRepository();
export const customerRepository = new CustomerRepository();
export const orderRepository = new OrderRepository();
export const orderStatusHistoryRepository = new OrderStatusHistoryRepository();
export const userRepository = new UserRepository();
export const homePageContentRepository = new HomePageContentRepository();
export const deploymentRepository = new DeploymentRepository();
export const preDeploymentRepository = new PreDeploymentRepository();

// Organization and Multi-tenancy repositories
export const organizationRepository = new OrganizationRepository();
export const organizationMemberRepository = new OrganizationMemberRepository();
export const organizationInvitationRepository = new OrganizationInvitationRepository();
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
export const cloudfrontDao = new CloudFrontDao();

// Create services
export const productService = new ProductService(productRepository, categoryRepository);
export const categoryService = new CategoryService(categoryRepository);
export const customerService = new CustomerService(customerRepository);
export const orderService = new OrderService(orderRepository, orderStatusHistoryRepository);
export const deploymentService = new DeploymentService(
  deploymentRepository,
  preDeploymentRepository,
  s3Dao,
  cloudfrontDao
);
export const preDeploymentService = new PreDeploymentService(preDeploymentRepository);
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
  templateCloneService
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
  emailService
);
export const rbacService = new RBACService(
  rbacRepository,
  organizationMemberRepository
);
export const organizationInfrastructureService = new OrganizationInfrastructureService(
  organizationRepository,
  s3Dao,
  cloudfrontDao
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
export const publicOrgService = new PublicOrgService(db);
export const pageService = new PageService(pageRepository);
export const componentService = new ComponentService(componentRepository);

// Create controllers
export const productController = new ProductController(productService, preDeploymentService);
export const categoryController = new CategoryController(categoryService, productService, preDeploymentService);
export const customerController = new CustomerController(customerService);
export const orderController = new OrderController(orderService);
export const homePageContentController = new HomePageContentController(homePageContentRepository, preDeploymentService);
export const deploymentController = new DeploymentController(deploymentService);
export const preDeploymentController = new PreDeploymentController(preDeploymentRepository);
export const s3UploadController = new S3UploadController(s3UploadService);
export const userController = new UserController(userService);

// Organization and Multi-tenancy controllers
export const organizationController = new OrganizationController(
  organizationService,
  rbacService,
  organizationInfrastructureService,
  templateCloneService,
  organizationMemberRepository
);
export const membershipController = new MembershipController(membershipService, rbacService);
export const invitationController = new InvitationController(invitationService);
export const rbacController = new RBACController(rbacService);

// Settings controllers
export const themeSettingsController = new ThemeSettingsController(themeSettingsRepository);
export const contactSettingsController = new ContactSettingsController(contactSettingsRepository);
export const paymentSettingsController = new PaymentSettingsController(paymentSettingsRepository);
export const shippingSettingsController = new ShippingSettingsController(shippingSettingsRepository);

// Template and Page controllers
export const templateController = new TemplateController(templateRepository, templateContentService);
export const publicOrgController = new PublicOrgController(publicOrgService);
export const pageController = new PageController(pageRepository);
export const sectionController = new SectionController(pageSectionRepository, pageRepository);
export const sectionContentController = new SectionContentController(sectionContentRepository, pageSectionRepository, preDeploymentService);
export const componentController = new ComponentController(componentRepository);

// Middleware factories
import {
  createOrganizationContextMiddleware,
  createUserContextMiddleware,
  requireOrganization,
  requireOrganizationMembership,
  requireOrganizationAdmin,
  requireOrganizationOwner
} from './middleware/organizationContext';
import {
  createPermissionMiddleware,
  requireAuth
} from './middleware/permissions';

export const organizationContextMiddleware = createOrganizationContextMiddleware(
  organizationService,
  rbacService
);
export const userContextMiddleware = createUserContextMiddleware();
export const permissionMiddleware = createPermissionMiddleware(rbacService);

// Re-export middleware utilities
export {
  requireOrganization,
  requireOrganizationMembership,
  requireOrganizationAdmin,
  requireOrganizationOwner,
  requireAuth
};
