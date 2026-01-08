import type { ShippingSettings, InsertShippingSettings } from '../entities';
import type { ShippingSettingsRepository } from '../repositories/ShippingSettingsRepository';

export class ShippingSettingsService {
  constructor(private shippingSettingsRepository: ShippingSettingsRepository) {}

  async getAll(): Promise<ShippingSettings[]> {
    return await this.shippingSettingsRepository.getAll();
  }

  async getById(id: string): Promise<ShippingSettings | undefined> {
    return await this.shippingSettingsRepository.getById(id);
  }

  async getByOrganizationId(organizationId: string): Promise<ShippingSettings | undefined> {
    return await this.shippingSettingsRepository.getByOrganizationId(organizationId);
  }

  async create(data: InsertShippingSettings): Promise<ShippingSettings> {
    // Validate organization doesn't already have shipping settings
    if (data.organizationId) {
      const existing = await this.shippingSettingsRepository.getByOrganizationId(data.organizationId);
      if (existing) {
        throw new Error('Shipping settings already exist for this organization');
      }
    }

    // Validate threshold and cost values if provided
    if (data.freeShippingThreshold !== undefined && data.freeShippingThreshold !== null && data.freeShippingThreshold < 0) {
      throw new Error('Free shipping threshold must be a positive value');
    }
    if (data.defaultShippingCost !== undefined && data.defaultShippingCost !== null && data.defaultShippingCost < 0) {
      throw new Error('Default shipping cost must be a positive value');
    }

    return await this.shippingSettingsRepository.create(data);
  }

  async update(id: string, data: Partial<InsertShippingSettings>): Promise<ShippingSettings> {
    // Validate threshold and cost values if provided
    if (data.freeShippingThreshold !== undefined && data.freeShippingThreshold !== null && data.freeShippingThreshold < 0) {
      throw new Error('Free shipping threshold must be a positive value');
    }
    if (data.defaultShippingCost !== undefined && data.defaultShippingCost !== null && data.defaultShippingCost < 0) {
      throw new Error('Default shipping cost must be a positive value');
    }

    const updated = await this.shippingSettingsRepository.update(id, data);
    if (!updated) {
      throw new Error('Shipping settings not found');
    }
    return updated;
  }

  async updateByOrganizationId(
    organizationId: string,
    data: Partial<InsertShippingSettings>
  ): Promise<ShippingSettings> {
    const existing = await this.shippingSettingsRepository.getByOrganizationId(organizationId);
    if (!existing) {
      throw new Error('Shipping settings not found for this organization');
    }
    return await this.update(existing.id, data);
  }

  async delete(id: string): Promise<boolean> {
    return await this.shippingSettingsRepository.delete(id);
  }

  async getOrCreateByOrganizationId(organizationId: string): Promise<ShippingSettings> {
    const existing = await this.shippingSettingsRepository.getByOrganizationId(organizationId);
    if (existing) {
      return existing;
    }

    // Create with default values
    return await this.shippingSettingsRepository.create({
      organizationId,
      enableLocalPickup: true,
      enableCorreosShipping: true,
      enableUberFlash: true,
    });
  }
}
