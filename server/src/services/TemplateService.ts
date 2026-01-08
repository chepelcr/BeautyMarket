import type { Template, InsertTemplate } from '../entities';
import type { TemplateRepository } from '../repositories/TemplateRepository';

export class TemplateService {
  constructor(private templateRepository: TemplateRepository) {}

  async getAll(): Promise<Template[]> {
    return await this.templateRepository.getAll();
  }

  async getAllActive(): Promise<Template[]> {
    return await this.templateRepository.getAllActive();
  }

  async getById(id: string): Promise<Template | undefined> {
    return await this.templateRepository.getById(id);
  }

  async getByName(name: string): Promise<Template | undefined> {
    return await this.templateRepository.getByName(name);
  }

  async getByCategory(category: string): Promise<Template[]> {
    return await this.templateRepository.getByCategory(category);
  }

  async create(data: InsertTemplate): Promise<Template> {
    // Validate template name is unique
    const existing = await this.templateRepository.getByName(data.name);
    if (existing) {
      throw new Error('Template name already exists');
    }

    return await this.templateRepository.create(data);
  }

  async update(id: string, data: Partial<InsertTemplate>): Promise<Template> {
    // If name is being updated, validate it's unique
    if (data.name) {
      const existing = await this.templateRepository.getByName(data.name);
      if (existing && existing.id !== id) {
        throw new Error('Template name already exists');
      }
    }

    const updated = await this.templateRepository.update(id, data);
    if (!updated) {
      throw new Error('Template not found');
    }
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return await this.templateRepository.delete(id);
  }

  async activate(id: string): Promise<Template> {
    return await this.update(id, { isActive: true });
  }

  async deactivate(id: string): Promise<Template> {
    return await this.update(id, { isActive: false });
  }

  async findActiveTemplateByName(name: string): Promise<Template | undefined> {
    const template = await this.templateRepository.getByName(name);
    if (template && template.isActive) {
      return template;
    }
    return undefined;
  }
}
