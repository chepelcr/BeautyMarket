import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { DeploymentRepository, PreDeploymentRepository } from '../repositories';
import { productRepository, categoryRepository, homePageContentRepository } from '../dependency_injection';
import { AwsS3Service } from './AwsS3Service';
import { AwsCloudFrontService } from './AwsCloudFrontService';
import type { Organization } from '../entities';

const execAsync = promisify(exec);

export interface DeploymentStatus {
  status: 'idle' | 'building' | 'uploading' | 'success' | 'error';
  message: string;
  timestamp: Date;
  buildId?: string;
  organizationId?: string;
}

export class DeploymentService {
  private s3Service: AwsS3Service;
  private cloudfrontService: AwsCloudFrontService;
  private currentDeployments: Map<string, DeploymentStatus> = new Map();

  constructor(
    private deploymentRepository: DeploymentRepository,
    private preDeploymentRepository: PreDeploymentRepository,
    s3Service?: AwsS3Service,
    cloudfrontService?: AwsCloudFrontService
  ) {
    this.s3Service = s3Service || new AwsS3Service();
    this.cloudfrontService = cloudfrontService || new AwsCloudFrontService();
  }

  private getDeploymentStatusForOrg(organizationId: string): DeploymentStatus {
    return this.currentDeployments.get(organizationId) || {
      status: 'idle',
      message: 'Ready to deploy',
      timestamp: new Date(),
      organizationId
    };
  }

  private setDeploymentStatusForOrg(organizationId: string, status: DeploymentStatus): void {
    this.currentDeployments.set(organizationId, { ...status, organizationId });
  }

  async getDeploymentStatus(organizationId: string): Promise<DeploymentStatus> {
    return this.getDeploymentStatusForOrg(organizationId);
  }

  async getDeploymentHistory(organizationId: string) {
    return await this.deploymentRepository.getDeploymentHistoryByOrganization(organizationId);
  }

  async triggerAutoDeployment(organization: Organization): Promise<{ success: boolean; message: string }> {
    if (!organization.s3BucketName) {
      return {
        success: false,
        message: 'Organization infrastructure not provisioned. S3 bucket not found.'
      };
    }

    const currentStatus = this.getDeploymentStatusForOrg(organization.id);
    if (currentStatus.status === 'building' || currentStatus.status === 'uploading') {
      return {
        success: false,
        message: 'A deployment is already in progress for this organization'
      };
    }

    try {
      const buildId = `cms-${organization.slug}-${Date.now()}`;
      const success = await this.deployToS3(organization, buildId);

      return {
        success,
        message: success
          ? 'Deployment completed successfully!'
          : 'Deployment failed. Check server logs for details.'
      };
    } catch (error) {
      return {
        success: false,
        message: `Deployment error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async configureBucketWebsite(bucketName: string): Promise<void> {
    if (!bucketName) return;

    console.log(`🌐 Configuring S3 bucket ${bucketName} for website hosting...`);

    try {
      await this.s3Service.setBucketWebsite({
        bucket: bucketName,
        indexDocument: 'index.html',
        errorDocument: 'index.html', // Serve index.html for all 404s to enable SPA routing
      });
      console.log('✅ S3 bucket configured for SPA website hosting');
    } catch (error: any) {
      console.warn('⚠️ Could not configure bucket website settings (may need manual setup):', error.message);
    }
  }

  private async uploadFile(bucketName: string, filePath: string, key: string): Promise<void> {
    const fileContent = fs.readFileSync(filePath);
    const mime = await import('mime-types');
    const contentType = mime.lookup(filePath) || 'application/octet-stream';

    // Set cache control for different file types
    let cacheControl = 'max-age=86400'; // 1 day default
    if (contentType.startsWith('text/html')) {
      cacheControl = 'no-cache';
    } else if (contentType.startsWith('image/') || contentType.startsWith('font/')) {
      cacheControl = 'max-age=31536000'; // 1 year
    }

    await this.s3Service.uploadFile({
      bucket: bucketName,
      key,
      body: fileContent,
      contentType,
      cacheControl,
    });
  }

  private async generateStaticData(): Promise<void> {
    console.log('📄 Generating static JSON files...');

    try {
      const [products, categories, cmsContent] = await Promise.all([
        productRepository.getProducts(),
        categoryRepository.getCategories(),
        homePageContentRepository.getHomePageContent()
      ]);

      const dataDir = './dist/public/data';
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      fs.writeFileSync(path.join(dataDir, 'products.json'), JSON.stringify(products, null, 2));
      fs.writeFileSync(path.join(dataDir, 'categories.json'), JSON.stringify(categories, null, 2));
      fs.writeFileSync(path.join(dataDir, 'cms.json'), JSON.stringify(cmsContent, null, 2));

      console.log('✅ Static JSON files generated');
    } catch (error) {
      console.error('❌ Failed to generate static data:', error);
      throw error;
    }
  }

  private async uploadDirectory(bucketName: string, dirPath: string, prefix = '', preserveImages = true): Promise<void> {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const key = prefix ? `${prefix}/${file}` : file;

      // Skip existing images directory to preserve uploaded images during deployment
      if (preserveImages && key === 'images') {
        console.log(`⚠️  Skipping images directory to preserve uploaded content`);
        continue;
      }

      if (fs.statSync(filePath).isDirectory()) {
        await this.uploadDirectory(bucketName, filePath, key, preserveImages);
      } else {
        await this.uploadFile(bucketName, filePath, key);
      }
    }
  }

  private async invalidateCloudFront(cloudfrontDistributionId: string | null | undefined, paths: string[] = ['/*']): Promise<void> {
    if (!cloudfrontDistributionId) {
      console.log('⚠️  CloudFront distribution ID not configured, skipping cache invalidation');
      return;
    }

    console.log('🔄 Invalidating CloudFront cache...');

    try {
      const result = await this.cloudfrontService.createInvalidation({
        distributionId: cloudfrontDistributionId,
        paths,
        callerReference: `deployment-${Date.now()}`,
      });
      console.log(`✅ CloudFront invalidation created: ${result.invalidationId}`);
    } catch (error: any) {
      console.error('❌ Failed to invalidate CloudFront cache:', error.message);
      throw error;
    }
  }

  private async deleteExistingAssets(bucketName: string, cloudfrontDistributionId: string | null | undefined): Promise<void> {
    if (!bucketName) return;

    console.log('🗑️  Cleaning up existing client assets...');

    // List all objects
    const result = await this.s3Service.listObjects({
      bucket: bucketName,
      prefix: '',
    });

    if (result.contents.length > 0) {
      // Filter out images directory to preserve uploaded images
      const keysToDelete = result.contents
        .filter(obj => !obj.key.startsWith('images/'))
        .map(obj => obj.key);

      if (keysToDelete.length > 0) {
        await this.s3Service.deleteObjects(bucketName, keysToDelete);
        console.log(`✅ Deleted ${keysToDelete.length} existing assets (preserved images directory)`);

        // Invalidate CloudFront cache after deleting assets
        await this.invalidateCloudFront(cloudfrontDistributionId);
      }
    }
  }

  private async countFiles(dirPath: string): Promise<number> {
    let count = 0;
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        count += await this.countFiles(filePath);
      } else {
        count++;
      }
    }

    return count;
  }

  private async markPreDeploymentAsPublished(): Promise<void> {
    try {
      const activePreDeployment = await this.preDeploymentRepository.getActivePreDeployment();
      if (activePreDeployment) {
        await this.preDeploymentRepository.updatePreDeployment(activePreDeployment.id, {
          status: 'published',
          publishedAt: new Date()
        });
        console.log('✅ Pre-deployment marked as published:', activePreDeployment.id);
      }
    } catch (error: any) {
      console.warn('⚠️ Could not update pre-deployment status:', error.message);
    }
  }

  async deployToS3(organization: Organization, buildId: string = Date.now().toString()): Promise<boolean> {
    const bucketName = organization.s3BucketName;
    const cloudfrontDistributionId = organization.cloudfrontDistributionId;

    if (!bucketName) {
      throw new Error('Organization S3 bucket not provisioned');
    }

    let deploymentRecord: any;

    try {
      // Determine deploy URL - use CloudFront domain if available, otherwise subdomain
      const deployUrl = organization.cloudfrontDomain
        ? `https://${organization.cloudfrontDomain}`
        : organization.subdomain
        ? `https://${organization.subdomain}.${process.env.BASE_DOMAIN || 'jmarkets.jcampos.dev'}`
        : `https://${bucketName}.s3-website.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`;

      // Create deployment record
      deploymentRecord = await this.deploymentRepository.createDeployment({
        buildId,
        status: 'building',
        message: 'Building application...',
        deployUrl,
        organizationId: organization.id
      });

      this.setDeploymentStatusForOrg(organization.id, {
        status: 'building',
        message: 'Building application...',
        timestamp: new Date(),
        buildId,
        organizationId: organization.id
      });

      // Build the application
      console.log(`🔨 Building application for organization: ${organization.name}...`);
      const { stdout, stderr } = await execAsync('node build-static.js', {
        cwd: process.cwd(),
        timeout: 300000 // 5 minutes timeout
      });

      if (stderr && !stderr.includes('warnings')) {
        console.error('Build stderr:', stderr);
      }

      // Update deployment record to uploading
      if (deploymentRecord) {
        await this.deploymentRepository.updateDeployment(deploymentRecord.id, {
          status: 'uploading',
          message: 'Uploading to S3...'
        });
      }

      this.setDeploymentStatusForOrg(organization.id, {
        status: 'uploading',
        message: 'Uploading to S3...',
        timestamp: new Date(),
        buildId,
        organizationId: organization.id
      });

      const distFolder = './dist/public';
      if (!fs.existsSync(distFolder)) {
        throw new Error('Build folder not found. Build may have failed.');
      }

      // Generate static JSON files
      await this.generateStaticData();

      // Clean up existing assets (but preserve images)
      await this.deleteExistingAssets(bucketName, cloudfrontDistributionId);

      // Configure S3 bucket for website hosting
      await this.configureBucketWebsite(bucketName);

      // Upload to S3
      console.log(`📤 Uploading to S3 bucket: ${bucketName}...`);
      await this.uploadDirectory(bucketName, distFolder);

      // Invalidate CloudFront cache after successful upload
      console.log('🔄 Invalidating CloudFront cache for fresh content...');
      await this.invalidateCloudFront(cloudfrontDistributionId);

      // Mark active pre-deployment as published
      await this.markPreDeploymentAsPublished();

      // Update deployment record to success
      if (deploymentRecord) {
        await this.deploymentRepository.updateDeployment(deploymentRecord.id, {
          status: 'success',
          message: 'Successfully deployed!',
          completedAt: new Date(),
          filesUploaded: await this.countFiles(distFolder)
        });
      }

      this.setDeploymentStatusForOrg(organization.id, {
        status: 'success',
        message: `Successfully deployed! Website URL: ${deployUrl}`,
        timestamp: new Date(),
        buildId,
        organizationId: organization.id
      });

      console.log(`🎉 Deployment completed successfully for ${organization.name}!`);
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown deployment error';

      // Update deployment record to error
      if (deploymentRecord) {
        await this.deploymentRepository.updateDeployment(deploymentRecord.id, {
          status: 'error',
          message: `Deployment failed: ${errorMessage}`,
          completedAt: new Date(),
          errorDetails: errorMessage
        });
      }

      this.setDeploymentStatusForOrg(organization.id, {
        status: 'error',
        message: `Deployment failed: ${errorMessage}`,
        timestamp: new Date(),
        buildId,
        organizationId: organization.id
      });

      console.error(`❌ Deployment failed for ${organization.name}:`, error);
      return false;
    }
  }
}
