import type { Product, Category, HomePageContent } from '@shared/schema';

class OfflineDataService {
  private cache = new Map<string, any>();

  async fetchData<T>(endpoint: string): Promise<T> {
    if (this.cache.has(endpoint)) {
      return this.cache.get(endpoint);
    }

    try {
      const response = await fetch(`/data/${endpoint}.json`);
      if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
      
      const data = await response.json();
      this.cache.set(endpoint, data);
      return data;
    } catch (error) {
      console.warn(`Failed to load offline data for ${endpoint}:`, error);
      return [] as T;
    }
  }

  async getProducts(): Promise<Product[]> {
    return this.fetchData<Product[]>('products');
  }

  async getCategories(): Promise<Category[]> {
    return this.fetchData<Category[]>('categories');
  }

  async getCMSContent(): Promise<HomePageContent> {
    return this.fetchData<HomePageContent>('cms');
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(product => product.categoryId === categoryId);
  }
}

export const offlineData = new OfflineDataService();