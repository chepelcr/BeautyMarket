import type { ThemeSettings, InsertThemeSettings } from '../entities';
import type { ThemeSettingsRepository } from '../repositories/ThemeSettingsRepository';

export class ThemeSettingsService {
  constructor(private themeSettingsRepository: ThemeSettingsRepository) {}

  async getAll(): Promise<ThemeSettings[]> {
    return await this.themeSettingsRepository.getAll();
  }

  async getById(id: string): Promise<ThemeSettings | undefined> {
    return await this.themeSettingsRepository.getById(id);
  }

  async getByOrganizationId(organizationId: string): Promise<ThemeSettings | undefined> {
    return await this.themeSettingsRepository.getByOrganizationId(organizationId);
  }

  async create(data: InsertThemeSettings): Promise<ThemeSettings> {
    // Validate organization doesn't already have theme settings
    if (data.organizationId) {
      const existing = await this.themeSettingsRepository.getByOrganizationId(data.organizationId);
      if (existing) {
        throw new Error('Theme settings already exist for this organization');
      }
    }

    return await this.themeSettingsRepository.create(data);
  }

  async update(id: string, data: Partial<InsertThemeSettings>): Promise<ThemeSettings> {
    const updated = await this.themeSettingsRepository.update(id, data);
    if (!updated) {
      throw new Error('Theme settings not found');
    }
    return updated;
  }

  async updateByOrganizationId(
    organizationId: string,
    data: Partial<InsertThemeSettings>
  ): Promise<ThemeSettings> {
    const existing = await this.themeSettingsRepository.getByOrganizationId(organizationId);
    if (!existing) {
      throw new Error('Theme settings not found for this organization');
    }
    return await this.update(existing.id, data);
  }

  async delete(id: string): Promise<boolean> {
    return await this.themeSettingsRepository.delete(id);
  }

  async getOrCreateByOrganizationId(organizationId: string): Promise<ThemeSettings> {
    const existing = await this.themeSettingsRepository.getByOrganizationId(organizationId);
    if (existing) {
      return existing;
    }

    // Create with default values
    return await this.themeSettingsRepository.create({
      organizationId,
      primaryColor: '#ec4899',
      secondaryColor: '#f472b6',
      fontFamily: 'Inter',
    });
  }
}
