import { PreDeploymentRepository, OrganizationRepository } from '../repositories';
import { OrganizationSettingsRepository } from '../repositories/OrganizationSettingsRepository';
import { OrganizationEventPublisher } from './OrganizationEventPublisher';
import { InsertPreDeployment } from '../models';

export class PreDeploymentService {
  constructor(
    private preDeploymentRepository: PreDeploymentRepository,
    private organizationRepository: OrganizationRepository,
    private orgSettingsRepo: OrganizationSettingsRepository,
    private eventPublisher: OrganizationEventPublisher
  ) {}

  async triggerPreDeployment(
    triggerType: 'product' | 'category' | 'cms',
    action: 'create' | 'update' | 'delete',
    entityId?: string,
    entityType?: string,
    changes?: any,
    organizationId?: string
  ): Promise<void> {
    try {
      if (!organizationId) {
        console.error('❌ [PreDeployment] organizationId is required');
        return;
      }

      console.log('🟢 [PreDeployment] Triggered:', { triggerType, action, entityId, entityType, organizationId });

      // Check if there's already an active pre-deployment for this organization
      const existingPreDeployment = await this.preDeploymentRepository.getActivePreDeployment(organizationId);

      if (existingPreDeployment) {
        console.log('🟡 [PreDeployment] Updating existing pre-deployment:', existingPreDeployment.id);
        const existingChanges = existingPreDeployment.changes as Record<string, any> || {};
        const updatedChanges = {
          ...existingChanges,
          [entityId || 'unknown']: {
            type: triggerType,
            action,
            entityType,
            changes,
            timestamp: new Date().toISOString()
          }
        };

        await this.preDeploymentRepository.updatePreDeployment(existingPreDeployment.id, {
          changes: updatedChanges,
          message: 'predeployment.multiple'
        });

        console.log('✓ Updated existing pre-deployment with new changes');
        return;
      }

      console.log('🆕 [PreDeployment] Creating new pre-deployment');
      const preDeploymentData: InsertPreDeployment = {
        organizationId,
        status: 'ready',
        triggerType,
        triggerAction: action,
        entityId,
        entityType,
        changes: {
          [entityId || 'unknown']: {
            type: triggerType,
            action,
            entityType,
            changes,
            timestamp: new Date().toISOString()
          }
        },
        message: this.getPreDeploymentMessage(triggerType, action)
      };

      await this.preDeploymentRepository.createPreDeployment(preDeploymentData);
      console.log('✓ Created new pre-deployment');

      // Check infrastructure and re-trigger provisioning if needed
      console.log('🔍 [PreDeployment] Checking infrastructure for org:', organizationId);
      await this.checkAndProvisionInfrastructure(organizationId);

    } catch (error) {
      console.error('❌ [PreDeployment] Error:', error);
    }
  }

  private getPreDeploymentMessage(triggerType: string, action: string): string {
    return `predeployment.${triggerType}.${action}`;
  }

  private async checkAndProvisionInfrastructure(organizationId: string): Promise<void> {
    try {
      const orgSettings = await this.orgSettingsRepo.findByOrganizationId(organizationId);

      if (!orgSettings || orgSettings.infrastructureStatus === 'pending' || orgSettings.infrastructureStatus === 'failed') {
        const org = await this.organizationRepository.findById(organizationId);
        if (!org) {
          console.warn('⚠️ [PreDeployment] Organization not found:', organizationId);
          return;
        }
        console.log(`🔄 [PreDeployment] Re-triggering infrastructure provisioning for: ${org.name}`);
        // Fire-and-forget — do not block the pre-deployment creation
        this.eventPublisher.publishOrganizationRegistered({
          id: org.id,
          name: org.name,
          slug: org.slug,
          domain: org.customDomain ?? undefined,
          subdomain: org.subdomain ?? undefined,
        }).catch((err) => {
          console.error('❌ [PreDeployment] Failed to publish OrganizationRegistered:', err);
        });
      } else {
        console.log(`✓ [PreDeployment] Infrastructure status for org ${organizationId}: ${orgSettings.infrastructureStatus}`);
      }
    } catch (error) {
      console.error('❌ [PreDeployment] Error checking infrastructure:', error);
    }
  }
}
