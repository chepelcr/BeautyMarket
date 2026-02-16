import { PreDeploymentRepository, OrganizationRepository } from '../repositories';
import { InsertPreDeployment } from '../models';
import { OrganizationInfrastructureService } from './OrganizationInfrastructureService';

export class PreDeploymentService {
  constructor(
    private preDeploymentRepository: PreDeploymentRepository,
    private organizationRepository: OrganizationRepository,
    private infrastructureService: OrganizationInfrastructureService
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
        // Update existing pre-deployment with new changes
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
      // Create new pre-deployment
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

      // Check if infrastructure needs to be provisioned (first save)
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
      const org = await this.organizationRepository.findById(organizationId);
      
      if (!org) {
        console.log('⚠️ [PreDeployment] Organization not found:', organizationId);
        return;
      }

      if (!org.infrastructureStatus || org.infrastructureStatus === 'pending' || org.infrastructureStatus === 'failed') {
        console.log(`✓ [PreDeployment] Provisioning infrastructure for organization: ${org.name}`);
        await this.infrastructureService.provisionInfrastructure(org);
      } else {
        console.log(`✓ [PreDeployment] Infrastructure already provisioned for: ${org.name} (${org.infrastructureStatus})`);
      }
    } catch (error) {
      console.error('❌ [PreDeployment] Error checking/provisioning infrastructure:', error);
    }
  }
}
