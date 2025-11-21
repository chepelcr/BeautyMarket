import type {
  Product,
  Category,
  Order,
  User,
  UpsertUser,
  HomePageContent,
  DeploymentHistory,
  PreDeployment
} from '../entities';
import type {
  InsertProduct,
  InsertCategory,
  InsertOrder,
  InsertHomePageContent,
  InsertDeploymentHistory,
  InsertPreDeployment
} from '../models';

export interface IProductRepository {
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(categorySlug: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
}

export interface ICategoryRepository {
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
}

export interface IOrderRepository {
  getOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
}

export interface IUserRepository {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  updateUserByEmail(email: string, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
}

export interface IHomePageContentRepository {
  getHomePageContent(): Promise<HomePageContent[]>;
  getHomePageContentBySection(section: string): Promise<HomePageContent[]>;
  createHomePageContent(content: InsertHomePageContent): Promise<HomePageContent>;
  updateHomePageContent(id: string, content: Partial<InsertHomePageContent>): Promise<HomePageContent | undefined>;
  bulkUpsertHomePageContent(contentList: InsertHomePageContent[]): Promise<HomePageContent[]>;
  deleteHomePageContent(id: string): Promise<boolean>;
}

export interface IDeploymentRepository {
  getDeploymentHistory(): Promise<DeploymentHistory[]>;
  createDeployment(deployment: InsertDeploymentHistory): Promise<DeploymentHistory>;
  updateDeployment(id: string, deployment: Partial<InsertDeploymentHistory>): Promise<DeploymentHistory | undefined>;
}

export interface IPreDeploymentRepository {
  getPreDeployments(): Promise<PreDeployment[]>;
  getActivePreDeployment(): Promise<PreDeployment | undefined>;
  createPreDeployment(preDeployment: InsertPreDeployment): Promise<PreDeployment>;
  updatePreDeployment(id: string, preDeployment: Partial<InsertPreDeployment>): Promise<PreDeployment | undefined>;
  deletePreDeployment(id: string): Promise<boolean>;
}
