import type { PaymentSettings, InsertPaymentSettings } from '../entities';
import type { PaymentSettingsRepository } from '../repositories/PaymentSettingsRepository';

export class PaymentSettingsService {
  constructor(private paymentSettingsRepository: PaymentSettingsRepository) {}

  async getAll(): Promise<PaymentSettings[]> {
    return await this.paymentSettingsRepository.getAll();
  }

  async getById(id: string): Promise<PaymentSettings | undefined> {
    return await this.paymentSettingsRepository.getById(id);
  }

  async getByOrganizationId(organizationId: string): Promise<PaymentSettings | undefined> {
    return await this.paymentSettingsRepository.getByOrganizationId(organizationId);
  }

  async create(data: InsertPaymentSettings): Promise<PaymentSettings> {
    // Validate organization doesn't already have payment settings
    if (data.organizationId) {
      const existing = await this.paymentSettingsRepository.getByOrganizationId(data.organizationId);
      if (existing) {
        throw new Error('Payment settings already exist for this organization');
      }
    }

    // Validate Stripe configuration if enabled
    if (data.stripeEnabled) {
      if (!data.stripePublishableKey || !data.stripeSecretKey) {
        throw new Error('Stripe publishable key and secret key are required when Stripe is enabled');
      }
    }

    return await this.paymentSettingsRepository.create(data);
  }

  async update(id: string, data: Partial<InsertPaymentSettings>): Promise<PaymentSettings> {
    // Validate Stripe configuration if being enabled
    if (data.stripeEnabled === true) {
      const existing = await this.paymentSettingsRepository.getById(id);
      if (existing) {
        const publishableKey = data.stripePublishableKey || existing.stripePublishableKey;
        const secretKey = data.stripeSecretKey || existing.stripeSecretKey;
        if (!publishableKey || !secretKey) {
          throw new Error('Stripe publishable key and secret key are required when Stripe is enabled');
        }
      }
    }

    const updated = await this.paymentSettingsRepository.update(id, data);
    if (!updated) {
      throw new Error('Payment settings not found');
    }
    return updated;
  }

  async updateByOrganizationId(
    organizationId: string,
    data: Partial<InsertPaymentSettings>
  ): Promise<PaymentSettings> {
    const existing = await this.paymentSettingsRepository.getByOrganizationId(organizationId);
    if (!existing) {
      throw new Error('Payment settings not found for this organization');
    }
    return await this.update(existing.id, data);
  }

  async delete(id: string): Promise<boolean> {
    return await this.paymentSettingsRepository.delete(id);
  }

  async getOrCreateByOrganizationId(organizationId: string): Promise<PaymentSettings> {
    const existing = await this.paymentSettingsRepository.getByOrganizationId(organizationId);
    if (existing) {
      return existing;
    }

    // Create with default values
    return await this.paymentSettingsRepository.create({
      organizationId,
      currency: 'CRC',
      stripeEnabled: false,
      cashOnDeliveryEnabled: true,
      bankTransferEnabled: false,
    });
  }
}
