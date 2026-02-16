import { PreDeploymentRepository, DeploymentRepository, OrganizationRepository } from '../repositories';
import { OrganizationInfrastructureService } from './OrganizationInfrastructureService';
import { S3Dao } from '../aws-daos';
import type { PreDeployment, InsertDeploymentHistory } from '../entities';

export class DeploymentService {
  constructor(
    private preDeploymentRepo: PreDeploymentRepository,
    private deploymentRepo: DeploymentRepository,
    private organizationRepo: OrganizationRepository,
    private infrastructureService: OrganizationInfrastructureService,
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

      // Ensure infrastructure is provisioned - if not, trigger provisioning
      if (!organization.s3BucketName || organization.infrastructureStatus !== 'active') {
        console.log('Infrastructure not ready, triggering provisioning...');
        await this.infrastructureService.provisionInfrastructure(organization);
        
        // Refetch organization to get updated infrastructure
        const updatedOrg = await this.organizationRepo.findById(organizationId);
        if (!updatedOrg?.s3BucketName) {
          return { success: false, error: 'Failed to provision infrastructure. Please try again.' };
        }
        organization.s3BucketName = updatedOrg.s3BucketName;
        organization.cloudfrontDistributionId = updatedOrg.cloudfrontDistributionId;
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

      // Upload config.json with organizationId
      await this.uploadConfigJson(organization.s3BucketName!, organizationId);

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
        deployUrl: `https://${organization.subdomain}.jmarkets.jcampos.dev`,
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
    // Placeholder for auto-deployment logic
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
