import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema, insertCategorySchema, insertHomePageContentSchema } from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService } from "./objectStorage";
import { setupAuth, isAuthenticated } from "./auth";
import { handlePresignedUpload } from "./s3-upload";
import { triggerAutoDeployment, getDeploymentStatus } from "./deployment";
import { 
  authenticateServerless, 
  requireAdminServerless, 
  requireApiKeyServerless, 
  rateLimitServerless,
  initializeDefaultApiKey,
  cleanupExpiredSessions,
  AuthenticatedRequest
} from "./middleware/serverless-auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Security middleware for serverless
  app.use(rateLimitServerless(1000, 15 * 60 * 1000)); // 1000 requests per 15 minutes
  
  // Auth middleware setup
  setupAuth(app);

  // Initialize serverless authentication components
  await initializeDefaultApiKey();
  
  // Clean up expired sessions periodically
  setInterval(cleanupExpiredSessions, 60 * 60 * 1000); // Every hour

  // Initialize default admin user if none exists
  try {
    const adminUser = await storage.getUserByUsername("admin");
    if (!adminUser) {
      await storage.createUser({
        username: "admin",
        password: await require("./auth").hashPassword("admin123"),
        email: "admin@strawberryessentials.com",
        firstName: "Admin",
        lastName: "User",
        role: "admin"
      });
      console.log("✓ Default admin user created: admin/admin123");
    }
  } catch (error) {
    console.log("Admin user initialization skipped:", (error as Error).message);
  }
  
  // Public file serving endpoint
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Object entity serving (product images)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      return res.status(404).json({ error: "Object not found" });
    }
  });

  // AWS S3 Upload endpoint (protected - admin only)
  app.post("/api/upload/presigned", authenticateServerless, requireAdminServerless, handlePresignedUpload);

  // Auto-deployment endpoints (protected - admin only)
  app.post("/api/deploy", authenticateServerless, requireAdminServerless, async (req: AuthenticatedRequest, res) => {
    try {
      const result = await triggerAutoDeployment();
      res.json(result);
    } catch (error) {
      console.error("Auto-deployment error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to start deployment" 
      });
    }
  });

  app.get("/api/deploy/status", authenticateServerless, requireAdminServerless, async (req: AuthenticatedRequest, res) => {
    try {
      const status = await getDeploymentStatus();
      res.json(status);
    } catch (error) {
      console.error("Deployment status error:", error);
      res.status(500).json({ error: "Failed to get deployment status" });
    }
  });

  // Upload URL endpoint (protected - admin only)
  app.post("/api/objects/upload", authenticateServerless, requireAdminServerless, async (req: AuthenticatedRequest, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Products API (protected with API key for public access)
  app.get("/api/products", requireApiKeyServerless, async (req, res) => {
    try {
      const { category } = req.query;
      let products;
      
      if (category && typeof category === 'string') {
        products = await storage.getProductsByCategory(category);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Categories API (protected with API key for public access)
  app.get("/api/categories", requireApiKeyServerless, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  app.post("/api/categories", authenticateServerless, requireAdminServerless, async (req: AuthenticatedRequest, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);

      // Handle image URLs if they are uploaded files
      const objectStorageService = new ObjectStorageService();
      if (categoryData.image1Url) {
        categoryData.image1Url = objectStorageService.normalizeObjectEntityPath(categoryData.image1Url);
      }
      if (categoryData.image2Url) {
        categoryData.image2Url = objectStorageService.normalizeObjectEntityPath(categoryData.image2Url);
      }

      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", authenticateServerless, requireAdminServerless, async (req: AuthenticatedRequest, res) => {
    try {
      const updates = insertCategorySchema.partial().parse(req.body);

      // Handle image URLs if they are uploaded files
      const objectStorageService = new ObjectStorageService();
      if (updates.image1Url) {
        updates.image1Url = objectStorageService.normalizeObjectEntityPath(updates.image1Url);
      }
      if (updates.image2Url) {
        updates.image2Url = objectStorageService.normalizeObjectEntityPath(updates.image2Url);
      }

      const category = await storage.updateCategory(req.params.id, updates);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", authenticateServerless, requireAdminServerless, async (req: AuthenticatedRequest, res) => {
    try {
      const deleted = await storage.deleteCategory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Category-specific products route
  app.get("/api/categories/:slug/products", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      const products = await storage.getProductsByCategory(category.slug);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", authenticateServerless, requireAdminServerless, async (req: AuthenticatedRequest, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      // Category validation will be done against the database categories

      // Handle image URL if it's an uploaded file
      if (productData.imageUrl) {
        const objectStorageService = new ObjectStorageService();
        productData.imageUrl = objectStorageService.normalizeObjectEntityPath(productData.imageUrl);
      }

      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", authenticateServerless, requireAdminServerless, async (req: AuthenticatedRequest, res) => {
    try {
      const updates = insertProductSchema.partial().parse(req.body);
      
      // Category validation will be done against the database categories

      // Handle image URL if it's an uploaded file
      if (updates.imageUrl) {
        const objectStorageService = new ObjectStorageService();
        updates.imageUrl = objectStorageService.normalizeObjectEntityPath(updates.imageUrl);
      }

      const product = await storage.updateProduct(req.params.id, updates);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", authenticateServerless, requireAdminServerless, async (req: AuthenticatedRequest, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Orders API (protected - admin only)
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ error: "Status is required" });
      }
      
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Categories endpoint
  app.get("/api/categories", async (req, res) => {
    try {
      const allCategories = await storage.getCategories();
      res.json(allCategories);
    } catch (error) {
      console.error("Error getting categories:", error);
      res.status(500).json({ error: "Failed to get categories" });
    }
  });

  // Costa Rica locations API
  app.get("/api/locations/provinces", (req, res) => {
    const provinces = [
      { code: "san-jose", name: "San José" },
      { code: "alajuela", name: "Alajuela" },
      { code: "cartago", name: "Cartago" },
      { code: "heredia", name: "Heredia" },
      { code: "guanacaste", name: "Guanacaste" },
      { code: "puntarenas", name: "Puntarenas" },
      { code: "limon", name: "Limón" }
    ];
    res.json(provinces);
  });

  app.get("/api/locations/cantons/:provinceCode", (req, res) => {
    const { provinceCode } = req.params;
    
    // Sample data - in real implementation, integrate with Costa Rica API
    const cantonsByProvince: Record<string, Array<{code: string, name: string}>> = {
      "san-jose": [
        { code: "san-jose", name: "San José" },
        { code: "escazu", name: "Escazú" },
        { code: "desamparados", name: "Desamparados" },
        { code: "puriscal", name: "Puriscal" },
        { code: "tarrazu", name: "Tarrazú" }
      ],
      "alajuela": [
        { code: "alajuela", name: "Alajuela" },
        { code: "san-ramon", name: "San Ramón" },
        { code: "grecia", name: "Grecia" },
        { code: "san-mateo", name: "San Mateo" }
      ],
      "cartago": [
        { code: "cartago", name: "Cartago" },
        { code: "paraiso", name: "Paraíso" },
        { code: "la-union", name: "La Unión" }
      ],
      "heredia": [
        { code: "heredia", name: "Heredia" },
        { code: "barva", name: "Barva" },
        { code: "santo-domingo", name: "Santo Domingo" }
      ],
      "guanacaste": [
        { code: "liberia", name: "Liberia" },
        { code: "nicoya", name: "Nicoya" },
        { code: "santa-cruz", name: "Santa Cruz" }
      ],
      "puntarenas": [
        { code: "puntarenas", name: "Puntarenas" },
        { code: "esparza", name: "Esparza" },
        { code: "buenos-aires", name: "Buenos Aires" }
      ],
      "limon": [
        { code: "limon", name: "Limón" },
        { code: "pococi", name: "Pococí" },
        { code: "siquirres", name: "Siquirres" }
      ]
    };

    const cantons = cantonsByProvince[provinceCode] || [];
    res.json(cantons);
  });

  app.get("/api/locations/districts/:provinceCode/:cantonCode", (req, res) => {
    const { provinceCode, cantonCode } = req.params;
    
    // Sample data - in real implementation, integrate with Costa Rica API
    const districtsByCantonKey = `${provinceCode}-${cantonCode}`;
    const districtsByCantonKeyMap: Record<string, Array<{code: string, name: string}>> = {
      "san-jose-san-jose": [
        { code: "carmen", name: "Carmen" },
        { code: "merced", name: "Merced" },
        { code: "hospital", name: "Hospital" },
        { code: "catedral", name: "Catedral" }
      ],
      "san-jose-escazu": [
        { code: "escazu", name: "Escazú" },
        { code: "san-antonio", name: "San Antonio" },
        { code: "san-rafael", name: "San Rafael" }
      ],
      "alajuela-alajuela": [
        { code: "alajuela", name: "Alajuela" },
        { code: "san-jose", name: "San José" },
        { code: "carrizal", name: "Carrizal" }
      ]
    };

    const districts = districtsByCantonKeyMap[districtsByCantonKey] || [];
    res.json(districts);
  });

  // Home Page Content Management API
  app.get("/api/home-content", async (req, res) => {
    try {
      const content = await storage.getHomePageContent();
      res.json(content);
    } catch (error) {
      console.error("Error getting home content:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.get("/api/home-content/:section", async (req, res) => {
    try {
      const content = await storage.getHomePageContentBySection(req.params.section);
      res.json(content);
    } catch (error) {
      console.error("Error getting home content by section:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.post("/api/home-content", authenticateServerless, requireAdminServerless, async (req: AuthenticatedRequest, res) => {
    try {
      const contentSchema = insertHomePageContentSchema;
      const validatedContent = contentSchema.parse(req.body);
      const content = await storage.createHomePageContent(validatedContent);
      res.status(201).json(content);
    } catch (error) {
      console.error("Error creating home content:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.put("/api/home-content/:id", authenticateServerless, requireAdminServerless, async (req: AuthenticatedRequest, res) => {
    try {
      const content = await storage.updateHomePageContent(req.params.id, req.body);
      if (!content) {
        return res.status(404).json({ error: "Contenido no encontrado" });
      }
      res.json(content);
    } catch (error) {
      console.error("Error updating home content:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.post("/api/home-content/bulk", authenticateServerless, requireAdminServerless, async (req: AuthenticatedRequest, res) => {
    try {
      const contentList = req.body;
      const results = await storage.bulkUpsertHomePageContent(contentList);
      res.json(results);
    } catch (error) {
      console.error("Error bulk updating home content:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.delete("/api/home-content/:id", authenticateServerless, requireAdminServerless, async (req: AuthenticatedRequest, res) => {
    try {
      const success = await storage.deleteHomePageContent(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Contenido no encontrado" });
      }
      res.status(200).json({ message: "Contenido eliminado correctamente" });
    } catch (error) {
      console.error("Error deleting home content:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
