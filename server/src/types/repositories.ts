import type {
  Category,
  User,
  UpsertUser,
  HomePageContent,
  DeploymentHistory,
  PreDeployment
} from '../entities';
import type {
  InsertCategory,
  InsertHomePageContent,
  InsertDeploymentHistory,
  InsertPreDeployment
} from '../models';

export interface ICategoryRepository {
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
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
  getActivePreDeployment(organizationId: string): Promise<PreDeployment | undefined>;
  createPreDeployment(preDeployment: InsertPreDeployment): Promise<PreDeployment>;
  updatePreDeployment(id: string, preDeployment: Partial<InsertPreDeployment>): Promise<PreDeployment | undefined>;
  deletePreDeployment(id: string): Promise<boolean>;
}
