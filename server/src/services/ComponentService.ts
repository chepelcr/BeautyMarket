import type { Component, InsertComponent } from '../entities';
import type { ComponentRepository } from '../repositories/ComponentRepository';

export class ComponentService {
  constructor(private componentRepository: ComponentRepository) {}

  async getAll(): Promise<Component[]> {
    return await this.componentRepository.getAll();
  }

  async getById(id: string): Promise<Component | undefined> {
    return await this.componentRepository.getById(id);
  }

  async getByType(type: string): Promise<Component | undefined> {
    return await this.componentRepository.getByType(type);
  }

  async getSystemComponents(): Promise<Component[]> {
    return await this.componentRepository.getSystemComponents();
  }

  async getCustomComponents(): Promise<Component[]> {
    return await this.componentRepository.getCustomComponents();
  }

  async create(data: InsertComponent): Promise<Component> {
    // Validate component type is unique
    const existing = await this.componentRepository.getByType(data.type);
    if (existing) {
      throw new Error('Component type already exists');
    }

    return await this.componentRepository.create(data);
  }

  async update(id: string, data: Partial<InsertComponent>): Promise<Component> {
    // If type is being updated, validate it's unique
    if (data.type) {
      const existing = await this.componentRepository.getByType(data.type);
      if (existing && existing.id !== id) {
        throw new Error('Component type already exists');
      }
    }

    // Prevent updating system components
    const component = await this.componentRepository.getById(id);
    if (component?.isSystem && data.isSystem === false) {
      throw new Error('Cannot modify system status of system components');
    }

    const updated = await this.componentRepository.update(id, data);
    if (!updated) {
      throw new Error('Component not found');
    }
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    // Prevent deleting system components
    const component = await this.componentRepository.getById(id);
    if (component?.isSystem) {
      throw new Error('Cannot delete system components');
    }

    return await this.componentRepository.delete(id);
  }
}
