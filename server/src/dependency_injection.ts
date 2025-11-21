// Repositories
import {
  ProductRepository,
  CategoryRepository,
  OrderRepository,
  UserRepository,
  HomePageContentRepository,
  DeploymentRepository,
  PreDeploymentRepository,
  OrganizationRepository,
  OrganizationMemberRepository,
  OrganizationInvitationRepository,
  RBACRepository
} from './repositories';

// Services
import {
  AwsS3Service,
  AwsCloudFrontService,
  ProductService,
  CategoryService,
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
  OrganizationInfrastructureService
} from './services';

// Controllers
import {
  ProductController,
  CategoryController,
  OrderController,
  HomePageContentController,
  DeploymentController,
  PreDeploymentController,
  S3UploadController,
  UserController,
  OrganizationController,
  MembershipController,
  InvitationController,
  RBACController
} from './controllers';

// Create repositories
export const productRepository = new ProductRepository();
export const categoryRepository = new CategoryRepository();
export const orderRepository = new OrderRepository();
export const userRepository = new UserRepository();
export const homePageContentRepository = new HomePageContentRepository();
export const deploymentRepository = new DeploymentRepository();
export const preDeploymentRepository = new PreDeploymentRepository();

// Organization and Multi-tenancy repositories
export const organizationRepository = new OrganizationRepository();
export const organizationMemberRepository = new OrganizationMemberRepository();
export const organizationInvitationRepository = new OrganizationInvitationRepository();
export const rbacRepository = new RBACRepository();

// Create centralized AWS services (shared across all services)
export const awsS3Service = new AwsS3Service();
export const awsCloudFrontService = new AwsCloudFrontService();

// Create services
export const productService = new ProductService(productRepository, categoryRepository);
export const categoryService = new CategoryService(categoryRepository);
export const orderService = new OrderService(orderRepository);
export const deploymentService = new DeploymentService(
  deploymentRepository,
  preDeploymentRepository,
  awsS3Service,
  awsCloudFrontService
);
export const preDeploymentService = new PreDeploymentService(preDeploymentRepository);
export const s3UploadService = new S3UploadService(awsS3Service);
export const cognitoService = new CognitoService();
export const userService = new UserService(userRepository, cognitoService);
export const emailService = new EmailService();

// Organization and Multi-tenancy services
export const organizationService = new OrganizationService(
  organizationRepository,
  organizationMemberRepository,
  rbacRepository
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
  awsS3Service,
  awsCloudFrontService
);

// Create controllers
export const productController = new ProductController(productService, preDeploymentService);
export const categoryController = new CategoryController(categoryService, productService, preDeploymentService);
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
  organizationInfrastructureService
);
export const membershipController = new MembershipController(membershipService, rbacService);
export const invitationController = new InvitationController(invitationService);
export const rbacController = new RBACController(rbacService);

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
