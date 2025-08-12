// Static data for GitHub Pages deployment
import { Product, Order } from '@shared/schema';
import config from './config';

// Mock products data for static deployment
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Base Líquida Natural Glow",
    description: "Base de maquillaje con cobertura natural y acabado luminoso. Perfecta para todo tipo de piel.",
    price: 25000,
    category: "maquillaje",
    imageUrl: "https://via.placeholder.com/400x400/FFB6C1/FFFFFF?text=Base+Líquida",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    id: "2", 
    name: "Paleta de Sombras Sunset",
    description: "Paleta con 12 tonos cálidos inspirados en el atardecer. Incluye sombras mate y shimmer.",
    price: 18000,
    category: "maquillaje",
    imageUrl: "https://via.placeholder.com/400x400/FF69B4/FFFFFF?text=Paleta+Sombras",
    isActive: true,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10")
  },
  {
    id: "3",
    name: "Serum Vitamina C",
    description: "Serum antioxidante con vitamina C para iluminar y proteger la piel del daño ambiental.",
    price: 32000,
    category: "skincare",
    imageUrl: "https://via.placeholder.com/400x400/98FB98/FFFFFF?text=Serum+Vit+C",
    isActive: true,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20")
  },
  {
    id: "4",
    name: "Crema Hidratante Noche",
    description: "Crema nutritiva para uso nocturno con ácido hialurónico y péptidos regeneradores.",
    price: 28000,
    category: "skincare",
    imageUrl: "https://via.placeholder.com/400x400/87CEEB/FFFFFF?text=Crema+Noche",
    isActive: true,
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12")
  },
  {
    id: "5",
    name: "Set de Brochas Profesionales",
    description: "Kit de 8 brochas de alta calidad para aplicación perfecta de maquillaje.",
    price: 22000,
    category: "accesorios",
    imageUrl: "https://via.placeholder.com/400x400/DDA0DD/FFFFFF?text=Set+Brochas",
    isActive: true,
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-08")
  },
  {
    id: "6",
    name: "Espejo con Luz LED",
    description: "Espejo de maquillaje con iluminación LED ajustable y aumento 10x.",
    price: 45000,
    category: "accesorios",
    imageUrl: "https://via.placeholder.com/400x400/F0E68C/FFFFFF?text=Espejo+LED",
    isActive: true,
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-01-25")
  }
];

// Static data service for GitHub Pages
export class StaticDataService {
  private products: Product[] = mockProducts;
  private orders: Order[] = [];

  // Products
  async getProducts(): Promise<Product[]> {
    return this.products;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.products.filter(p => p.category === category);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.find(p => p.id === id);
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    if (!config.staticMode) {
      throw new Error('Admin functionality not available in static mode');
    }
    
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.products.push(newProduct);
    this.saveToLocalStorage();
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (!config.staticMode) {
      throw new Error('Admin functionality not available in static mode');
    }

    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Product not found');
    }

    this.products[index] = { 
      ...this.products[index], 
      ...updates, 
      updatedAt: new Date() 
    };
    
    this.saveToLocalStorage();
    return this.products[index];
  }

  async deleteProduct(id: string): Promise<void> {
    if (!config.staticMode) {
      throw new Error('Admin functionality not available in static mode');
    }

    this.products = this.products.filter(p => p.id !== id);
    this.saveToLocalStorage();
  }

  // Orders
  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    this.orders.push(newOrder);
    this.saveToLocalStorage();
    return newOrder;
  }

  // Authentication (static mode - local storage based)
  async login(username: string, password: string): Promise<{ id: string; username: string } | null> {
    if (config.staticMode) {
      // Simple static authentication
      if (username === 'admin' && password === 'admin123') {
        const user = { id: 'admin', username: 'admin' };
        localStorage.setItem('static_user', JSON.stringify(user));
        return user;
      }
    }
    return null;
  }

  async logout(): Promise<void> {
    if (config.staticMode) {
      localStorage.removeItem('static_user');
    }
  }

  async getCurrentUser(): Promise<{ id: string; username: string } | null> {
    if (config.staticMode) {
      const user = localStorage.getItem('static_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  // Persistence for static mode
  private saveToLocalStorage() {
    if (config.staticMode) {
      localStorage.setItem('static_products', JSON.stringify(this.products));
      localStorage.setItem('static_orders', JSON.stringify(this.orders));
    }
  }

  private loadFromLocalStorage() {
    if (config.staticMode) {
      const products = localStorage.getItem('static_products');
      const orders = localStorage.getItem('static_orders');
      
      if (products) {
        this.products = JSON.parse(products);
      }
      if (orders) {
        this.orders = JSON.parse(orders);
      }
    }
  }

  constructor() {
    this.loadFromLocalStorage();
  }
}

export const staticDataService = new StaticDataService();