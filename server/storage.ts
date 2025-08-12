import { type Product, type InsertProduct, type Order, type InsertOrder, type User, type UpsertUser, type Category, type InsertCategory, type HomePageContent, type InsertHomePageContent, users, products as productsTable, orders as ordersTable, categoriesTable, homePageContent } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  
  // Orders
  getOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  
  // User operations (required for local auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: { username: string; password: string; email?: string; firstName?: string; lastName?: string; role?: string }): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  
  // Home Page Content Management
  getHomePageContent(): Promise<HomePageContent[]>;
  getHomePageContentBySection(section: string): Promise<HomePageContent[]>;
  getHomePageContentByKey(section: string, key: string): Promise<HomePageContent | undefined>;
  createHomePageContent(content: InsertHomePageContent): Promise<HomePageContent>;
  updateHomePageContent(id: string, content: Partial<InsertHomePageContent>): Promise<HomePageContent | undefined>;
  deleteHomePageContent(id: string): Promise<boolean>;
  bulkUpsertHomePageContent(contentList: InsertHomePageContent[]): Promise<HomePageContent[]>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private orders: Map<string, Order>;

  constructor() {
    this.products = new Map();
    this.orders = new Map();
    
    // Initialize with some sample products
    this.initializeProducts();
  }

  private async initializeProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "Labial Mate Rosa",
        description: "Labial de larga duración con acabado mate en tono rosa perfecto para cualquier ocasión",
        price: 3500,
        category: "maquillaje",
        imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        isActive: true
      },
      {
        name: "Serum Vitamina C",
        description: "Serum antioxidante con vitamina C para una piel radiante y protegida",
        price: 8500,
        category: "skincare",
        imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        isActive: true
      },
      {
        name: "Set de Brochas Profesional",
        description: "Set completo de brochas profesionales para maquillaje, incluye estuche de viaje",
        price: 12000,
        category: "accesorios",
        imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        isActive: true
      },
      {
        name: "Base Líquida Cobertura Media",
        description: "Base líquida de cobertura media a completa, disponible en múltiples tonos",
        price: 4500,
        category: "maquillaje",
        imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        isActive: true
      },
      {
        name: "Crema Hidratante Facial",
        description: "Crema hidratante facial para todo tipo de piel, con ingredientes naturales",
        price: 6500,
        category: "skincare",
        imageUrl: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        isActive: true
      },
      {
        name: "Corrector Alta Cobertura",
        description: "Corrector de alta cobertura para ojeras e imperfecciones",
        price: 2800,
        category: "maquillaje",
        imageUrl: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        isActive: true
      },
      {
        name: "Mascarilla Purificante",
        description: "Mascarilla facial purificante de arcilla para piel grasa y mixta",
        price: 5500,
        category: "skincare",
        imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        isActive: true
      },
      {
        name: "Espejo LED Maquillaje",
        description: "Espejo con iluminación LED ajustable, perfecto para aplicar maquillaje",
        price: 15000,
        category: "accesorios",
        imageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        isActive: true
      }
    ];

    for (const product of sampleProducts) {
      await this.createProduct(product);
    }
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isActive);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      p => p.category === category && p.isActive
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const now = new Date();
    const product: Product = {
      ...insertProduct,
      id,
      imageUrl: insertProduct.imageUrl ?? null,
      isActive: insertProduct.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updatedProduct: Product = {
      ...product,
      ...updates,
      updatedAt: new Date()
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      status: insertOrder.status ?? "pending",
      createdAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder: Order = {
      ...order,
      status
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Add missing methods for serverless auth
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: { username: string; password: string; email?: string; firstName?: string; lastName?: string; role?: string }): Promise<User> {
    const [user] = await db.insert(users).values({
      username: userData.username,
      password: userData.password,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'admin',
    }).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeFooterContent();
  }
  
  private async initializeFooterContent() {
    // Only initialize if no contact content exists
    const existingContent = await this.getHomePageContentBySection('contact');
    if (existingContent.length === 0) {
      const footerContentData: InsertHomePageContent[] = [
        { section: 'contact', key: 'companyName', value: 'Strawberry Essentials', type: 'text', displayName: 'Nombre de la Empresa', sortOrder: 1 },
        { section: 'contact', key: 'footerText', value: 'Tu belleza, nuestra pasión', type: 'text', displayName: 'Texto del Footer', sortOrder: 2 },
        { section: 'contact', key: 'instagram', value: '@strawberry.essentials', type: 'text', displayName: 'Instagram', sortOrder: 3 },
        { section: 'contact', key: 'phone', value: '73676745', type: 'text', displayName: 'Teléfono', sortOrder: 4 },
        { section: 'contact', key: 'payment_methods', value: 'SINPE Móvil o efectivo', type: 'text', displayName: 'Métodos de Pago', sortOrder: 5 },
        { section: 'contact', key: 'footerBackground', value: '{"type":"color","mode":"both","value":"#1f2937"}', type: 'background', displayName: 'Fondo del Footer', sortOrder: 6 }
      ];
      
      await this.bulkUpsertHomePageContent(footerContentData);
    }
    
    // Initialize hero background data
    const existingHero = await this.getHomePageContentBySection('hero');
    if (existingHero.length === 0) {
      const heroContentData: InsertHomePageContent[] = [
        { section: 'hero', key: 'title', value: 'Strawberry Essentials', type: 'text', displayName: 'Título Principal', sortOrder: 1 },
        { section: 'hero', key: 'subtitle', value: 'Tu belleza natural, potenciada', type: 'text', displayName: 'Subtítulo', sortOrder: 2 },
        { section: 'hero', key: 'description', value: 'Descubre nuestra colección cuidadosamente seleccionada de productos de belleza que realzan tu belleza natural. Calidad premium, resultados excepcionales.', type: 'text', displayName: 'Descripción', sortOrder: 3 },
        { section: 'hero', key: 'backgroundStyle', value: '{"type":"gradient","mode":"both","gradient":{"from":"#fce7f3","to":"#fed7d7","direction":"to-br"}}', type: 'background', displayName: 'Fondo de la Sección', sortOrder: 4 },
        { section: 'hero', key: 'image1', value: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', type: 'image', displayName: 'Imagen 1', sortOrder: 5 },
        { section: 'hero', key: 'image2', value: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', type: 'image', displayName: 'Imagen 2', sortOrder: 6 },
        { section: 'hero', key: 'image3', value: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', type: 'image', displayName: 'Imagen 3', sortOrder: 7 },
        { section: 'hero', key: 'image4', value: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', type: 'image', displayName: 'Imagen 4', sortOrder: 8 },
        { section: 'site', key: 'favicon', value: '/favicon.ico', type: 'image', displayName: 'Favicon', sortOrder: 1 },
        { section: 'site', key: 'navbarLogo', value: '', type: 'image', displayName: 'Logo del Navbar', sortOrder: 2 }
      ];
      
      await this.bulkUpsertHomePageContent(heroContentData);
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(userData: { username: string; password: string; email?: string; firstName?: string; lastName?: string; role?: string }): Promise<User> {
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
    return await db.select().from(productsTable).orderBy(productsTable.createdAt);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    return product || undefined;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(productsTable).where(eq(productsTable.category, category));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(productsTable).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(productsTable)
      .set(productData)
      .where(eq(productsTable.id, id))
      .returning();
    return updatedProduct || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(productsTable).where(eq(productsTable.id, id));
    return result.rowCount > 0;
  }

  // Categories operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categoriesTable).where(eq(categoriesTable.isActive, true)).orderBy(categoriesTable.sortOrder, categoriesTable.name);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
    return category || undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, slug));
    return category || undefined;
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categoriesTable)
      .values(categoryData)
      .returning();
    return category;
  }

  async updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db
      .update(categoriesTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(categoriesTable.id, id))
      .returning();
    return category || undefined;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    return result.rowCount > 0;
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    return await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    return order || undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(ordersTable).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, id))
      .returning();
    return updatedOrder || undefined;
  }

  // User operations (required for local auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: { username: string; password: string; email?: string; firstName?: string; lastName?: string; role?: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  // Home Page Content Management
  async getHomePageContent(): Promise<HomePageContent[]> {
    return await db.select().from(homePageContent).orderBy(homePageContent.section, homePageContent.sortOrder);
  }

  async getHomePageContentBySection(section: string): Promise<HomePageContent[]> {
    return await db.select().from(homePageContent)
      .where(eq(homePageContent.section, section))
      .orderBy(homePageContent.sortOrder);
  }

  async getHomePageContentByKey(section: string, key: string): Promise<HomePageContent | undefined> {
    const [content] = await db.select().from(homePageContent)
      .where(and(eq(homePageContent.section, section), eq(homePageContent.key, key)))
      .limit(1);
    return content;
  }

  async createHomePageContent(content: InsertHomePageContent): Promise<HomePageContent> {
    const [newContent] = await db
      .insert(homePageContent)
      .values(content)
      .returning();
    return newContent;
  }

  async updateHomePageContent(id: string, content: Partial<InsertHomePageContent>): Promise<HomePageContent | undefined> {
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
    return result.rowCount > 0;
  }

  async bulkUpsertHomePageContent(contentList: InsertHomePageContent[]): Promise<HomePageContent[]> {
    const results: HomePageContent[] = [];
    for (const content of contentList) {
      const existing = await this.getHomePageContentByKey(content.section, content.key);
      if (existing) {
        const updated = await this.updateHomePageContent(existing.id, content);
        if (updated) results.push(updated);
      } else {
        const created = await this.createHomePageContent(content);
        results.push(created);
      }
    }
    return results;
  }
}

export const storage = new DatabaseStorage();
