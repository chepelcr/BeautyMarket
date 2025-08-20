import {
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type HomePageContent,
  type InsertHomePageContent,
  type DeploymentHistory,
  type InsertDeploymentHistory,
  type PreDeployment,
  type InsertPreDeployment,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type EmailVerificationToken,
  type InsertEmailVerificationToken,
  type Province,
  type Canton,
  type District,
  type InsertProvince,
  type InsertCanton,
  type InsertDistrict,
  users,
  products as productsTable,
  orders as ordersTable,
  categoriesTable,
  homePageContent,
  deploymentHistory,
  preDeployments,
  passwordResetTokens,
  emailVerificationTokens,
  provinces,
  cantons,
  districts,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, lt } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(
    id: string,
    product: Partial<InsertProduct>,
  ): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(
    id: string,
    category: Partial<InsertCategory>,
  ): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

  // User operations (required for local auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: {
    username: string;
    password: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;

  // Home Page Content Management
  getHomePageContent(): Promise<HomePageContent[]>;
  getHomePageContentBySection(section: string): Promise<HomePageContent[]>;
  getHomePageContentByKey(
    section: string,
    key: string,
  ): Promise<HomePageContent | undefined>;
  createHomePageContent(
    content: InsertHomePageContent,
  ): Promise<HomePageContent>;
  updateHomePageContent(
    id: string,
    content: Partial<InsertHomePageContent>,
  ): Promise<HomePageContent | undefined>;
  deleteHomePageContent(id: string): Promise<boolean>;
  bulkUpsertHomePageContent(
    contentList: InsertHomePageContent[],
  ): Promise<HomePageContent[]>;

  // Deployment History
  getDeploymentHistory(): Promise<DeploymentHistory[]>;
  getDeploymentById(id: string): Promise<DeploymentHistory | undefined>;
  createDeployment(
    deployment: InsertDeploymentHistory,
  ): Promise<DeploymentHistory>;
  updateDeployment(
    id: string,
    deployment: Partial<InsertDeploymentHistory>,
  ): Promise<DeploymentHistory | undefined>;

  // Pre-Deployment Management
  getPreDeployments(): Promise<PreDeployment[]>;
  getActivePreDeployment(): Promise<PreDeployment | undefined>;
  createPreDeployment(preDeployment: InsertPreDeployment): Promise<PreDeployment>;
  updatePreDeployment(
    id: string,
    preDeployment: Partial<InsertPreDeployment>,
  ): Promise<PreDeployment | undefined>;
  deletePreDeployment(id: string): Promise<boolean>;

  // Password Reset Tokens
  createPasswordResetToken(
    token: InsertPasswordResetToken,
  ): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenUsed(id: string): Promise<void>;
  cleanupExpiredPasswordResetTokens(): Promise<void>;

  // Email Verification Tokens
  createEmailVerificationToken(
    token: InsertEmailVerificationToken,
  ): Promise<EmailVerificationToken>;
  getEmailVerificationToken(
    token: string,
  ): Promise<EmailVerificationToken | undefined>;
  markEmailVerificationTokenUsed(id: string): Promise<void>;
  cleanupExpiredEmailVerificationTokens(): Promise<void>;

  // User Profile Management
  updateUserProfile(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      username?: string;
    },
  ): Promise<User>;
  changeUserPassword(id: string, hashedPassword: string): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeFooterContent();
  }

  private async initializeFooterContent() {
    // Only initialize if no contact content exists
    const existingContent = await this.getHomePageContentBySection("contact");
    if (existingContent.length === 0) {
      const footerContentData: InsertHomePageContent[] = [
        {
          section: "contact",
          key: "companyName",
          value: "Strawberry Essentials",
          type: "text",
          displayName: "Nombre de la Empresa",
          sortOrder: 1,
        },
        {
          section: "contact",
          key: "footerText",
          value: "Tu belleza, nuestra pasión",
          type: "text",
          displayName: "Texto del Footer",
          sortOrder: 2,
        },
        {
          section: "contact",
          key: "instagram",
          value: "@strawberry.essentials",
          type: "text",
          displayName: "Instagram",
          sortOrder: 3,
        },
        {
          section: "contact",
          key: "phone",
          value: "73676745",
          type: "text",
          displayName: "Teléfono",
          sortOrder: 4,
        },
        {
          section: "contact",
          key: "payment_methods",
          value: "SINPE Móvil o efectivo",
          type: "text",
          displayName: "Métodos de Pago",
          sortOrder: 5,
        },
        {
          section: "contact",
          key: "footerBackground",
          value: '{"type":"color","mode":"both","value":"#1f2937"}',
          type: "background",
          displayName: "Fondo del Footer",
          sortOrder: 6,
        },
      ];

      await this.bulkUpsertHomePageContent(footerContentData);
    }

    // Initialize hero background data
    const existingHero = await this.getHomePageContentBySection("hero");
    if (existingHero.length === 0) {
      const heroContentData: InsertHomePageContent[] = [
        {
          section: "hero",
          key: "title",
          value: "Strawberry Essentials",
          type: "text",
          displayName: "Título Principal",
          sortOrder: 1,
        },
        {
          section: "hero",
          key: "subtitle",
          value: "Tu belleza natural, potenciada",
          type: "text",
          displayName: "Subtítulo",
          sortOrder: 2,
        },
        {
          section: "hero",
          key: "description",
          value:
            "Descubre nuestra colección cuidadosamente seleccionada de productos de belleza que realzan tu belleza natural. Calidad premium, resultados excepcionales.",
          type: "text",
          displayName: "Descripción",
          sortOrder: 3,
        },
        {
          section: "hero",
          key: "backgroundStyle",
          value:
            '{"type":"gradient","mode":"both","gradient":{"from":"#fce7f3","to":"#fed7d7","direction":"to-br"}}',
          type: "background",
          displayName: "Fondo de la Sección",
          sortOrder: 4,
        },
        {
          section: "hero",
          key: "image1",
          value:
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          type: "image",
          displayName: "Imagen 1",
          sortOrder: 5,
        },
        {
          section: "hero",
          key: "image2",
          value:
            "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          type: "image",
          displayName: "Imagen 2",
          sortOrder: 6,
        },
        {
          section: "hero",
          key: "image3",
          value:
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          type: "image",
          displayName: "Imagen 3",
          sortOrder: 7,
        },
        {
          section: "hero",
          key: "image4",
          value:
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          type: "image",
          displayName: "Imagen 4",
          sortOrder: 8,
        },
        {
          section: "site",
          key: "favicon",
          value: "/favicon.ico",
          type: "image",
          displayName: "Favicon",
          sortOrder: 1,
        },
        {
          section: "site",
          key: "navbarLogo",
          value: "",
          type: "image",
          displayName: "Logo del Navbar",
          sortOrder: 2,
        },
      ];

      await this.bulkUpsertHomePageContent(heroContentData);
    }

    // Initialize sidebar content
    const existingSidebar = await this.getHomePageContentBySection("sidebar");
    if (existingSidebar.length === 0) {
      const sidebarContentData: InsertHomePageContent[] = [
        {
          section: "sidebar",
          key: "background_color",
          value: "#ffffff",
          type: "color",
          displayName: "Color de Fondo del Sidebar",
          sortOrder: 1,
        },
        {
          section: "sidebar",
          key: "background_color_dark",
          value: "#1f2937",
          type: "color",
          displayName: "Color de Fondo del Sidebar (Modo Oscuro)",
          sortOrder: 2,
        },
        {
          section: "sidebar",
          key: "text_color",
          value: "#374151",
          type: "color",
          displayName: "Color de Texto del Sidebar",
          sortOrder: 3,
        },
        {
          section: "sidebar",
          key: "text_color_dark",
          value: "#f3f4f6",
          type: "color",
          displayName: "Color de Texto del Sidebar (Modo Oscuro)",
          sortOrder: 4,
        },
        {
          section: "sidebar",
          key: "border_color",
          value: "#e5e7eb",
          type: "color",
          displayName: "Color de Bordes del Sidebar",
          sortOrder: 5,
        },
        {
          section: "sidebar",
          key: "border_color_dark",
          value: "#4b5563",
          type: "color",
          displayName: "Color de Bordes del Sidebar (Modo Oscuro)",
          sortOrder: 6,
        },
        {
          section: "sidebar",
          key: "hover_color",
          value: "#f3f4f6",
          type: "color",
          displayName: "Color de Hover del Sidebar",
          sortOrder: 7,
        },
        {
          section: "sidebar",
          key: "hover_color_dark",
          value: "#374151",
          type: "color",
          displayName: "Color de Hover del Sidebar (Modo Oscuro)",
          sortOrder: 8,
        },
      ];

      await this.bulkUpsertHomePageContent(sidebarContentData);
      console.log("✅ Sidebar customization options initialized");
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(userData: {
    username: string;
    password: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        role: userData.role || "admin",
      })
      .returning();
    return user;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db
      .select()
      .from(productsTable)
      .leftJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.id),
      )
      .orderBy(productsTable.createdAt)
      .then((results) =>
        results.map((result) => ({
          ...result.products,
          category: result.categories?.name || null, // Backward compatibility
        })),
      );
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id));
    return product || undefined;
  }

  async getProductsByCategory(categorySlugOrName: string): Promise<Product[]> {
    // First, try to find the category by slug to get the proper ID
    const categoryRecord = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, categorySlugOrName))
      .limit(1);

    // If not found by slug, try by name for backward compatibility
    if (!categoryRecord[0]) {
      const categoryByName = await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.name, categorySlugOrName))
        .limit(1);

      if (!categoryByName[0]) {
        return []; // Category not found
      }

      return await db
        .select()
        .from(productsTable)
        .leftJoin(
          categoriesTable,
          eq(productsTable.categoryId, categoriesTable.id),
        )
        .where(eq(productsTable.categoryId, categoryByName[0].id))
        .then((results) =>
          results.map((result) => ({
            ...result.products,
            category: result.categories?.name || null, // Backward compatibility
          })),
        );
    }

    return await db
      .select()
      .from(productsTable)
      .leftJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.id),
      )
      .where(eq(productsTable.categoryId, categoryRecord[0].id))
      .then((results) =>
        results.map((result) => ({
          ...result.products,
          category: result.categories?.name || null, // Backward compatibility
        })),
      );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(productsTable)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(
    id: string,
    productData: Partial<InsertProduct>,
  ): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(productsTable)
      .set(productData)
      .where(eq(productsTable.id, id))
      .returning();
    return updatedProduct || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db
      .delete(productsTable)
      .where(eq(productsTable.id, id));
    return result.length > 0;
  }

  // Categories operations
  async getCategories(): Promise<Category[]> {
    return await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.isActive, true))
      .orderBy(categoriesTable.sortOrder, categoriesTable.name);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, id));
    return category || undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, slug));
    return category || undefined;
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categoriesTable)
      .values(categoryData)
      .returning();
    return category;
  }

  async updateCategory(
    id: string,
    updates: Partial<InsertCategory>,
  ): Promise<Category | undefined> {
    const [category] = await db
      .update(categoriesTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(categoriesTable.id, id))
      .returning();
    return category || undefined;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db
      .delete(categoriesTable)
      .where(eq(categoriesTable.id, id));
    return result.length > 0;
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    return await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, id));
    return order || undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(ordersTable).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(
    id: string,
    status: string,
  ): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, id))
      .returning();
    return updatedOrder || undefined;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Home Page Content Management
  async getHomePageContent(): Promise<HomePageContent[]> {
    return await db
      .select()
      .from(homePageContent)
      .orderBy(homePageContent.section, homePageContent.sortOrder);
  }

  async getHomePageContentBySection(
    section: string,
  ): Promise<HomePageContent[]> {
    return await db
      .select()
      .from(homePageContent)
      .where(eq(homePageContent.section, section))
      .orderBy(homePageContent.sortOrder);
  }

  async getHomePageContentByKey(
    section: string,
    key: string,
  ): Promise<HomePageContent | undefined> {
    const [content] = await db
      .select()
      .from(homePageContent)
      .where(
        and(eq(homePageContent.section, section), eq(homePageContent.key, key)),
      )
      .limit(1);
    return content;
  }

  async createHomePageContent(
    content: InsertHomePageContent,
  ): Promise<HomePageContent> {
    const [newContent] = await db
      .insert(homePageContent)
      .values(content)
      .returning();
    return newContent;
  }

  async updateHomePageContent(
    id: string,
    content: Partial<InsertHomePageContent>,
  ): Promise<HomePageContent | undefined> {
    const [updatedContent] = await db
      .update(homePageContent)
      .set({ ...content, updatedAt: new Date() })
      .where(eq(homePageContent.id, id))
      .returning();
    return updatedContent;
  }

  async deleteHomePageContent(id: string): Promise<boolean> {
    const result = await db
      .delete(homePageContent)
      .where(eq(homePageContent.id, id));
    return result.length > 0;
  }

  async bulkUpsertHomePageContent(
    contentList: InsertHomePageContent[],
  ): Promise<HomePageContent[]> {
    const results: HomePageContent[] = [];
    for (const content of contentList) {
      const existing = await this.getHomePageContentByKey(
        content.section,
        content.key,
      );
      if (existing) {
        const updated = await this.deleteHomePageContent(existing.id);
      }

      const created = await this.createHomePageContent(content);
      results.push(created);
    }
    return results;
  }

  // Deployment History
  async getDeploymentHistory(): Promise<DeploymentHistory[]> {
    return await db
      .select()
      .from(deploymentHistory)
      .orderBy(deploymentHistory.startedAt);
  }

  async getDeploymentById(id: string): Promise<DeploymentHistory | undefined> {
    const [deployment] = await db
      .select()
      .from(deploymentHistory)
      .where(eq(deploymentHistory.id, id));
    return deployment || undefined;
  }

  async createDeployment(
    deployment: InsertDeploymentHistory,
  ): Promise<DeploymentHistory> {
    const [newDeployment] = await db
      .insert(deploymentHistory)
      .values(deployment)
      .returning();
    return newDeployment;
  }

  async updateDeployment(
    id: string,
    deployment: Partial<InsertDeploymentHistory>,
  ): Promise<DeploymentHistory | undefined> {
    const [updatedDeployment] = await db
      .update(deploymentHistory)
      .set(deployment)
      .where(eq(deploymentHistory.id, id))
      .returning();
    return updatedDeployment || undefined;
  }

  // Pre-Deployment Management
  async getPreDeployments(): Promise<PreDeployment[]> {
    return await db
      .select()
      .from(preDeployments)
      .orderBy(preDeployments.createdAt);
  }

  async getActivePreDeployment(): Promise<PreDeployment | undefined> {
    const [deployment] = await db
      .select()
      .from(preDeployments)
      .where(eq(preDeployments.status, "ready"))
      .orderBy(preDeployments.createdAt)
      .limit(1);
    return deployment || undefined;
  }

  async createPreDeployment(preDeployment: InsertPreDeployment): Promise<PreDeployment> {
    const [newPreDeployment] = await db
      .insert(preDeployments)
      .values(preDeployment)
      .returning();
    return newPreDeployment;
  }

  async updatePreDeployment(
    id: string,
    preDeployment: Partial<InsertPreDeployment>,
  ): Promise<PreDeployment | undefined> {
    const [updatedPreDeployment] = await db
      .update(preDeployments)
      .set({ ...preDeployment, updatedAt: new Date() })
      .where(eq(preDeployments.id, id))
      .returning();
    return updatedPreDeployment || undefined;
  }

  async deletePreDeployment(id: string): Promise<boolean> {
    const result = await db
      .delete(preDeployments)
      .where(eq(preDeployments.id, id));
    return result.length > 0;
  }

  // Password Reset Token methods
  async createPasswordResetToken(
    token: InsertPasswordResetToken,
  ): Promise<PasswordResetToken> {
    const [newToken] = await db
      .insert(passwordResetTokens)
      .values(token)
      .returning();
    return newToken;
  }

  async getPasswordResetToken(
    token: string,
  ): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false),
        ),
      );
    return resetToken;
  }

  async markPasswordResetTokenUsed(id: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, id));
  }

  async cleanupExpiredPasswordResetTokens(): Promise<void> {
    await db
      .delete(passwordResetTokens)
      .where(lt(passwordResetTokens.expiresAt, new Date()));
  }

  // Email Verification Token methods
  async createEmailVerificationToken(
    token: InsertEmailVerificationToken,
  ): Promise<EmailVerificationToken> {
    const [newToken] = await db
      .insert(emailVerificationTokens)
      .values(token)
      .returning();
    return newToken;
  }

  async getEmailVerificationToken(
    token: string,
  ): Promise<EmailVerificationToken | undefined> {
    const [verifyToken] = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.token, token),
          eq(emailVerificationTokens.used, false),
        ),
      );
    return verifyToken;
  }

  async markEmailVerificationTokenUsed(id: string): Promise<void> {
    await db
      .update(emailVerificationTokens)
      .set({ used: true })
      .where(eq(emailVerificationTokens.id, id));
  }

  async cleanupExpiredEmailVerificationTokens(): Promise<void> {
    await db
      .delete(emailVerificationTokens)
      .where(lt(emailVerificationTokens.expiresAt, new Date()));
  }

  // User Profile Management methods
  async updateUserProfile(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      username?: string;
    },
  ): Promise<User> {
    const updateData: any = { updatedAt: new Date() };

    // Map camelCase to snake_case for database fields
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.username !== undefined) updateData.username = data.username;

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async changeUserPassword(id: string, hashedPassword: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
}

export const storage = new DatabaseStorage();
