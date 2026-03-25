import { PreDeploymentRepository, DeploymentRepository, OrganizationRepository } from '../repositories';
import { OrganizationSettingsRepository } from '../repositories/OrganizationSettingsRepository';
import { OrganizationEventPublisher } from './OrganizationEventPublisher';
import { S3Dao } from '../aws-daos';
import type { InsertDeploymentHistory } from '../entities';

export class DeploymentService {
  constructor(
    private preDeploymentRepo: PreDeploymentRepository,
    private deploymentRepo: DeploymentRepository,
    private organizationRepo: OrganizationRepository,
    private orgSettingsRepo: OrganizationSettingsRepository,
    private eventPublisher: OrganizationEventPublisher,
    private s3Dao: S3Dao
  ) {}

  async publishPreDeployment(preDeploymentId: string, organizationId: string): Promise<{ success: boolean; deploymentId?: string; error?: string }> {
    try {
      const preDeployment = await this.preDeploymentRepo.getById(preDeploymentId);
      if (!preDeployment) {
        return { success: false, error: 'Pre-deployment not found' };
      }

      const organization = await this.organizationRepo.findById(organizationId);
      if (!organization) {
        return { success: false, error: 'Organization not found' };
      }

      // Check infrastructure readiness from the organization_settings table (owned by infra microservice)
      const orgSettings = await this.orgSettingsRepo.findByOrganizationId(organizationId);

      if (!orgSettings || orgSettings.infrastructureStatus === 'pending' || orgSettings.infrastructureStatus === 'failed') {
        // Re-trigger provisioning by re-publishing the OrganizationRegistered event
        try {
          await this.eventPublisher.publishOrganizationRegistered({
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            domain: organization.customDomain ?? undefined,
            subdomain: organization.subdomain ?? undefined,
          });
        } catch (publishErr) {
          console.error('[DeploymentService] Failed to re-trigger OrganizationRegistered:', publishErr);
        }
        return { success: false, error: 'Infrastructure is being provisioned. Please try again shortly.' };
      }

      if (orgSettings.infrastructureStatus === 'provisioning') {
        return { success: false, error: 'Infrastructure is being provisioned. Please try again shortly.' };
      }

      // infrastructureStatus === 'active' — proceed with deployment
      const bucketName = orgSettings.s3BucketName;
      if (!bucketName) {
        return { success: false, error: 'Infrastructure is not fully provisioned. Please try again shortly.' };
      }

      const buildId = `build-${Date.now()}`;

      // Create deployment record
      const deployment: InsertDeploymentHistory = {
        organizationId,
        buildId,
        status: 'building',
        message: preDeployment.message || 'Publishing changes',
        startedAt: new Date(),
      };

      const createdDeployment = await this.deploymentRepo.createDeployment(deployment);

      // Upload config.json with organizationId to the provisioned S3 bucket
      await this.uploadConfigJson(bucketName, organizationId);

      // Mark pre-deployment as published
      await this.preDeploymentRepo.updatePreDeployment(preDeploymentId, {
        status: 'published',
        publishedAt: new Date(),
        buildId,
      });

      // Update deployment to success
      await this.deploymentRepo.updateDeployment(createdDeployment.id, {
        status: 'success',
        completedAt: new Date(),
        deployUrl: `https://${organization.subdomain}.j-markets.jcampos.dev`,
      });

      return { success: true, deploymentId: createdDeployment.id };
    } catch (error: any) {
      console.error('Error publishing pre-deployment:', error);
      return { success: false, error: error.message };
    }
  }

  async getDeploymentHistory(organizationId: string) {
    return this.deploymentRepo.getDeploymentHistoryByOrganization(organizationId);
  }

  async getDeploymentStatus(organizationId: string) {
    const deployments = await this.deploymentRepo.getDeploymentHistoryByOrganization(organizationId);
    const latest = deployments[0];
    return latest || { status: 'none' };
  }

  async triggerAutoDeployment(organization: any) {
    return { success: true, message: 'Deployment triggered' };
  }

  private async uploadConfigJson(bucketName: string, organizationId: string): Promise<void> {
    const config = {
      organizationId,
      mode: 'production'
    };

    await this.s3Dao.uploadFile({
      bucket: bucketName,
      key: 'config.json',
      body: JSON.stringify(config, null, 2),
      contentType: 'application/json',
      cacheControl: 'no-cache',
    });

    console.log(`✓ Uploaded config.json for organization: ${organizationId}`);
  }
}
