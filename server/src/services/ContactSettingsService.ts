import type { ContactSettings, InsertContactSettings } from '../entities';
import type { ContactSettingsRepository } from '../repositories/ContactSettingsRepository';

export class ContactSettingsService {
  constructor(private contactSettingsRepository: ContactSettingsRepository) {}

  async getAll(): Promise<ContactSettings[]> {
    return await this.contactSettingsRepository.getAll();
  }

  async getById(id: string): Promise<ContactSettings | undefined> {
    return await this.contactSettingsRepository.getById(id);
  }

  async getByOrganizationId(organizationId: string): Promise<ContactSettings | undefined> {
    return await this.contactSettingsRepository.getByOrganizationId(organizationId);
  }

  async create(data: InsertContactSettings): Promise<ContactSettings> {
    // Validate organization doesn't already have contact settings
    if (data.organizationId) {
      const existing = await this.contactSettingsRepository.getByOrganizationId(data.organizationId);
      if (existing) {
        throw new Error('Contact settings already exist for this organization');
      }
    }

    return await this.contactSettingsRepository.create(data);
  }

  async update(id: string, data: Partial<InsertContactSettings>): Promise<ContactSettings> {
    const updated = await this.contactSettingsRepository.update(id, data);
    if (!updated) {
      throw new Error('Contact settings not found');
    }
    return updated;
  }

  async updateByOrganizationId(
    organizationId: string,
    data: Partial<InsertContactSettings>
  ): Promise<ContactSettings> {
    const existing = await this.contactSettingsRepository.getByOrganizationId(organizationId);
    if (!existing) {
      throw new Error('Contact settings not found for this organization');
    }
    return await this.update(existing.id, data);
  }

  async delete(id: string): Promise<boolean> {
    return await this.contactSettingsRepository.delete(id);
  }

  async getOrCreateByOrganizationId(organizationId: string): Promise<ContactSettings> {
    const existing = await this.contactSettingsRepository.getByOrganizationId(organizationId);
    if (existing) {
      return existing;
    }

    // Create with empty values
    return await this.contactSettingsRepository.create({
      organizationId,
    });
  }
}
